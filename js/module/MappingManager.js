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
 * @typedef {Object} ProcessedGamepadChange
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
 * @typedef {{value: number}} basicButtonChange Contains value change made on a single button of a gamepad.
 */

/**
 * @event MappingManager#processedGamepadChange
 * @type {Object}
 * @description
 * Contains changes on inputs of gamepads, mapped by a `gamepadMapping`.
 *
 * If there was no changes for a gamepad (or it's not connected), the corresponding property will be set as null.
 *
 * @property {?ProcessedGamepadChange} detail.0
 * @property {?ProcessedGamepadChange} detail.1
 * @property {?ProcessedGamepadChange} detail.2
 * @property {?ProcessedGamepadChange} detail.3
 * @property {number} detail.length Defined so it can be iterated with for loop.
 */

/**
 * MappingManager does:
 *
 * - Imports `{@link gamepadMapping}`s, store them to and load them from the local storage
 * - Listens to custom event with name of
 * `{@link GamepadWatcher#event:gamepadChange gamepadChange}`
 * - Maps the changes using `gamepadMapping`s and dispatches a
 * `{@link MappingManager#event:processedGamepadChange processedGamepadChange}` event.
 *
 * @see gamepadMapping
 * @see {@link GamepadWatcher#event:gamepadChange gamepadChange}
 * @see ProcessedGamepadChange
 * @see {@link MappingManager#event:processedGamepadChange processedGamepadChange (event)}
 *
 * @class
 */
class MappingManager {
  /**
   * @param {?gamepadMapping[]} newMappings all mappings to store on the computer.
   * Key should be the gamepadId value.
   */
  constructor (newMappings) {
    this.mappings = {}
    this.import = this.import.bind(this)
    if (newMappings) {
      this.import(newMappings)
    } else {
      this.load()
    }
    
    this.processGamepadChange = this.processGamepadChange.bind(this)
    window.addEventListener(
      'gamepadChange', this.processGamepadChange
    )
  }
  
