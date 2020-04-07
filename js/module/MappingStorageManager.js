/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/**
 * @typedef {Object} gamepadMapping
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
 * @property {Object.<string, number>} buttons.dpad
 * indexes of buttons for dpad. When a gamepad conveys the dpad state using an axis, there should be `axis` and `precision` properties, also direction properties should then point at values the axis represents when the dpad is pressed so, instead of the indexs of each buttons for dpad.
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
 * indexes of face buttons.
 * @property {number} buttons.face.down 'A' on XInput, 'X' on DInput
 * @property {number} buttons.face.right 'B' on XInput, 'o' on DInput
 * @property {number} buttons.face.left 'X' on XInput, '□' on DInput
 * @property {number} buttons.face.up 'Y' on XInput, 'Δ' on DInput
 * @property {number} buttons.face.select '⧉' on XInput, 'Share' on DInput
 * @property {number} buttons.face.start '≡' on XInput, 'Options' on DInput
 * @property {number} [buttons.face.home] Logo button
 * @property {number} [buttons.face.touchpad] Touchpad on standard DInput gamepad.
 * It can only track the click the touchpad makes.
 *
 * @property {Object.<string, number>} buttons.shoulder
 * indexes of shoulder buttons.
 * @property {number} buttons.shoulder.l1 'LB' on XInput, 'L1' on DInput
 * @property {number} buttons.shoulder.r1 'RB' on XInput, 'R1' on DInput
 * @property {number} [buttons.shoulder.l2] 'LT' on XInput, 'L2' on DInput
 * @property {number} [buttons.shoulder.r2] 'RT' on XInput, 'R2' on DInput
 *
 */
/**
 * @typedef {Object} processedGamepadChange
 * @description
 * This object contains input changes of a gamepad, arranged by a corresponding mapping.
 * This doesn't carry the whole state, only the changes made on the gamepad.
 *
 * @property {Object} id `Gamepad.id` formatted into the name and the gamepadId.
 * @property {string} id.name
 * @property {gamepadId} id.gamepadId
 *
 * @property {Object.<string, ?stickChange>} sticks
 *
 * @property {?stickChange} sticks.left
 * @property {?stickChange} sticks.right
 *
 * @property {Object.<string, Object.<string, ?(buttonChange|basicButtonChange)>>} buttons
 *
 * @property {?Object.<string, ?(buttonChange|basicButtonChange)>} buttons.dpad
 * It will contain null when it's not using an axis as a dpad input, and there's no change on it.
 * It will contain basicButtonChange if it's using an axis as a dpad input.
 * @property {?(buttonChange|basicButtonChange)} buttons.dpad.up
 * @property {?(buttonChange|basicButtonChange)} buttons.dpad.down
 * @property {?(buttonChange|basicButtonChange)} buttons.dpad.left
 * @property {?(buttonChange|basicButtonChange)} buttons.dpad.right
 *
 * @property {?Object.<string, ?buttonChange>} buttons.face
 * It will contain null when it's not on the mapping of the gamepad.
 * Otherwise it will always contain buttons as properties, each of which could be null on no changes.
 * @property {?buttonChange} buttons.face.down 'A' on XInput, 'X' on DInput
 * @property {?buttonChange} buttons.face.right 'B' on XInput, 'o' on DInput
 * @property {?buttonChange} buttons.face.left 'X' on XInput, '□' on DInput
 * @property {?buttonChange} buttons.face.up 'Y' on XInput, 'Δ' on DInput
 * @property {?buttonChange} buttons.face.select '⧉' on XInput, 'Share' on DInput
 * @property {?buttonChange} buttons.face.start '≡' on XInput, 'Options' on DInput
 * @property {?buttonChange} buttons.face.home Logo button
 * @property {?buttonChange} buttons.face.touchpad Touchpad on standard DInput gamepad
 *
 * @property {?Object.<string, ?buttonChange>} buttons.shoulder
 * It will contain null when it's not on the mapping of the gamepad.
 * Otherwise it will always contain buttons as properties, each of which could be null on no changes.
 * @property {?buttonChange} buttons.shoulder.l1 'LB' on XInput, 'L1' on DInput
 * @property {?buttonChange} buttons.shoulder.r1 'RB' on XInput, 'R1' on DInput
 * @property {?buttonChange} buttons.shoulder.l2 'LT' on XInput, 'L2' on DInput
 * @property {?buttonChange} buttons.shoulder.r2 'RT' on XInput, 'R2' on DInput
 */
