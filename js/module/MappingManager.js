/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/**
 * @typedef {Object} gamepadMapping
 * @description contains which function of a gamepad can be found in which index of axis or buttons in the corresponding Gamepad object.
 * @property {String} name human readable string to tell what this mapping is for
 * @property {String[]} properties gamepad-specific features. All strings in this array should be defined in a render logic.
 *
 * @property {?Object.<string, (number|Object.<string, number>)>} sticks
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
 * @property {gamepadId} mappingId gamepadId of a mapping used for producing this ProcessedGamepadChange.
 *
 * @property {string[]} properties
 * List of known keywords representing a state this change should be treated as.
 * @property {string[]} message
 * Messages with each line in each index, for GamepadRenderer to display.
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
    /**
     * @typedef {Object} assignmentState
     * @property {boolean} ongoing
     * @property {number} index
     * @property {?boolean} result
     * @property {Object} data
     * */
    /** @type {assignmentState[]} */
    this.assignmentState = Array(4)
    for (let i = 0; i < this.assignmentState.length; i++) {
      this.assignmentState[i] = { ongoing: false, index: -1, result: null }
    }
    
    /**
     * Remember the whole state of dpad for each gamepad.
     * This makes it possible to convert separate dpad button inputs into
     * one axis input.
     * @type {number[][]}
     */
    this.dpadState = Array(4)
    for (let i = 0; i < this.dpadState.length; i++) {
      this.dpadState[i] = [0, 0]
    }
  
    this.import = this.import.bind(this)
    if (newMappings) {
      this.import(newMappings)
    } else {
      this.load()
    }
    
    this.startAssignment = this.startAssignment.bind(this)
    
    this.processGamepadChange = this.processGamepadChange.bind(this)
    window.addEventListener(
      'gamepadChange', this.processGamepadChange
    )
  }
  
  static announceMessage = MPCommon.announceMessageFrom('Mapping Manager')
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
  
  static validateMappings (mappings) {
    if (
      !mappings ||
      mappings.constructor !== Object ||
      Object.keys(mappings).length === 0
    ) {
      return {
        valid: false,
        isBasicallyObject: false
      }
    }
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
  
  /**
   * set deadzone to the referenced mapping and return the value
   *
   * @param {?Object.<string, (number|Object.<string, number>)>} stickMappings
   * @param {?axisChange[]} changeAxes
   *
   * @returns {?number} deadzone value, `null` if proper stick values were not found
   */
  static setDeadzone (stickMappings, changeAxes) {
    if (!stickMappings) { return 0 }
    
    let maximumLSValueOnIdle = 0
    let maximumRSValueOnIdle = 0
    if (
      stickMappings.left &&
      stickMappings.left.x !== null && stickMappings.left.y !== null
    ) {
      maximumLSValueOnIdle = Math.max(
        Math.abs(changeAxes[stickMappings.left.x].value),
        Math.abs(changeAxes[stickMappings.left.y].value)
      )
    }
    if (
      stickMappings.right &&
      stickMappings.right.x !== null && stickMappings.right.y !== null
    ) {
      maximumRSValueOnIdle = Math.max(
        Math.abs(changeAxes[stickMappings.right.x].value),
        Math.abs(changeAxes[stickMappings.right.y].value)
      )
    }
    
    const maximumValueOnIdle = Math.max(
      maximumLSValueOnIdle, maximumRSValueOnIdle
    )
    
    if (isNaN(maximumValueOnIdle)) {
      MappingManager.announceMessage(
        new Error(
          'Couldn\'t find proper stick values. ' +
          `LS: ${maximumLSValueOnIdle}, RS: ${maximumRSValueOnIdle}`
        )
      )
      return null
    }
    
    // by dividing at 0.04 most idle values will be multiplied into range of 0.07 ~ 0.1
    // I think this is enough but who knows what wild gamepads exist in this world
    const multiplier = maximumValueOnIdle > 0.04 ? 1.5 : 2
    
    const multipliedMaximumValue =
      multiplier * Math.min(0.125, maximumValueOnIdle)
    const firstDigitPosition = multipliedMaximumValue === 0 ?
      0 : Math.floor(Math.log10(multipliedMaximumValue))
    // round up from the second valid digit
    const deadzone =
      Math.round( multipliedMaximumValue * 10 ** ( -1 * firstDigitPosition) ) *
      10 ** firstDigitPosition
    
    stickMappings.deadzone = deadzone
    
    return deadzone
  }
  static get everyButtonInfo () {
    return [
      {
        label: 'face-down (A/×)',
        group: 'buttons',
        virtualInput: { "face": { "down": { "value": 1 } } },
        mapInput: (m, i) => {m.buttons.face.down = i}
      }, 
      {
        label: 'face-right (B/○)',
        group: 'buttons',
        virtualInput: { "face": { "right": { "value": 1 } } },
        mapInput: (m, i) => {m.buttons.face.right = i}
      }, 
      {
        label: 'face-up (Y/Δ)',
        group: 'buttons',
        virtualInput: { "face": { "up": { "value": 1 } } },
        mapInput: (m, i) => {m.buttons.face.up = i}
      }, 
      {
        label: 'face-left (X/□)',
        group: 'buttons',
        virtualInput: { "face": { "left": { "value": 1 } } },
        mapInput: (m, i) => {m.buttons.face.left = i}
      },
      {
        label: 'dpad-down',
        group: 'buttons',
        virtualInput: { "dpad": { "down": { "value": 1 }, "value": { "value": [0,1] } } },
        mapInput: (m, i) => {m.buttons.dpad.down = i},
        mapInputAxis: (m, i) => {m.buttons.dpad.axis = i},
        nullInput: m => {m.buttons.dpad = null}
      }, 
      {
        label: 'dpad-left',
        group: 'buttons',
        virtualInput: { "dpad": { "left": { "value": 1 }, "value": { "value": [-1,0] } } },
        mapInput: (m, i) => {m.buttons.dpad.left = i}
      }, 
      {
        label: 'dpad-up',
        group: 'buttons',
        virtualInput: { "dpad": { "up": { "value": 1 }, "value": { "value": [0,-1] } } },
        mapInput: (m, i) => {m.buttons.dpad.up = i}
      }, 
      {
        label: 'dpad-right',
        group: 'buttons',
        virtualInput: { "dpad": { "right": { "value": 1 }, "value": { "value": [1,0] } } },
        mapInput: (m, i) => {m.buttons.dpad.right = i}
      },
      {
        label: 'select',
        group: 'buttons',
        virtualInput: { "face": { "select": { "value": 1 } } },
        mapInput: (m, i) => {m.buttons.face.select = i}
      }, 
      {
        label: 'start',
        group: 'buttons',
        virtualInput: { "face": { "start": { "value": 1 } } },
        mapInput: (m, i) => {m.buttons.face.start = i}
      }, 
      {
        label: 'home',
        group: 'buttons',
        virtualInput:  { "face": { "home": { "value": 1 } } },
        mapInput: (m, i) => {m.buttons.face.home = i}
      }, 
      {
        label: 'touchpad',
        group: 'buttons',
        virtualInput: { "face": { "touchpad": { "value": 1 } } },
        mapInput: (m, i) => {m.buttons.face.touchpad = i}
      },
      {
        label: 'lb/l1',
        group: 'buttons',
        virtualInput: { "shoulder": { "l1": { "value": 1 } } },
        mapInput: (m, i) => {m.buttons.shoulder.l1 = i},
        nullInput: m => {m.buttons.shoulder = null}
      }, 
      {
        label: 'rb/r1',
        group: 'buttons',
        virtualInput:  { "shoulder": { "r1": { "value": 1 } } },
        mapInput: (m, i) => {m.buttons.shoulder.r1 = i}
      }, 
      {
        label: 'lt/l2',
        group: 'buttons',
        virtualInput: { "shoulder": { "l2": { "value": 1 } } },
        mapInput: (m, i) => {m.buttons.shoulder.l2 = i}
      }, 
      {
        label: 'rt/r2',
        group: 'buttons',
        virtualInput: { "shoulder": { "r2": { "value": 1 } } },
        mapInput: (m, i) => {m.buttons.shoulder.r2 = i}
      },
      {
        label: 'left stick to right',
        group: 'axes',
        renderGroup: 'sticks',
        virtualInput: { "left": {
            "value": [1, 0, null],
            "pressed": null,
            "active": true
        } },
        mapInput: (m, i) => {m.sticks.left.x = i},
        nullInput: m => {
          m.sticks.left.x = null
          m.sticks.left.y = null
        }
      }, 
      {
        label: 'left stick to down',
        group: 'axes',
        renderGroup: 'sticks',
        virtualInput: { "left": {
            "value": [0, 1, null],
            "pressed": null,
            "active": true
        } },
        mapInput: (m, i) => {m.sticks.left.y = i}
      }, 
      {
        label: 'left stick button',
        group: 'buttons',
        renderGroup: 'sticks',
        virtualInput: { "left": {
            "value": [0, 0, 1],
            "pressed": true,
            "active": true
        } },
        mapInput: (m, i) => {
          if (m.sticks.left.x !== null || m.sticks.left.y !== null) {
            m.sticks.left.button = i
          } else {
            m.sticks.left = null
          }
          m.buttons.face.l3 = i
        }
      },
      {
        label: 'right stick to right',
        group: 'axes',
        renderGroup: 'sticks',
        virtualInput: { "right": {
            "value": [1, 0, null],
            "pressed": null,
            "active": true
        } },
        mapInput: (m, i) => {m.sticks.right.x = i},
        nullInput: m => {
          m.sticks.right.x = null
          m.sticks.right.y = null
        }
      }, 
      {
        label: 'right stick to down',
        group: 'axes',
        renderGroup: 'sticks',
        virtualInput: { "right": {
            "value": [0, 1, null],
            "pressed": null,
            "active": true
        } },
        mapInput: (m, i) => {m.sticks.right.y = i}
      }, 
      {
        label: 'right stick button',
        group: 'buttons',
        renderGroup: 'sticks',
        virtualInput: { "right": {
            "value": [0, 0, 1],
            "pressed": true,
            "active": true
        } },
        mapInput: (m, i) => {
          if (m.sticks.right.x !== null || m.sticks.right.y !== null) {
            m.sticks.right.button = i
          } else {
            m.sticks.right = null
            // put 'nosticks' property if no stick axes were assigned
            if (m.sticks.left === null) {
              if (m.properties.indexOf('nosticks') === -1) {
                m.properties.push('nosticks')
              }
            }
          }
          m.buttons.face.r3 = i
        }
      }
    ]
  }
  
  startAssignment (gamepadIndex, name, gamepadId) {
    if (this.assignmentState[gamepadIndex].ongoing) {
      // called again while assignment is going, cancel the process
      this.assignmentState[gamepadIndex].result = 'force-abort'
      return
    }
    this.assignmentState[gamepadIndex].ongoing = true
    this.assignmentState[gamepadIndex].index = -1
    this.assignmentState[gamepadIndex].result = null
    // reference to this property won't be kept
    this.assignmentState[gamepadIndex].data = {
      gamepadId: gamepadId,
      occupied: {
        axes: [],
        buttons: []
      },
      mapping: {
        name: name,
        properties: [],
        sticks: {
          deadzone: 0,
          left: {},
          right: {}
        },
        buttons: {
          dpad: {},
          face: {},
          shoulder: {}
        }
      }
    }
  }
  /**
   *
   * @param {number} gamepadIndex
   * @param {GamepadChange} gamepadChange If called inside `processGamepadChange`, it will always have a change
   * @param {ProcessedGamepadChange} processedGamepadChangeTemplate
   * put 'this button is awaiting for input' signal to the change object in 'processGamepadChange' via the reference
   */
  assign (gamepadIndex, gamepadChange, processedGamepadChangeTemplate) {
    const assignmentState = this.assignmentState[gamepadIndex]
    processedGamepadChangeTemplate.properties = ['assigning']
    
    // assigning is finished
    if (assignmentState.result !== null) {
      assignmentState.ongoing = false
      if (!assignmentState.result) {
        // aborted
        delete assignmentState.data
        return
      } else if (assignmentState.result === 'force-abort') {
        assignmentState.result = false
        processedGamepadChangeTemplate.properties.splice(
          processedGamepadChangeTemplate.properties.indexOf('assigning'), 1
        )
        processedGamepadChangeTemplate.message = ['Assignment Aborted.']
        return
      }
      
      // store the new mapping
      this.addOrUpdate(assignmentState.data.gamepadId, assignmentState.data.mapping)
      this.store()
      
      return
    }
  
    // find new input change
    /*
     some axes are staying at -1, while most are at 0
     axisdpad will stay at ~3.2.
     Guess I won't use `Math.abs` for axes and instead go for just > 0.1.
     This will be broken if there's a gamepad with axis inverted by default.
     */
    const foundIndexes = [
      gamepadChange.axes.findIndex(v => v && v.value > 0.1 && v.value <= 1),
      gamepadChange.buttons.findIndex(v => v && Math.abs(v.value) > 0.5)
    ]
    const inputFound = foundIndexes.some(v => v !== -1)
    
    // assigning is in progress
    let buttonInfo
    const allButtonMapped = assignmentState.index === MappingManager.everyButtonInfo.length
    
    if (assignmentState.index === -1) {
      // initiating the routine for the first time
      buttonInfo =
        MappingManager.everyButtonInfo[++assignmentState.index]
    } else {
      // the routine is already on
      
      // bring the button information for the index,
      // and index of inputs found on gamepad
      buttonInfo =
        MappingManager.everyButtonInfo[assignmentState.index]
      
      if (inputFound) {
        // input is found
        const axisNotAssigned =
          assignmentState.data.occupied.axes.indexOf(foundIndexes[0]) === -1
        const buttonNotAssigned =
          assignmentState.data.occupied.buttons.indexOf(foundIndexes[1]) === -1
        
        let inputToBeSkipped = false, aborting = false
        if (assignmentState.index > 1) {
          inputToBeSkipped =
            foundIndexes[1] === assignmentState.data.mapping.buttons.face.down
          aborting =
            foundIndexes[1] === assignmentState.data.mapping.buttons.face.right
        }
        
        if (aborting && !allButtonMapped) {
          // 'abort' input received
          assignmentState.result = false
          processedGamepadChangeTemplate.properties.splice(
            processedGamepadChangeTemplate.properties.indexOf('assigning'), 1
          )
          processedGamepadChangeTemplate.message = ['Assignment Aborted.']
        } else if (inputToBeSkipped && !allButtonMapped) {
          // 'skip' input received
          // update index
          switch (assignmentState.index) {
            case 4: // dpad-down
              buttonInfo.nullInput(assignmentState.data.mapping)
              // fallthrough
            case 5: // dpad-left
            case 6: // dpad-up
            case 7: // dpad-right
              assignmentState.index = 8
              break
            case 12: // lb/l1
              buttonInfo.nullInput(assignmentState.data.mapping)
              // fallthrough
            case 14: // lt/l2
              assignmentState.index = 16
              break
            case 16: // stick-left-x
              buttonInfo.nullInput(assignmentState.data.mapping)
              assignmentState.index = 18
              break
            case 19: // stick-right-x
              buttonInfo.nullInput(assignmentState.data.mapping)
              assignmentState.index = 21
              break
            default:
              buttonInfo.mapInput(assignmentState.data.mapping, null)
              assignmentState.index++
              break
          }
          // update buttonInfo with new index
          buttonInfo =
            MappingManager.everyButtonInfo[assignmentState.index]
        } else {
          // no 'abort' or 'skip' interruption received
          if (assignmentState.index === 4) {
            // own routine for dpad - the index is for dpad-down
            if (
              foundIndexes[0] !== -1 &&
              axisNotAssigned
            ) {
              // it's axisdpad!
              buttonInfo.mapInputAxis(
                assignmentState.data.mapping, foundIndexes[0]
              )
              assignmentState.data.mapping.properties.push('axisdpad')
              if (Math.abs(gamepadChange.axes[foundIndexes[0]].value - 0.1) < 0.1) {
                // it's standard axisdpad!
                assignmentState.data.occupied.axes.push(foundIndexes[0])
                assignmentState.index += 4
              } else {
                // it's a weird axisdpad...
                // work on this when such case is actually found. Below is a placeholder.
                MappingManager.announceMessage(new Error(
                  'I finally found a user of a rare dpad kind! Please contact me.'
                ))
                assignmentState.data.occupied.axes.push(foundIndexes[0])
                assignmentState.index += 4
                /*
                function getFirstDigit (x) {
                  const position = Math.floor(Math.log10(x))
                  return Math.floor(x/10**position)*10**position
                }
                 */
              }
            } else if (buttonNotAssigned) {
              // it's four button dpad
              buttonInfo.mapInput(
                assignmentState.data.mapping, foundIndexes[1]
              )
              assignmentState.index++
            }
          } else if (allButtonMapped) {
            // get the input for the last question - is it joystick?
            // inputToBeSkipped === A/× pressed === Answer is Gamepad
            // aborting === B/○ pressed === Answer is Joystick
            if (aborting) {
              const mapping = assignmentState.data.mapping
              // it is joystick, put 'joystick' to the properties array
              const wasItAxisdpad = mapping.properties.indexOf('axisdpad')
              if (wasItAxisdpad !== -1) {
                mapping.properties.splice(wasItAxisdpad, 1)
              }
              if (mapping.properties.indexOf('joystick') === -1) {
                mapping.properties.push('joystick')
              }
            }
            
            if (inputToBeSkipped || aborting) {
              // required input is found so increase the index and finish assignment
              assignmentState.index++
            }
          } else {
            // anything else than dpad-down (or whole dpad if it was axis)
            const inputGroupIndex = buttonInfo.group === 'buttons' ? 1 : 0
            const foundIndex = foundIndexes[inputGroupIndex]
            if (
              foundIndex !== -1 && (
                (inputGroupIndex === 1 && buttonNotAssigned) ||
                (inputGroupIndex === 0 && axisNotAssigned)
              )
            ) {
              buttonInfo.mapInput(
                assignmentState.data.mapping, foundIndex
              )
              assignmentState.data.occupied[buttonInfo.group].push(foundIndex)
              assignmentState.index++
            }
          }
        }
      } else {
        // input is not found
        if (assignmentState.index > 21) {
          // let's define the deadzone value for sticks
          MappingManager.setDeadzone(assignmentState.data.mapping.sticks, gamepadChange.axes)
        }
      }
    }
    
    if (assignmentState.index > MappingManager.everyButtonInfo.length) {
      // assigning is done
      assignmentState.result = true
      processedGamepadChangeTemplate.properties.splice(
        processedGamepadChangeTemplate.properties.indexOf('assigning'), 1
      )
      const isJoystick = assignmentState.data.mapping.properties.indexOf('joystick') !== -1
      processedGamepadChangeTemplate.message = [
        `${isJoystick ? 'Joystick' : 'Gamepad'} assignment done!`
      ]
    } else if (!inputFound) {
      // make the guide message for next input
      let message = []
      if (assignmentState.index <= 15) {
        // all buttons
        message.push(`Press button for ${buttonInfo.label}.`)
      } else if (assignmentState.index === 18 || assignmentState.index === 21) {
        // stick buttons
        message.push(`Press the ${buttonInfo.label}.`)
      } else if (allButtonMapped) {
        message.push('Is this a joystick?')
        message.push(`A/× - Gamepad   B/○ - Joystick  `)
      } else {
        // sticks
        message.push(`Push ${buttonInfo.label}.`)
      }
      
      if (
        assignmentState.index > 1 &&
        assignmentState.index < MappingManager.everyButtonInfo.length
      ) {
        // after assigning first two buttons,
        // use them as a control on the assignment process
        message.push(`A/× - Skip      B/○ - Abort     `)
      }
      
      if (buttonInfo) {
        processedGamepadChangeTemplate[
          buttonInfo.renderGroup || buttonInfo.group
        ] =
          buttonInfo.virtualInput
      }
      processedGamepadChangeTemplate.message = message
    }
  }
  
  // these are methods made for
  // making changes without losing the reference to 'mappings' object
  addOrUpdate (gamepadId, mappingObj) {
    if (mappingObj && mappingObj.name) {
      this.mappings[gamepadId] = mappingObj
      MappingManager.announceMessage(
        `Loaded the mapping for ${mappingObj.name}.`
      )
    } else {
      MappingManager.announceMessage(new Error(
        'There\'s a problem in the new mapping.\n' +
        JSON.stringify(mappingObj, null, 2)
      ))
    }
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
      MappingManager.announceMessage(new Error(JSON.stringify({
        message: 'Some of the given mappings are not valid.',
        detail: mappingsAreValid
      })))
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
      MappingManager.announceMessage(new Error(JSON.stringify({
        message: 'Some mappings loaded at the moment are not valid.',
        detail: mappingsAreValid
      })))
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
      Object.keys(this.mappings).length + ' mappings are loaded.'
    )
    
    return true
  }
  
  /**
   * Look for gamepadId that has a corresponding mapping and return the Id.
   * If the mapping for the exact gamepadId doesn't exist,
   * look if a mapping for the same vendor ID exists,
   * and give either the vendor ID or 'DInput'.
   * @param {gamepadId} gamepadId
   * @returns {string}
   */
  getMappedGamepadId (gamepadId) {
    // if it's not one of two standards,
    // check vendor id, if still not known then assign DInput
    /* I assume gamepads have xinput mode beside
     their own mode that could be fit as dinput */
    if (this.mappings[gamepadId]) {
      return gamepadId
    } else {
      const vendorId = gamepadId.slice(0,4)
      if (this.mappings[vendorId]) {
        return vendorId
      } else {
        return 'DInput'
      }
    }
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
  
      if (this.assignmentState[i].ongoing) {
        this.assign(i, change, processedChange)
        continue
      }
  
      const mappingId = this.getMappedGamepadId(processedChange.id.gamepadId)
      const mapping = this.mappings[mappingId]
      processedChange.mappingId = mappingId
      processedChange.properties = mapping.properties
      
      // sticks.left and sticks.right
      if (processedChange.properties.indexOf('nosticks') !== -1) {} else {
        // 'nosticks' : no analog sticks on the gamepad
        processedChange.sticks = MappingManager.processSticks(
          mapping.sticks, change.axes, change.buttons
        )
      }
  
      // buttons.dpad
      if (mapping.buttons.dpad === null) {
        processedChange.buttons.dpad = null
      } else {
        if (processedChange.properties.indexOf('joystick') !== -1) {
          // 'joystick': this is a joystick - only one of the three is active as LS: LS, RS, or Dpad.
          /*
           This property is intended to be a simpler one for 'axisdpad' + 'nodpad'.
           Since only the changes on a gamepad are received,
           signal of non-axis dpad can't be converted into a stick signal.
           */
          // check if there's already an active signal received as any of the sticks on the mapping
          if (
            (!processedChange.sticks.left || !processedChange.sticks.left.active) &&
            (!processedChange.sticks.right || !processedChange.sticks.right.active)
          ) {
            /*
             No way to know if the stick signal is being sent as that of left/right stick,
             but both sticks are seen as inactive at the moment
             so maybe I can try reading a dpad axis signal as that of left stick.
             */
            if (mapping.buttons.dpad.axis) {
              processedChange.sticks.left = MappingManager.processAxisDpadAsLeftStick(
                mapping.buttons.dpad, change.axes[mapping.buttons.dpad.axis], this.dpadState[i]
              )
            } else {
              // we're trying to simulate a gamepad as a joystick here
              processedChange.sticks.left =
                MappingManager.processDpadAsLeftStick(
                  mapping.buttons.dpad, change.buttons, this.dpadState[i]
                )
            }
          } else {
            // stick is active, don't process dpad input as a stick
          }
        } else if (processedChange.properties.indexOf('axisdpad') !== -1) {
          // 'axisdpad': axis is dpad - certain axes represent dpad
          // this is a weird gamepad
          processedChange.buttons.dpad = MappingManager.processAxisDpad(
            mapping.buttons.dpad, change.axes[mapping.buttons.dpad.axis], this.dpadState[i]
          )
        } else {
          // dpad is reasonably found as simple and clean four buttons
          processedChange.buttons.dpad = MappingManager.processDpadSimple(
            mapping.buttons.dpad, change.buttons, this.dpadState[i]
          )
        }
      }
      // include stick style dpad state
      if (
        processedChange.buttons.dpad &&
        (
          processedChange.buttons.dpad.up ||
          processedChange.buttons.dpad.down ||
          processedChange.buttons.dpad.left ||
          processedChange.buttons.dpad.right
        )
      ) {
        processedChange.buttons.dpad.value = { value: this.dpadState[i] }
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
  
  /**
   *
   * @param {Object.<string, (number|Object.<string, number>)>} mappingSticks
   * @param {?axisChange[]} changeAxes
   * @param {?buttonChange[]} changeButtons
   * @returns {Object.<string, ?stickChange>}
   */
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
  
  /**
   * Convert axis dpad value as stick value for stickChange or
   * an array of four direction values.
   * @param {number} value
   * @param {number[]} directionValues
   * @param {number} precision
   * @returns {{stick: number[], dpad: number[]}}
   * stick: x-axis, y-axis, null
   * dpad: up, down, left, right
   */
  static convertAxisDpadValue (
    value,
    directionValues = [-1, -0.8, -0.5, -0.2, 0.1, 0.4, 0.7, 1],
    precision = 0.1
  ) {
    const conversionTable = {
      stick: [
        [ 0, -1, null],
        [ 1, -1, null],
        [ 1,  0, null],
        [ 1,  1, null],
        [ 0,  1, null],
        [-1,  1, null],
        [-1,  0, null],
        [-1, -1, null]
      ],
      dpad: [
        [1, 0, 0, 0],
        [1, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 1, 0, 1],
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 1, 0],
        [1, 0, 1, 0]
      ]
    }
    
    const directionIndex = directionValues.findIndex( d =>
      Math.abs(value - d) < precision
    )
    
    if (directionIndex === -1) { return null }
    
    return {
      stick: conversionTable.stick[directionIndex],
      dpad: conversionTable.dpad[directionIndex]
    }
  }
  /**
   * update last seen dpad state using new button change data
   * @param {number[]} dpadState reference to last seen dpad state
   * @param {Object.<string, number>} mappingDpad dpad mapping
   * @param {?buttonChange[]} changeButtons
   * @returns {?buttonChange[]} changes of up, down, left, and right dpad button
   */
  static updateDpadState (dpadState, mappingDpad, changeButtons) {
    const directions = ['up', 'down', 'left', 'right']
    const values = Array(4).fill(null)
  
    for (let p = 0; p < 2; p++) {
      /*
       * axisPair === 0 => directionNegative === 0, directionPositive === 1
       * axisPair === 1 => directionNegative === 2, directionPositive === 3
       */
      const dn = p * 2, dp = 1 + p * 2
      values[dn] = changeButtons[mappingDpad[directions[dn]]] || null
      values[dp] = changeButtons[mappingDpad[directions[dp]]] || null
      if (values[dn] !== null || values[dp] !== null) {
        /* axisPair 0 => axis 1 (vertical), axisPair 1 => axis 0 (horizontal) */
        dpadState[1 - p] =
          -1 * (values[dn] && values[dn].value || 0) +
          (values[dp] && values[dp].value || 0)
      }
    }
    
    return values
  }
  /**
   * update last seen dpad state with an already made dpad state data
   * @param {number[]} dpadState reference to last seen dpad state
   * @param {number[]} newStateData array of dpad x-axis and y-axis value
   */
  static updateDpadStateDirectly (dpadState, newStateData) {
    dpadState[0] = newStateData[0]
    dpadState[1] = newStateData[1]
  }
  
  /**
   * Dpad (single axis) => Mapped Dpad (four buttons)
   * @param {Object.<string, number>} mappingDpad dpad mapping
   * @param {axisChange} changeAxis axis of the dpad
   * @param {number[]} dpadState reference to last seen dpad state
   * @returns {?Object.<string, ?buttonChange>}
   */
  static processAxisDpad (mappingDpad, changeAxis, dpadState) {
    const neutralValue = 23/7
    const value = changeAxis ? changeAxis.value : neutralValue
    const previousValue = changeAxis ? value - changeAxis.delta : neutralValue
  
    /*
    converting up ~ upleft to 0 ~ 7,
    in a clockwise order.
    if I can be certain every dinput dpad value works in the same way I could make this much simpler...
     */
    // if `undefined` is passed to a parameter with a default value, the default will be used
    // if `null` is passed, it's replaced by null.
    const directions = mappingDpad.hasOwnProperty('upright') ? [
      mappingDpad.up,
      mappingDpad.upright,
      mappingDpad.right,
      mappingDpad.downright,
      mappingDpad.down,
      mappingDpad.downleft,
      mappingDpad.left,
      mappingDpad.upleft,
    ] : undefined
    const precision = mappingDpad.precision || undefined
    const neutralValues = { stick: [0, 0, null], dpad: [0, 0, 0, 0] }
  
    // the value is 0 when connected and recognized,
    // and it's 23/7 when returned to its neutral position.
    // active value can be negative or 1, and not 0.
    const dpadValues = (value > 1 || value === 0) ?
      neutralValues : MappingManager.convertAxisDpadValue(
        value, directions, precision
      ) || neutralValues
    
    const dpadPreviousValues = (previousValue > 1 || previousValue === 0) ?
      neutralValues : MappingManager.convertAxisDpadValue(
        previousValue, directions, precision
      ) || neutralValues
    
    const deltaValues = Array(4).fill(0)
    for(let d = 0; d < 4; d++) {
      deltaValues[d] = dpadValues.dpad[d] - dpadPreviousValues.dpad[d]
    }
  
    const processedChangeButtonsDpad =
      { up: {}, down: {}, left: {}, right: {} }
    processedChangeButtonsDpad.up = deltaValues[0] === 0 ? null : {
      value: dpadValues.dpad[0], delta: deltaValues[0]
    }
    processedChangeButtonsDpad.down = deltaValues[1] === 0 ? null : {
      value: dpadValues.dpad[1], delta: deltaValues[1]
    }
    processedChangeButtonsDpad.left = deltaValues[2] === 0 ? null : {
      value: dpadValues.dpad[2], delta: deltaValues[2]
    }
    processedChangeButtonsDpad.right = deltaValues[3] === 0 ? null : {
      value: dpadValues.dpad[3], delta: deltaValues[3]
    }
    
    MappingManager.updateDpadStateDirectly(dpadState, dpadValues.stick)
    
    return processedChangeButtonsDpad
  }
  /**
   * Dpad (single axis) => Mapped Stick (two axis)
   * @param {Object.<string, number>} mappingDpad dpad mapping
   * @param {axisChange} changeAxis axis of the dpad
   * @param dpadState
   * @returns {?stickChange}
   */
  static processAxisDpadAsLeftStick (mappingDpad, changeAxis, dpadState) {
    const value = changeAxis ? changeAxis.value : 0
    const delta = changeAxis ? changeAxis.delta : 0
    const previousValue = value - delta
    // the value is 0 when connected and recognized,
    // and it's 23/7 when returned to its neutral position.
    // active value can be negative or 1, and not 0.
    const active = value !== 0 && value <= 1
  
    const neutralValues = { stick: [0, 0, null] }
  
    const conversionArgs = [[value], [delta]]
    // the mapping declared its own dpad values and comparison precision
    if (mappingDpad.hasOwnProperty('upright')) {
      for (let i = 0; i < 2; i++) {
        conversionArgs[i].push(
          [
            mappingDpad.up,
            mappingDpad.upright,
            mappingDpad.right,
            mappingDpad.downright,
            mappingDpad.down,
            mappingDpad.downleft,
            mappingDpad.left,
            mappingDpad.upleft,
          ],
          mappingDpad.precision
        )
      }
    }
    
    const stickValues = active ?
      MappingManager.convertAxisDpadValue(...conversionArgs[0]) || neutralValues :
      neutralValues
  
    const stickPreviousValues = previousValue !== 0 && previousValue <= 1 ?
      MappingManager.convertAxisDpadValue(...conversionArgs[1]) || neutralValues :
      neutralValues
    
    const deltaValues = [
      stickValues.stick[0] - stickPreviousValues.stick[0],
      stickValues.stick[1] - stickPreviousValues.stick[1],
      null
    ]
  
    MappingManager.updateDpadStateDirectly(dpadState, stickValues.stick)
    
    return {
      value: stickValues.stick,
      delta: deltaValues,
      active: active
    }
  }
  
  /**
   * Dpad (four buttons) => Mapped Dpad (four buttons)
   * @param {Object.<string, number>} mappingDpad dpad mapping
   * @param  {?buttonChange[]} changeButtons
   * @param {number[]} dpadState reference to last seen dpad state
   * @returns {?Object.<string, ?buttonChange>}
   */
  static processDpadSimple (mappingDpad, changeButtons, dpadState) {
    const values = MappingManager.updateDpadState(dpadState, mappingDpad, changeButtons)
    
    // if (values.every(v => v === null)) { return null }
    
    return {
      up:    values[0],
      down:  values[1],
      left:  values[2],
      right: values[3]
    }
  }
  /**
   * Dpad (four buttons) => Mapped Stick (two axis)
   * @param {Object.<string, number>} mappingDpad dpad mapping
   * @param  {?buttonChange[]} changeButtons
   * @param {number[]} dpadState reference to last seen dpad state
   * @returns {stickChange}
   */
  static processDpadAsLeftStick (mappingDpad, changeButtons, dpadState) {
    MappingManager.updateDpadState(dpadState, mappingDpad, changeButtons)
    return {
      value: [dpadState[0], dpadState[1]],
      active: !!dpadState[0] || !!dpadState[1]
    }
  }
  
  static processButtons (mappingButtons, changeButtons) {
    const processedChangeButtons = {}
    const buttonSide = ['face', 'shoulder']
    const buttonIndex = [
      [
        'down', 'right', 'left', 'up', 'select', 'start', 'l3', 'r3', 'home', 'touchpad'
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
            "select": 8, "start": 9, "l3": 10, "r3": 11,
            "home": 16
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
            "select": 8, "start": 9, "l3": 10, "r3": 11,
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
