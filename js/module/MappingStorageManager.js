/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/**
 * @typedef {Object} gamepadMapping
 * @property {String} identifier human readable string to tell what this mapping is for
 * @property {?Object} windows set of buttons and axes used in Windows, should exist if the mapping is used on Windows.
 * @property {{label: String, type: String}[]} windows.buttons
 * @property {{label: String, type: String}[]} windows.axes
 * @Property {?Object} linux set of buttons and axes used in Linux, should exist if the mapping is used on Linux.
 * @property {{label: String, type: String}[]} linux.buttons
 * @property {{label: String, type: String}[]} linux.axes
 */
/**
 * @typedef {string} gamepadId 8-digit hexadecimal string
 */

class MappingStorageManager {
  /**
   * @param {?gamepadMapping[]} newMappings all mappings to store on the computer
   */
  constructor (newMappings) {
    this.platform = undefined
    this.decidePlatform()
    this.mappings = {}
    if (newMappings && typeof newMappings === 'object') {
      this.mappings = newMappings
      this.store()
    } else {
      this.load()
    }
  }
  
  static announceMessage(message, type) {
    const messageType = {
      log: 'log',
      error: 'error'
    }
    window.dispatchEvent(new CustomEvent('mappingManagerMessage', {
      detail: {
        type: messageType[type] || messageType.log,
        message: message
      }
    }))
  }

  /* I assume OBS is used on either Windows or Linux,
  and since `navigator.platform` values for Windows are in a common pattern,
  I will check if it's Windows or not. */
  decidePlatform () {
    this.platform =
      navigator.platform.match(/^Win/) ? 'Windows' : 'Linux'
  }
  
  addOrUpdate (gamepadId, mappingObj) {
    this.mappings[gamepadId] = mappingObj
  }
  
  remove (gamepadId) {
    delete this.mappings[gamepadId]
  }

  store () {
    if (
      this.mappings.constructor === Object &&
      Object.keys(this.mappings).length > 0
    ) {
      const mappingsJSON = JSON.stringify(this.mappings)
      window.localStorage.setItem('mappings', mappingsJSON)
  
      MappingStorageManager.announceMessage(
        Object.keys(JSON.parse(mappingsJSON)).length + ' mappings stored.'
      )
    }
  
    MappingStorageManager.announceMessage(
      'No mappings to store.'
    )
  }

  load () {
    const mappingsObj = JSON.parse(window.localStorage.getItem('mappings'))
    this.mappings = mappingsObj || {}
  
    MappingStorageManager.announceMessage(
      Object.keys(this.mappings).length + ' mappings found.'
    )
  }
}
