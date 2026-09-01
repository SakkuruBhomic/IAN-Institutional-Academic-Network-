import { ATTACHMENTS_BUCKET, isSupabaseConfigured, supabase } from '../../lib/supabaseClient'
import type { AttachmentItem } from '../../types'

const DB_NAME = 'ian-attachment-db'
const DB_VERSION = 1
const STORE_NAME = 'files'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this browser.'))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Unable to open attachment database.'))
  })
}

async function saveToIndexedDb(storageKey: string, file: File): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const request = tx.objectStore(STORE_NAME).put(file, storageKey)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error ?? new Error('File upload failed.'))
  })
}

async function readFromIndexedDb(storageKey: string): Promise<Blob | null> {
  try {
    const db = await openDb()
    return await new Promise<Blob | null>((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(storageKey)
      request.onsuccess = () => resolve(request.result ? (request.result as Blob) : null)
      request.onerror = () => reject(request.error ?? new Error('Unable to read attachment.'))
    })
  } catch {
    return null
  }
}

async function deleteFromIndexedDb(storageKey: string): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(storageKey)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error ?? new Error('Unable to delete attachment.'))
  })
}

export async function saveAttachment(file: File, requestId: string, uploadedBy: string): Promise<AttachmentItem> {
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  const storageKey = `${requestId}/${id}-${file.name}`
  const metadata: AttachmentItem = {
    id,
    requestId,
    fileName: file.name,
    fileType: file.name.split('.').pop()?.toUpperCase() ?? 'FILE',
    fileSize: file.size,
    uploadedBy,
    uploadedAt: new Date().toISOString(),
    storageKey,
    mimeType: file.type || 'application/octet-stream',
  }

  if (!isSupabaseConfigured) {
    // No shared backend configured — persist locally so the file isn't lost,
    // even though it won't be visible from other devices.
    await saveToIndexedDb(storageKey, file)
    return metadata
  }

  const { error } = await supabase.storage.from(ATTACHMENTS_BUCKET).upload(storageKey, file, {
    contentType: metadata.mimeType,
    upsert: false,
  })
  if (error) throw error

  return metadata
}

export async function getAttachment(storageKey: string): Promise<Blob | null> {
  if (!isSupabaseConfigured) return readFromIndexedDb(storageKey)
  const { data, error } = await supabase.storage.from(ATTACHMENTS_BUCKET).download(storageKey)
  if (error) return null
  return data
}

// Attachment metadata now lives on the request row itself (requests.attachments).
// This remains only as a defensive fallback for callers that render before the
// request has loaded; the primary source of truth is always request.attachments.
export async function getRequestAttachments(_requestId: string): Promise<AttachmentItem[]> {
  return []
}

export async function deleteAttachment(storageKey: string): Promise<void> {
  if (!isSupabaseConfigured) {
    await deleteFromIndexedDb(storageKey)
    return
  }
  await supabase.storage.from(ATTACHMENTS_BUCKET).remove([storageKey])
}

export function formatAttachmentSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export function isSupportedAttachmentType(file: File) {
  const accepted = ['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  return accepted.includes(extension)
}
