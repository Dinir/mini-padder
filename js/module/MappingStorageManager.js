/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/**
 * @typedef gamepadMapping
 * @type {Object}
 * @description contains which function of a gamepad can be found in which index of axis or buttons in the corresponding Gamepad object.
 * @property {String} name human readable string to tell what this mapping is for
 * @property {String[]} properties gamepad-specific features. All strings in this array should be defined in a render logic.
 *
 * @property {Object.<string, (number|Object.<string, number>)>} sticks
 *
 * @property {number} sticks.deadzone define the end of a range of value which shouldn't be treated as an actual movement. 0 is at the center, 1 is the end of the axis.
 * @property {{x: number, y: number, button: number}} sticks.left indexes of axes and a button for left thumb stick
 * @property {{x: number, y: number, button: number}} sticks.right numbers of axes and a button for right thumb stick
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
/**
 * @typedef {Object} GamepadChange
 * @description
 * This object contains axes and buttons data from Gamepad with 'delta' property added to each.
 * Unchanged values will be represented as null.
 *
 * Rules about when something is `null`:
 * - gamepad didn't change - `GamepadChange` will be `null`.
 * - an axis didn't change - `GamepadChange.axes[a]` will be `null`.
 * - a button didn't change - `GamepadChange.buttons[b]` will be `null`.
 * `GamepadChange.axes` will always be an array with the length of the number of known axes.
 * `GamepadChange.buttons` will always be an array with the length of the number of known buttons.
 *
 * @property {Object.<string, string>} id `gamepad.id` formatted into the name and the vendor-product code.
 * @property {string} id.name name of the gamepad
 * @property {string} id.id vendor-product code of the gamepad
 * @property {(?axisChange)[]} axes
 * @property {(?buttonChange)[]} buttons
 */
/**
 * @typedef axisChange
 * @type {Object}
 * @property {number} value value Raw value of the axis.
 * @property {number} delta value Represents how much it moved from the last position.
 */
/**
 * @typedef buttonChange
 * @type {Object}
 * @property {boolean} pressed Tells if the button is pressed.
 * @property {number} value State of the button. 0 when not pressed, 1 when fully pressed. Can be a number between 0 and 1 if the button is an analog kind.
 * @property {number} delta Represents how much it moved from the last position.
 */
