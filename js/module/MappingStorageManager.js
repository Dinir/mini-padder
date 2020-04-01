/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/**
 * @typedef gamepadMapping
 * @type {Object}
 * @description contains which function of a gamepad can be found in which index of axis or buttons in the corresponding Gamepad object.
 * @property {String} name human readable string to tell what this mapping is for
 * @property {String[]} properties gamepad-specific features. All strings in this array should be defined in a render logic.
 *
 * @property {Object.<string, (number|Object.<string, number>)>} axes
 *
 * @property {number} axes.deadzone define the end of a range of value which shouldn't be treated as an actual movement. 0 is at the center, 1 is the end of the axis.
 * @property {{x: number, y: number, button: number}} axes.left indexes of axes and a button for left thumb stick
 * @property {{x: number, y: number, button: number}} axes.right numbers of axes and a button for right thumb stick
 *
 * @property {Object.<string, Object.<string, number>>} buttons
 *
 * @property {Object.<string, number>} buttons.dpad indexes of buttons for dpad. When a gamepad conveys the dpad state using an axis, there should be `axis` and `precision` properties, also direction properties should then point at values the axis represents when the dpad is pressed so, instead of the indexs of each buttons for dpad.
 * @property {number} buttons.dpad.up
 * @property {number} buttons.dpad.down
 * @property {number} buttons.dpad.left
 * @property {number} buttons.dpad.right
 * @property {number} [buttons.dpad.axis] the axis dpad state is conveyed
 * @property {number} [buttons.dpad.precision] range used to define if current axis value is 'close enough' to a value defined in direction properties
 * @property {number} [buttons.dpad.upright]
 * @property {number} [buttons.dpad.downright]
 * @property {number} [buttons.dpad.downleft]
 * @property {number} [buttons.dpad.upleft]
 *
 * @property {Object.<string, number>} buttons.face
 * @property {number} buttons.face.down index of down face button. Typically A in XInput controllers.
 * @property {number} buttons.face.right index of right face button. Typically B in XInput controllers.
 * @property {number} buttons.face.left index of left face button. Typically X in XInput controllers.
 * @property {number} buttons.face.up index of up face button. Typically Y in XInput controllers.
 * @property {number} buttons.face.select index of select button
 * @property {number} buttons.face.start index of start button
 * @property {number} [buttons.face.home] index of home button. Typically a logo button in gamepads.
 * @property {number} [buttons.face.touchpad] index of the touchpad button on DualShock4 controller. It can only track the click the touchpad makes.
 *
 * @property {Object.<string, number>} buttons.shoulder
 * @property {number} buttons.shoulder.l1
 * @property {number} buttons.shoulder.r1
 * @property {number} [buttons.shoulder.l2]
 * @property {number} [buttons.shoulder.r2]
 *
 */
/**
 * @typedef {string} gamepadId 8-digit hexadecimal string
 */

class MappingStorageManager {
  /**
   * @param {?gamepadMapping[]} newMappings all mappings to store on the computer. Key should be the gamepadId value.
   */
  constructor (newMappings) {
    this.mappings = {}
    if (MappingStorageManager.validateMappings(newMappings)) {
      this.mappings = newMappings
      this.store()
    } else {
      this.load()
    }
  }
  
  static validateMappings (mappings) {
    return (mappings &&
            typeof mappings === 'object' &&
            Object.keys(mappings).length > 0) || false
  }
  static announceMessage (message, type) {
    const messageType = {
      log: 'log',
      error: 'error'
    }
    window.dispatchEvent(new CustomEvent('GPVMessage', {
      detail: {
        from: 'Mapping Manager',
        type: messageType[type] || messageType.log,
        message: message
      }
    }))
  }
  
  addOrUpdate (gamepadId, mappingObj) {
    this.mappings[gamepadId] = mappingObj
  }
  remove (gamepadId) {
    delete this.mappings[gamepadId]
  }

  store () {
    if (MappingStorageManager.validateMappings(this.mappings)) {
      const mappingsJSON = JSON.stringify(this.mappings)
      window.localStorage.setItem('mappings', mappingsJSON)
  
      MappingStorageManager.announceMessage(
        Object.keys(JSON.parse(mappingsJSON)).length + ' mappings stored.'
      )
      return true
    } else {
      MappingStorageManager.announceMessage(
        'No mappings to store.'
      )
      return false
    }
  }
  load () {
    const mappingsObj = JSON.parse(window.localStorage.getItem('mappings'))
    this.mappings = mappingsObj || {}
  
    MappingStorageManager.announceMessage(
      Object.keys(this.mappings).length + ' mappings found.'
    )
    
    return true
  }
}
