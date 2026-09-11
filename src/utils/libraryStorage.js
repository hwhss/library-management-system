import { initialLibraryData } from '../mock/initialData.js'

export const LIBRARY_STORAGE_KEY = 'library_mock_data'

function cloneData(data) {
  return JSON.parse(JSON.stringify(data))
}

export function initializeLibraryData() {
  const existingData = localStorage.getItem(LIBRARY_STORAGE_KEY)

  if (existingData) {
    return cloneData(JSON.parse(existingData))
  }

  const seedData = cloneData(initialLibraryData)
  localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(seedData))
  return seedData
}

export function getLibraryData() {
  return initializeLibraryData()
}

export function saveLibraryData(data) {
  const savedData = cloneData(data)
  localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(savedData))
  return savedData
}

export function resetLibraryData() {
  const seedData = cloneData(initialLibraryData)
  localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(seedData))
  return seedData
}