  static validateMappings (mappings) {
    if (
      !mappings ||
      mappings.constructor !== Object ||
      Object.keys(mappings).length === 0
    ) { return false }
    const issue = {}
    let invalidityFound = false
    for (const gamepadId in mappings) {
      if (!mappings.hasOwnProperty(gamepadId)) { continue }
      const isBasicallyObject =
        mappings[gamepadId].constructor === Object &&
        Object.keys(mappings[gamepadId]).length > 0
      const hasInfo =
        (mappings[gamepadId].hasOwnProperty('name') && mappings[gamepadId].name.constructor === String) &&
        (mappings[gamepadId].hasOwnProperty('properties') && mappings[gamepadId].properties.constructor === Array)
      const hasMapping =
        (mappings[gamepadId].hasOwnProperty('sticks') && mappings[gamepadId].sticks.constructor === Object) &&
        (mappings[gamepadId].hasOwnProperty('buttons') && mappings[gamepadId].buttons.constructor === Object)
      
      issue[gamepadId] = {
        valid: isBasicallyObject && hasInfo && hasMapping,
        isBasicallyObject,
        hasInfo,
        hasMapping
      }
    }
    
    for (const gamepadId in issue) {
      if (!issue.hasOwnProperty(gamepadId)) { continue }
      if (!issue[gamepadId].valid) {
        invalidityFound = true
        break
      }
    }
    
    if (!invalidityFound) { return true }
    else {
      return issue
    }
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
  /**
   * Dispatch an event of 'processedGamepadChange' type
   * with data of mapped changes included in it.
   * @param {Object.<ProcessedGamepadChange, number>} processedGamepadChange
   * @fires MappingManager#processedGamepadChange
   */
  static announceGamepadChange(processedGamepadChange) {
    window.dispatchEvent(new CustomEvent('processedGamepadChange', {
      detail: processedGamepadChange
    }))
  }
  
  // these are methods made for
  // making changes without losing the reference to mappings
  addOrUpdate (gamepadId, mappingObj) {
    this.mappings[gamepadId] = mappingObj
  }
  remove (gamepadId) {
    delete this.mappings[gamepadId]
  }
  removeAll () {
    for (const gamepadId in this.mappings) {
      if (!this.mappings.hasOwnProperty(gamepadId)) { continue }
      this.remove(gamepadId)
    }
  }
  
  import (exportedMappings) {
    const mappingsAreValid = MappingManager.validateMappings(exportedMappings)
    if (mappingsAreValid !== true) {
      MappingManager.announceMessage(
        {
          message: 'Some of the given mappings are not valid.',
          detail: mappingsAreValid
        },
        'error'
      )
      return mappingsAreValid
    }
    this.removeAll()
    for (const gamepadId in exportedMappings) {
      if (!exportedMappings.hasOwnProperty(gamepadId)) { continue }
      this.addOrUpdate(gamepadId, exportedMappings[gamepadId])
    }
    MappingManager.announceMessage(
      `Imported ${Object.keys(exportedMappings).length} mappings.`
    )
    
    return this.store()
  }
  store () {
    const mappingsAreValid = MappingManager.validateMappings(this.mappings)
    if (mappingsAreValid === true) {
      const mappingsJSON = JSON.stringify(this.mappings)
      window.localStorage.setItem('mappings', mappingsJSON)
  
      MappingManager.announceMessage(
        Object.keys(JSON.parse(mappingsJSON)).length +
        ' mappings stored in the local storage.'
      )
      return true
    } else {
      MappingManager.announceMessage(
        {
          message: 'Some mappings loaded at the moment are not valid.',
          detail: mappingsAreValid
        },
        'error'
      )
      return false
    }
  }
  load () {
    const mappingsFromStorage = JSON.parse(window.localStorage.getItem('mappings'))
    MappingManager.announceMessage(
      'Loading stored mappings from the local storage...'
    )
    const mappingsAreValid = MappingManager.validateMappings(mappingsFromStorage)
    if (mappingsAreValid !== true) {
      MappingManager.announceMessage(
        {
          message: 'Some mappings stored in the local storage are invalid!\n' +
                   'Default mappings for standards will be loaded and stored.',
          detail: mappingsAreValid
        }
      )
      return this.initiate()
    }
    
    this.removeAll()
    for (const gamepadId in mappingsFromStorage) {
      if (!mappingsFromStorage.hasOwnProperty(gamepadId)) { continue }
      this.addOrUpdate(gamepadId, mappingsFromStorage[gamepadId])
    }
    MappingManager.announceMessage(
      Object.keys(this.mappings).length + ' mappings found.'
    )
    
    return true
  }
  
  /**
   * @param {GamepadWatcher#event:gamepadChange} e
   * @listens GamepadWatcher#event:gamepadChange
   */
  processGamepadChange (e) {
    const changes = e.detail
    /**
     * If there was no changes for a gamepad (or it's not connected), the corresponding property will be set as null.
     *
     * @type {Object}
     * @property {?ProcessedGamepadChange} 0
     * @property {?ProcessedGamepadChange} 1
     * @property {?ProcessedGamepadChange} 2
     * @property {?ProcessedGamepadChange} 3
     * @property {number} length Defined so it can be iterated with for loop.
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
      if (properties.indexOf('nosticks') === -1) {
        // 'nosticks' : no analog sticks on the gamepad
        processedChange.sticks = MappingManager.processSticks(
          mapping.sticks, change.axes, change.buttons
        )
      }
      
      // buttons.dpad
      if (properties.indexOf('axisdpad') !== -1) {
        // 'axisdpad': axis is dpad - certain axes represent dpad
        if (properties.indexOf('nodpad') !== -1) {
          // 'nodpad': no dpad on gamepad - signal is probably coming from a physical stick
          processedChange.buttons.dpad = null
          if (
            (processedChange.sticks.left && processedChange.sticks.left.active) ||
            (processedChange.sticks.right && processedChange.sticks.right.active)
          ) {
            // An active signal was interpreted already. Nothing to do here.
          } else {
            // No way to know if the stick signal is sent as that of left/right stick,
            // but both sticks are read as inactive at the moment
            // so maybe I can try reading a dpad axis signal as that of left stick.
            processedChange.sticks.left = MappingManager.processDpadAsLeftStick(
              mapping.buttons.dpad, change.axes[mapping.buttons.dpad.axis]
            )
          }
        } else {
          // this is a weird gamepad
          processedChange.buttons.dpad = MappingManager.processAxisDpad(
            mapping.buttons.dpad, change.axes[mapping.buttons.dpad.axis]
          )
        }
      } else {
        // dpad is reasonably found as simple and clean four buttons
        processedChange.buttons.dpad = MappingManager.processDpadSimple(
          mapping.buttons.dpad, change.buttons
        )
      }
      
      // buttons.face and buttons.shoulder
      Object.assign(
        processedChange.buttons,
        MappingManager.processButtons(mapping.buttons, change.buttons)
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
      MappingManager.announceGamepadChange(processedChanges)
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
  
  static convertAxisDpadValue (
    value, asAxis = true,
    directionValues = [-1, -0.8, -0.5, -0.2, 0.1, 0.4, 0.7, 1],
    precision = 0.1
  ) {
    const conversionTable = asAxis ? [
      [ 0, -1, null],
      [ 1, -1, null],
      [ 1,  0, null],
      [ 1,  1, null],
      [ 0,  1, null],
      [-1,  1, null],
      [-1,  0, null],
      [-1, -1, null]
    ] : [
      [1,0,0,0],
      [1,0,0,1],
      [0,0,0,1],
      [0,1,0,1],
      [0,1,0,0],
      [0,1,1,0],
      [0,0,1,0],
      [1,0,1,0]
    ]
    
    const directionIndex = directionValues.findIndex( d =>
      Math.abs(value - d) < precision
    )
    
    if (directionIndex === -1) { return null }
    
    return conversionTable[directionIndex]
  }
  
  static processAxisDpad (mappingDpad, changeAxis) {
    if (!changeAxis) { return null }
    
    const value = changeAxis.value
    const previousValue = value - changeAxis.delta
  
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
    const neutralValues = [0, 0, 0, 0]
  
    // the value is 0 when connected and recognized,
    // and it's 23/7 when returned to its neutral position.
    // active value can be negative or 1, and not 0.
    const dpadValues = (value > 1 || value === 0) ?
      neutralValues : MappingManager.convertAxisDpadValue(
        value, false, directions, mappingDpad.precision
      ) || neutralValues
    
    const dpadPreviousValues = (previousValue > 1 || previousValue === 0) ?
      neutralValues : MappingManager.convertAxisDpadValue(
        previousValue, false, directions, mappingDpad.precision
      ) || neutralValues
  
    const processedChangeButtonsDpad =
      { up: {}, down: {}, left: {}, right: {} }
    processedChangeButtonsDpad.up = {
      value: dpadValues[0], delta: dpadValues[0] - dpadPreviousValues[0]
    }
    processedChangeButtonsDpad.down = {
      value: dpadValues[1], delta: dpadValues[1] - dpadPreviousValues[1]
    }
    processedChangeButtonsDpad.left = {
      value: dpadValues[2], delta: dpadValues[2] - dpadPreviousValues[2]
    }
    processedChangeButtonsDpad.right = {
      value: dpadValues[3], delta: dpadValues[3] - dpadPreviousValues[3]
    }
    
    return processedChangeButtonsDpad
  }
  
  static processDpadAsLeftStick (mappingDpad, changeAxis) {
    if (!changeAxis) { return null }
    
    const value = changeAxis.value
    const delta = changeAxis.delta
    const previousValue = value - delta
    // the value is 0 when connected and recognized,
    // and it's 23/7 when returned to its neutral position.
    // active value can be negative or 1, and not 0.
    const active = value !== 0 && value <= 1
  
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
    const neutralValues = [0, 0, null]
  
    const stickValues = active ? MappingManager.convertAxisDpadValue(
      value, true, directions, mappingDpad.precision
    ) || neutralValues : neutralValues
  
    const stickPreviousValues = previousValue !== 0 && previousValue <= 1 ?
      MappingManager.convertAxisDpadValue(
        delta, true, directions, mappingDpad.precision
      ) || neutralValues : neutralValues
    
    const deltaValues = [
      stickValues[0] - stickPreviousValues[0],
      stickValues[1] - stickPreviousValues[1],
      null
    ]
    
    return {
      value: stickValues,
      delta: deltaValues,
      active: active
    }
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
    const defaultMappings = {
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
    return this.import(defaultMappings)
  }
}
