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

  /* I assume OBS is used on either Windows or Linux,
  and since `navigator.platform` values for Windows are in a common pattern,
  I will check if it's Windows or not. */
  decidePlatform () {
    this.platform =
      navigator.platform.match(/^Win/) ? 'Windows' : 'Linux'
  }
  
  add (gamepadId, mappingObj) {
    this.mappings[gamepadId] = mappingObj
  }
  
  remove (gamepadId) {
    delete this.mappings[gamepadId]
  }

  store () {
    if (
      Object.keys(this.mappings).length === 0 &&
      this.mappings.constructor === Object
    ) {
      console.info('No mappings to store.')
    } else {
      const mappingsJSON = JSON.stringify(this.mappings)
      window.localStorage.setItem('mappings', mappingsJSON)
      console.info(
        Object.keys(JSON.parse(mappingsJSON)).length +
        ' mappings stored.'
      )
    }
  }

  load () {
    const mappingsObj = JSON.parse(window.localStorage.getItem('mappings'))
    this.mappings = mappingsObj || {}
    console.info(
      Object.keys(this.mappings).length +
      ' mappings found.'
    )
  }
  
  /**
   * force store default mappings to localStorage,
   * then load that to the instance.
   */
  initiate () {
    const defaultMappings = {
      "XInput": {
        "identifier": "XInput",
        "Windows": {
          "buttons": [
            { "label": "A", "type": "button" },
            { "label": "B", "type": "button" },
            { "label": "X", "type": "button" },
            { "label": "Y", "type": "button" },
            { "label": "LB", "type": "button" },
            { "label": "RB", "type": "button" },
            { "label": "LT", "type": "button" },
            { "label": "RT", "type": "button" },
            { "label": "Se", "type": "button" },
            { "label": "St", "type": "button" },
            { "label": "L", "type": "button thumb" },
            { "label": "R", "type": "button thumb" },
            { "label": "⏶", "type": "button" },
            { "label": "⏷", "type": "button" },
            { "label": "⏴", "type": "button" },
            { "label": "⏵", "type": "button" }
          ],
          "axes": [
            { "label": "L", "type": "thumb" },
            { "label": "L", "type": "thumb" },
            { "label": "R", "type": "thumb" },
            { "label": "R", "type": "thumb" }
          ]
        }
      },
      "045e02d1": {
        "identifier": "Xbox Pad",
        "Linux": {
          "buttons": [
            { "label": "A", "type": "button" },
            { "label": "B", "type": "button" },
            { "label": "X", "type": "button" },
            { "label": "Y", "type": "button" },
            { "label": "LB", "type": "button" },
            { "label": "RB", "type": "button" },
            { "label": "LT", "type": "button shoulder" },
            { "label": "RT", "type": "button shoulder" },
            { "label": "Se", "type": "button" },
            { "label": "St", "type": "button" },
            { "label": "L", "type": "button thumb" },
            { "label": "R", "type": "button thumb" },
            { "label": "⏶", "type": "button" },
            { "label": "⏷", "type": "button" },
            { "label": "⏴", "type": "button" },
            { "label": "⏵", "type": "button" },
            { "label": "ⓧ", "type": "button" }
          ],
          "axes": [
            { "label": "L", "type": "thumb" },
            { "label": "L", "type": "thumb" },
            { "label": "R", "type": "thumb" },
            { "label": "R", "type": "thumb" }
          ]
        }
      },
      "054c05c4": {
        "identifier": "DualShock 4 (CUH-ZCT1x)",
        "Windows": {
          "buttons": [
            { "label": "X", "type": "button" },
            { "label": "◯", "type": "button" },
            { "label": "□", "type": "button" },
            { "label": "Δ", "type": "button" },
            { "label": "L1", "type": "button" },
            { "label": "R1", "type": "button" },
            { "label": "L2", "type": "button" },
            { "label": "R2", "type": "button" },
            { "label": "Sh", "type": "button" },
            { "label": "Op", "type": "button" },
            { "label": "L", "type": "button thumb" },
            { "label": "R", "type": "button thumb" },
            { "label": "⏶", "type": "button" },
            { "label": "⏷", "type": "button" },
            { "label": "⏴", "type": "button" },
            { "label": "⏵", "type": "button" },
            { "label": "PS", "type": "button" },
            { "label": "TP", "type": "button" }
          ],
          "axes": [
            { "label": "L", "type": "thumb" },
            { "label": "L", "type": "thumb" },
            { "label": "R", "type": "thumb" },
            { "label": "R", "type": "thumb" }
          ]
        },
        "Linux": {
          "buttons": [
            { "label": "X", "type": "button" },
            { "label": "◯", "type": "button" },
            { "label": "□", "type": "button" },
            { "label": "Δ", "type": "button" },
            { "label": "L1", "type": "button" },
            { "label": "R1", "type": "button" },
            { "label": "L2", "type": "button" },
            { "label": "R2", "type": "button" },
            { "label": "Sh", "type": "button" },
            { "label": "Op", "type": "button" },
            { "label": "L", "type": "button thumb" },
            { "label": "R", "type": "button thumb" },
            { "label": "⏶", "type": "button" },
            { "label": "⏷", "type": "button" },
            { "label": "⏴", "type": "button" },
            { "label": "⏵", "type": "button" },
            { "label": "PS", "type": "button" },
            { "label": "TP", "type": "button" }
          ],
          "axes": [
            { "label": "L", "type": "thumb" },
            { "label": "L", "type": "thumb" },
            { "label": "R", "type": "thumb" },
            { "label": "R", "type": "thumb" }
          ]
        }
      },
      "054c09cc": {
        "identifier": "DualShock 4 (CUH-ZCT2x)",
        "Windows": {
          "buttons": [
            { "label": "X", "type": "button" },
            { "label": "◯", "type": "button" },
            { "label": "□", "type": "button" },
            { "label": "Δ", "type": "button" },
            { "label": "L1", "type": "button" },
            { "label": "R1", "type": "button" },
            { "label": "L2", "type": "button" },
            { "label": "R2", "type": "button" },
            { "label": "Sh", "type": "button" },
            { "label": "Op", "type": "button" },
            { "label": "L", "type": "button thumb" },
            { "label": "R", "type": "button thumb" },
            { "label": "⏶", "type": "button" },
            { "label": "⏷", "type": "button" },
            { "label": "⏴", "type": "button" },
            { "label": "⏵", "type": "button" },
            { "label": "PS", "type": "button" },
            { "label": "TP", "type": "button" }
          ],
          "axes": [
            { "label": "L", "type": "thumb" },
            { "label": "L", "type": "thumb" },
            { "label": "R", "type": "thumb" },
            { "label": "R", "type": "thumb" }
          ]
        },
        "Linux": {
          "buttons": [
            { "label": "X", "type": "button" },
            { "label": "◯", "type": "button" },
            { "label": "□", "type": "button" },
            { "label": "Δ", "type": "button" },
            { "label": "L1", "type": "button" },
            { "label": "R1", "type": "button" },
            { "label": "L2", "type": "button" },
            { "label": "R2", "type": "button" },
            { "label": "Sh", "type": "button" },
            { "label": "Op", "type": "button" },
            { "label": "L", "type": "button thumb" },
            { "label": "R", "type": "button thumb" },
            { "label": "⏶", "type": "button" },
            { "label": "⏷", "type": "button" },
            { "label": "⏴", "type": "button" },
            { "label": "⏵", "type": "button" },
            { "label": "PS", "type": "button" },
            { "label": "TP", "type": "button" }
          ],
          "axes": [
            { "label": "L", "type": "thumb" },
            { "label": "L", "type": "thumb" },
            { "label": "R", "type": "thumb" },
            { "label": "R", "type": "thumb" }
          ]
        }
      }
    }
  
    this.mappings = defaultMappings
    this.store()
  }
}
