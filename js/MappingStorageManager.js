/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/**
 * @typedef {Object} gamepadMapping
 * @property {String} identifier human readable string to tell what this mapping is for
 * @property {?Object} Windows set of buttons and axes used in Windows, should exist if the mapping is used on Windows.
 * @Property {?Object} Linux set of buttons and axes used in Linux, should exist if the mapping is used on Linux.]
 * @property {{label: String, type: String}[]} buttons
 * @property {{label: String, type: String}[]} axes
 */
/**
 * @typedef {string} gamepadId 8-digit hexadecimal string
 */

class MappingStorageManager {
  /**
   * @param {?gamepadMapping[]} newMappings all mappings to store on the computer
   */
  constructor (newMappings) {
    this.decidePlatform()
    if (newMappings && typeof newMappings === 'object') {
      this.mappings = newMappings
      this.store()
    } else {
      this.load()
    }
  }

  /* I assume OBS is used on either Windows or Linux,
  and since `navigator.platform` values for Windows are in a common pattern,
  I will check if it's Windows or not. */
  decidePlatform () {
    this.platform =
      navigator.platform.match(/^Win/) ? 'Windows' : 'Linux'
  }

  store () {
    if (
      Object.keys(this.mappings).length === 0 &&
      this.mappings.constructor === Object
    ) {} else {
      window.localStorage.setItem('mappings', this.mappings)
      console.info(`Mapping stored: ${window.localStorage.getItem('mappings')}`)
    }
  }

  load () {
    this.mappings = window.localStorage.getItem('mappings') || {}
    console.info(`Mapping loaded: ${this.mappings}`)
  }

  add (gamepadId, mappingObj) {
    this.mappings[gamepadId] = mappingObj
  }
  
  remove (gamepadId) {
    delete this.mappings[gamepadId]
  }
}