/** @typedef processedGamepadChange
 *
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
    
    window.addEventListener(
      'gamepadChange', this.processGamepadChange.bind(this)
    )
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
  static announceGamepadChange(processedGamepadChange) {
    window.dispatchEvent(new CustomEvent('processedGamepadChange', {
      detail: processedGamepadChange
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
    if (MappingStorageManager.validateMappings(mappingsObj)) {
      this.mappings = mappingsObj || this.mappings
  
      MappingStorageManager.announceMessage(
        Object.keys(this.mappings).length + ' mappings found.'
      )
      return true
    } else {
      MappingStorageManager.announceMessage(
        'Mappings couldn\'t be loaded.', 'error'
      )
      return false
    }
  }
  
  processGamepadChange (e) {
    /**
     * @description contains GamepadChange.
     * Unchanged input in a GamepadChange will be represented as `null`.
     * @type {Object}
     * @property {?GamepadChange} [0]
     * @property {?GamepadChange} [1]
     * @property {?GamepadChange} [2]
     * @property {?GamepadChange} [3]
     * @property {number} length will always be 4 until Gamepad API changes.
     */
    const changes = e.detail
    /**
     * @description contains GamepadChange formatted by the given mapping.
     * @type {Object}
     * @property {?{id: gamepadId, axes: Object, buttons: Object}} [0]
     * @property {?{id: gamepadId, axes: Object, buttons: Object}} [1]
     * @property {?{id: gamepadId, axes: Object, buttons: Object}} [2]
     * @property {?{id: gamepadId, axes: Object, buttons: Object}} [3]
     * @property {number} length will always be 4 until Gamepad API changes.
     * Rules about when to give `null`:
     * - gamepad didn't change - `processedChanges[i]` will be `null`.
     * - axis doesn't change - `processedChanges[i].axes[side]` will be `null`.
     * - dpad doesn't change - `processedChanges[i].buttons.dpad` will be `null`.
     * - dpad has few buttons changed - `processedChanges[i].buttons.dpad[direction]` unchanged ones will be `null`.
     * - all buttons in a side doesn't change - `processedChanges[i].buttons.(face/shoulder)` will be `null`.
     * - few buttons changed - `processedChanges[i].buttons.(face/shoulder)[name]` will be `null`.
     */
    const processedChanges = {}
    processedChanges.length = changes.length
    
    // for each gamepadChange
    for (let i = 0; i < changes.length; i++) {
      if (!changes[i]) {
        processedChanges[i] = null
        continue
      }
      const change = changes[i]
      processedChanges[i] = {}
      const processedChange = processedChanges[i]
      
      // handle the case where gamepadId is not found
      processedChange.id = change.id.gamepadId === 'XInput?' ?
        'XInput' : change.id.gamepadId
      processedChange.sticks = {}
      processedChange.buttons = {}
      // handle the case where mapping for the gamepadId is not found
      // check a 'vender id' one, then if it's not found
      // assign DInput standard
      const mapping =
        this.mappings[processedChange.id] ||
        this.mappings[processedChange.id.slice(0,4)] ||
        this.mappings['DInput']
      const properties = mapping.properties
      
      // sticks.left and sticks.right
      processedChange.sticks = MappingStorageManager.processSticks(
        mapping.sticks, change.axes, change.buttons
      )
      
      // buttons.dpad
      // 'axisdpad': axis is dpad - certain axis represents dpad
      if (properties.some(v => v === 'axisdpad')) {
        processedChange.buttons.dpad = MappingStorageManager.processAxisDpad(
          mapping.buttons.dpad, change.axes[mapping.buttons.dpad.axis]
        )
      } else {
        // dpad is reasonably found as simple and clean four buttons
        processedChange.buttons.dpad = MappingStorageManager.processDpadSimple(
          mapping.buttons.dpad, change.buttons
        )
      }
      
      // buttons.face and buttons.shoulder
      Object.assign(
        processedChange.buttons,
        MappingStorageManager.processButtons(mapping.buttons, change.buttons)
      )
    }
    
    // dispatch the processed change
    if (
      Object.keys(processedChanges).length &&
      processedChanges[0] ||
      processedChanges[1] ||
      processedChanges[2] ||
      processedChanges[3]
    ) {
      MappingStorageManager.announceGamepadChange(processedChanges)
    }
  }
  
  static processSticks (mappingSticks, changeAxes, changeButtons) {
    const processedChangeSticks = {}
    const deadzone = mappingSticks.deadzone || 0
    
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? 'left' : 'right'
      const mappingStick = mappingSticks[side]
      if (!mappingStick) {
        // this is a case the stick is not even listed on the mapping
        // should I keep the `null`?
        processedChangeSticks[side] = null
        continue
      }
      
      const value = [
        changeAxes[mappingStick.x],
        changeAxes[mappingStick.y],
      ]
      const hasButtonChange =
        mappingStick.button && changeButtons[mappingStick.button]
      if (hasButtonChange) {
        value.push(changeButtons[mappingStick.button])
      } else if (value.every(v => v === null)) {
        // if `hasButtonChange` is true, that means there IS a change
        // hence only checking the stick for changes after checking the button
        processedChangeSticks[side] = null
        continue
      }
      
      // assign changes
      processedChangeSticks[side] = {
        value: [ null, null ],
        delta: [ null, null ]
      }
      for (let i = 0; i < value.length; i++) {
        if (!value[i]) { continue }
        processedChangeSticks[side].value[i] = value[i].value
        processedChangeSticks[side].delta[i] = value[i].delta
      }
      
      // tells if the stick is active
      let isActive = false
      if (hasButtonChange) {
        processedChangeSticks[side].pressed = value[2].pressed
        isActive = value[2].pressed
      }
      isActive = isActive ||
                 (value[0] ? Math.abs(value[0].value) > deadzone : false) ||
                 (value[1] ? Math.abs(value[1].value) > deadzone : false)
      processedChangeSticks[side].active = isActive
    }
    
    return processedChangeSticks
  }
  
  static processAxisDpad (mappingDpad, changeAxis) {
    if (!changeAxis) { return null }
    
    const value = changeAxis.value
    const processedChangeButtonsDpad = {
      up:    { value: 0 },
      down:  { value: 0 },
      left:  { value: 0 },
      right: { value: 0 }
    }
  
    // check if neutral
    if (value > 1 || value === 0) {
      // the value is 0 when connected and recognized,
      // and it's 23/7 when returned to its neutral position.
      return processedChangeButtonsDpad
    }
    
    // find the direction
    /*
    converting up ~ upleft to 0 ~ 7,
    in a clockwise order.
    if I can be certain every dinput dpad value works in the same way I could make this much simpler...
     */
    const directions = [
      mappingDpad.up,
      mappingDpad.upright,
      mappingDpad.right,
      mappingDpad.downright,
      mappingDpad.down,
      mappingDpad.downleft,
      mappingDpad.left,
      mappingDpad.upleft,
    ]
    const directionConverted = [
      [1,0,0,0],
      [1,0,0,1],
      [0,0,0,1],
      [0,1,0,1],
      [0,1,0,0],
      [0,1,1,0],
      [0,0,1,0],
      [1,0,1,0]
    ]
    const precision = mappingDpad.precision
    const direction = directions.findIndex( d =>
      Math.abs(value - d) < precision
    )
    
    if (direction === -1) {
      // it's not neutral but also not in any direction
      return processedChangeButtonsDpad
    }
    
    processedChangeButtonsDpad.up.value =
      directionConverted[direction][0]
    processedChangeButtonsDpad.down.value =
      directionConverted[direction][1]
    processedChangeButtonsDpad.left.value =
      directionConverted[direction][2]
    processedChangeButtonsDpad.right.value =
      directionConverted[direction][3]
    
    return processedChangeButtonsDpad
  }
  
  static processDpadSimple (mappingDpad, changeButtons) {
    const directions = ['up', 'down', 'left', 'right']
    const values = Array(4).fill(null)
    
    for (let d = 0; d < directions.length; d++) {
      values[d] = changeButtons[mappingDpad[directions[d]]] || null
    }
    
    if (values.every(v => v === null)) { return null }
    
    return {
      up:    values[0],
      down:  values[1],
      left:  values[2],
      right: values[3]
    }
  }
  
  static processButtons (mappingButtons, changeButtons) {
    const processedChangeButtons = {}
    const buttonSide = ['face', 'shoulder']
    const buttonIndex = [
      [
        'down', 'right', 'left', 'up', 'select', 'start', 'home', 'touchpad'
      ],
      [
        'l1', 'r1', 'l2', 'r2'
      ]
    ]
    
    for (let s = 0; s < buttonSide.length; s++) {
      const side = buttonSide[s]
      if (!mappingButtons[side]) {
        // same concern as in `processAxes`.
        // this is a case the side is not even on the mapping.
        processedChangeButtons[side] = null
        continue
      }
      const mappingButtonsSide = mappingButtons[side]
      const index = buttonIndex[s]
      processedChangeButtons[side] = {}
      
      for (let i = 0; i < index.length; i++) {
        const buttonName = index[i]
        const mappingButtonsSideIndex = mappingButtonsSide[buttonName]
        if (mappingButtonsSideIndex === false) {
          processedChangeButtons[side][buttonName] = null
          continue
        }
        processedChangeButtons[side][buttonName] =
          changeButtons[mappingButtonsSideIndex] || null
      }
    }
    
    return processedChangeButtons
  }
}
