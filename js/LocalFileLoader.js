/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable new-cap */
class LocalJSONLoader {
  constructor (defaultFilePath, loadOnInstantiation) {
    if (defaultFilePath) {
      this.defaultFilePath = defaultFilePath
    }
    if (loadOnInstantiation) {
      return this.load()
    }
  }

  load (filePath) {
    const fileToLoad = filePath || this.defaultFilePath || null
    if (fileToLoad && typeof fileToLoad === 'string') {
      return new Promise((resolve, reject) => {
        fetch(fileToLoad)
          .then(response => response.json())
          .then(file => resolve(file))
          .catch(error => reject(new Error(error)))
      })
    } else {
      return new Promise.reject(new Error('filePath is not valid.'))
    }
  }
}