/**
 * @typedef {Object} stickChange Contains changes made on a single stick of a gamepad.
 * @property {number[]} value Values of x-axis, y-axis, and a button of the stick.
 * Length of the array will be 2 if there's no change on the button.
 * @property {number[]} delta Change of the values from the last time processedGamepadChange was made.
 * @property {?boolean} pressed Indicates the state of the button. This will be null if there's no change.
 * @property {boolean} active Indicates if the stick is out of its deadzone, or the button is pressed.
 */
/**
 * @typedef {{value: string}} basicButtonChange Contains value change made on a single button of a gamepad.
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
    } else {
      MappingStorageManager.announceMessage(
        'Mappings couldn\'t be loaded. Default mappings for XInput and DInput will be loaded and stored.'
      )
      this.initiate()
    }
  }
  
  processGamepadChange (e) {
    /**
     * @description contains GamepadChange.
     * Unchanged input in a GamepadChange will be represented as `null`.
     * @type {Object}
     * @property {?GamepadChange} 0
     * @property {?GamepadChange} 1
     * @property {?GamepadChange} 2
     * @property {?GamepadChange} 3
     * @property {number} length will always be 4 until Gamepad API changes.
     */
    const changes = e.detail
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
      
      // copy the reference to the id property
      processedChange.id = change.id
      processedChange.sticks = {}
      processedChange.buttons = {}
  
      // if it's not one of two standards,
      // check vendor id, if still not known then assign DInput
      /* I assume gamepads have xinput mode beside
       their own mode that could be fit as dinput */
      const mapping =
        this.mappings[processedChange.id.gamepadId] ||
        this.mappings[processedChange.id.gamepadId.slice(0,4)] ||
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
        mappingStick.button ?
          changeButtons[mappingStick.button] : null
      ]
      if (
        value[0] === null &&
        value[1] === null &&
        value[2] === null
      ) {
        processedChangeSticks[side] = null
        continue
      }
      
      // assign changes
      processedChangeSticks[side] = {
        value: Array(3).fill(null),
        delta: Array(3).fill(null)
      }
      for (let i = 0; i < value.length; i++) {
        if (!value[i]) { continue }
        processedChangeSticks[side].value[i] = value[i].value
        processedChangeSticks[side].delta[i] = value[i].delta
      }
      
      // tells if the stick is active
      let isActive = false
      processedChangeSticks[side].pressed =
        value[2] ? value[2].pressed : null
      isActive = processedChangeSticks[side].pressed ||
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
  
  /**
   * force store default mappings to localStorage,
   * then load that to the instance.
   */
  initiate () {
    this.mappings = {
      "XInput": {
        "name": "XInput Standard Controller",
        "properties": [],
        "sticks": {
          "deadzone": 0.08,
          "left": {
            "x": 0, "y": 1, "button": 10
          },
          "right": {
            "x": 2, "y": 3, "button": 11
          }
        },
        "buttons": {
          "dpad": {
            "up": 12, "down": 13, "left": 14, "right": 15
          },
          "face": {
            "down": 0, "right": 1, "left": 2, "up": 3,
            "select": 8, "start": 9
          },
          "shoulder": {
            "l1": 4, "r1": 5, "l2": 6, "r2": 7
          }
        }
      },
      "DInput": {
        "name": "DInput Standard Controller",
        "properties": [],
        "sticks": {
          "deadzone": 0.08,
          "left": {
            "x": 0, "y": 1, "button": 10
          },
          "right": {
            "x": 2, "y": 3, "button": 11
          }
        },
        "buttons": {
          "dpad": {
            "up": 12, "down": 13, "left": 14, "right": 15
          },
          "face": {
            "down": 0, "right": 1, "left": 2, "up": 3,
            "select": 8, "start": 9,
            "home": 16, "touchpad": 17
          },
          "shoulder": {
            "l1": 4, "r1": 5, "l2": 6, "r2": 7
          }
        }
      }
    }
    this.store()
  }
}
