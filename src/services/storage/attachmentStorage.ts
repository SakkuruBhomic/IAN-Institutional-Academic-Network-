import type { AttachmentItem } from '../../types'

const META_KEY = 'ian-attachment-meta-v1'
const DB_NAME = 'ian-attachment-db'
const DB_VERSION = 1
const STORE_NAME = 'files'

function readMeta(): Record<string, AttachmentItem> {
  try {
    const raw = localStorage.getItem(META_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, AttachmentItem>
  } catch {
    return {}
  }
}

function writeMeta(meta: Record<string, AttachmentItem>) {
  localStorage.setItem(META_KEY, JSON.stringify(meta))
}

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

async function withStore<T>(mode: IDBTransactionMode, callback: (store: IDBObjectStore) => Promise<T>): Promise<T> {
  const db = await openDb()
  return await new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode)
    const store = tx.objectStore(STORE_NAME)

    callback(store)
      .then((result) => {
        tx.oncomplete = () => resolve(result)
        tx.onerror = () => reject(tx.error ?? new Error('Storage transaction failed.'))
      })
      .catch((error) => reject(error))
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

  const meta = readMeta()
  meta[storageKey] = metadata
  writeMeta(meta)

  await withStore('readwrite', async (store) => {
    await new Promise<void>((resolve, reject) => {
      const request = store.put(file, storageKey)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error ?? new Error('File upload failed.'))
    })
  })

  return metadata
}

export async function getAttachment(storageKey: string): Promise<Blob | null> {
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

export async function getRequestAttachments(requestId: string): Promise<AttachmentItem[]> {
  const meta = readMeta()
  return Object.values(meta)
    .filter((item) => item.requestId === requestId)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
}

export async function deleteAttachment(storageKey: string): Promise<void> {
  const meta = readMeta()
  delete meta[storageKey]
  writeMeta(meta)

  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(storageKey)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error ?? new Error('Unable to delete attachment.'))
  })
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
