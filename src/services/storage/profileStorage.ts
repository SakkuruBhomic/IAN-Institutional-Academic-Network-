const DB_NAME = 'ian-profiles-db'
const DB_VERSION = 1
const STORE_NAME = 'profile-images'
const META_KEY = 'ian-profile-meta-v1'

export interface ProfileImageMeta {
  userId: string
  fileName: string
  uploadedAt: string
  mimeType: string
  size: number
}

function readMeta(): Record<string, ProfileImageMeta> {
  try {
    const raw = localStorage.getItem(META_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, ProfileImageMeta>
  } catch {
    return {}
  }
}

function writeMeta(meta: Record<string, ProfileImageMeta>) {
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
    request.onerror = () => reject(request.error ?? new Error('Unable to open profile database.'))
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
        tx.onerror = () => reject(tx.error ?? new Error('Transaction failed.'))
      })
      .catch((error) => reject(error))
  })
}

export async function saveProfileImage(file: File, userId: string): Promise<ProfileImageMeta> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image.')
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File must be smaller than 5 MB.')
  }

  const meta: ProfileImageMeta = {
    userId,
    fileName: file.name,
    uploadedAt: new Date().toISOString(),
    mimeType: file.type,
    size: file.size,
  }

  const metaMap = readMeta()
  metaMap[userId] = meta
  writeMeta(metaMap)

  await withStore('readwrite', async (store) => {
    await new Promise<void>((resolve, reject) => {
      const request = store.put(file, userId)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error ?? new Error('Upload failed.'))
    })
  })

  return meta
}

export async function getProfileImage(userId: string): Promise<Blob | null> {
  try {
    const db = await openDb()
    return await new Promise<Blob | null>((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(userId)
      request.onsuccess = () => resolve(request.result ? (request.result as Blob) : null)
      request.onerror = () => reject(request.error ?? new Error('Read failed.'))
    })
  } catch {
    return null
  }
}

export async function removeProfileImage(userId: string): Promise<void> {
  const metaMap = readMeta()
  delete metaMap[userId]
  writeMeta(metaMap)

  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(userId)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error ?? new Error('Delete failed.'))
  })
}

export async function getProfileImageUrl(userId: string): Promise<string | null> {
  const blob = await getProfileImage(userId)
  if (!blob) return null
  return URL.createObjectURL(blob)
}
