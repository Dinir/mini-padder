/**
 * @typedef Gamepad
 * @type {Object}
 * @property {number[]} axes contains value of each axis
 * @property {gamepadButton[]} buttons
 * @property {boolean} connected shows the connection status. You see this being `false` when the gamepad object is passed via `gamepaddisconnected` event.
 * @property {string} id information about the controller. Controller name.
 * @property {number} index integer representing each device connected.
 * @property {string} mapping not a useful property as of 2020.
 * @property {DOMHighResTimeStamp} timestamp last time the gamepad state is updated
 */
/**
 * @typedef gamepadButton
 * @type {Object}
 * @property {boolean} pressed Tells if the button is pressed.
 * @property {number} value State of the button. 0 when not pressed, 1 when fully pressed. Can be a number between 0 and 1 if the button is an analog kind.
 */

/**
 * @typedef {Object} GamepadChanges
 * @description
 * This object contains axes and buttons data from Gamepad with 'delta' property added to each.
 * Unchanged values will be represented as null.
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

class GamepadWatcher {
  constructor() {
    /**
     * Contains Gamepads passed by value from gamepad connection events.
     * Gamepads are only passed when they actually represents one.
     * @type {Object}
     * @property {Gamepad} [0]
     * @property {Gamepad} [1]
     * @property {Gamepad} [2]
     * @property {Gamepad} [3]
     */
    this.gamepads = {}
    this.gamepadId = []
    this.onLoop = false
    this.pollID = 0
    
    if (GamepadWatcher.hasEvents) {
      window.addEventListener('gamepadconnected', e => {
        this.updateConnection(e, true)
      })
      window.addEventListener('gamepaddisconnected', e => {
        this.updateConnection(e, false)
      })
    } else {
      this.pollID = setInterval(this.scanConnection, 1000)
    }
  }
  
  static get hasEvents () {
    /* somehow this doesn't work properly at Chrome,
     * although it definitely supports the event.
     * I'm gonna put it to be true at the moment. */
    // return 'ongamepadconnected' in window
    return true
  }
  
  /**
   * Dispatch an event of 'gamepadChange' type with data of changes included in it.
   * @param {GamepadChanges} gamepadChanges
   */
  static announceGamepadChange(gamepadChanges) {
    window.dispatchEvent(new CustomEvent('gamepadChange', {
      detail: gamepadChanges
    }))
  }
  
  /**
   * Extract human readable description and gamepadId from `Gamepad.id`.
   * @param {string} idString
   * @returns {{name: string, gamepadId: string}}
   */
  static getGamepadId (idString) {
    const matchResult = idString.match(/ \(.*Vendor: ([0-9a-f]{4}) Product: ([0-9a-f]{4})\)/)
    if (matchResult) {
      return {
        name: idString.substring(0, matchResult.index),
        gamepadId: matchResult[1] + matchResult[2]
      }
    } else if (/XInput/.test(idString)) {
      const indexBeforeBracket = idString.search(/ \(/)
      return {
        name: idString.substring(0, indexBeforeBracket),
        gamepadId: 'XInput'
      }
    } else {
      return {
        name: 'XBox 360 Controller?',
        gamepadId: 'XInput?'
      }
    }
  }
  
  get connectionAmount () {
    return Object.keys(this.gamepads).length
  }
  
  updateConnection (event, connection) {
    const gamepad = event.gamepad
    
    if (connection) {
      this.gamepads[gamepad.index] = gamepad
      this.gamepadId[gamepad.index] =
        GamepadWatcher.getGamepadId(gamepad.id)
    } else {
      delete this.gamepads[gamepad.index]
      delete this.gamepadId[gamepad.index]
    }
    
    const connectionsFound = this.connectionAmount
    if (connectionsFound > 0) {
      this.startLooping()
    } else if (connectionsFound === 0) {
      this.stopLooping()
    }
  }
  scanConnection () {
    this.manuallyUpdateConnection()
    // so we can check the amount in a consistent way
    const connectionsFound = this.connectionAmount
    
    if (connectionsFound) {
      this.startLooping()
    }
  }
  manuallyUpdateConnection (gamepadsToCheck) {
    // not like `this.gamepads`, this one always have 4 properties
    const gamepads = gamepadsToCheck || navigator.getGamepads()
    // only add ones that actually exist to `this.gamepads`
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        this.gamepads[gamepads[i].index] = gamepads[i]
        this.gamepadId[gamepad.index] =
          GamepadWatcher.getGamepadId(gamepads[i].id)
      }
      else {
        delete this.gamepads[gamepads[i].index]
        delete this.gamepadId[gamepads[i].index]
      }
    }
  }
  
  startLooping () {
    if (this.onLoop) { return }
    
    this.onLoop = true
    if (!GamepadWatcher.hasEvents) {
      clearInterval(this.pollID)
    }
    this.loop()
  }
  stopLooping () {
    if (!this.onLoop) { return }
    
    this.onLoop = false
    if (!GamepadWatcher.hasEvents) {
      this.pollID = setInterval(this.scanConnection, 1000)
    }
  }
  
  loop () {
    if (!this.onLoop) { return }
    
    // make copies of both before-loop and current states.
    const oldStates = this.gamepads
    const newStates = navigator.getGamepads()
  
    /**
     * @type {Object}
     * @property {?GamepadChanges} [0]
     * @property {?GamepadChanges} [1]
     * @property {?GamepadChanges} [2]
     * @property {?GamepadChanges} [3]
     *
     * If there was no changes for a gamepad, the corresponding property will be set as null.
     * If a gamepad is not registered on the navigator, the corresponding property won't exist.
     */
    const lastChange = {}

    // check each gamepad for changes
    for (let i = 0; i < newStates.length; i++) {
      /* gamepad connection is updated when
       * - new connection change event handled in `updateConnection`
       * - new connection (not disconnection) found in `scanConnection`
       * - new connection change found in the loop at the end of this method
       * At every tick this loop is running, I'll consider 'newStates'
       * as a 'current' connection state. */
      const newState = newStates[i]
      if (!newState || !this.gamepads[newState.index]) { continue }
      const index = newState.index
      const oldState = this.gamepads[index]
      
      // check if the state is changed
      if (newState.timestamp === oldState.timestamp) {
        lastChange[newState.index] = null
        continue
      } else {
        lastChange[newState.index] = {
          id: this.gamepadId[newState.index]
        }
      }
      
      // check axes
      const axisChanges = Array(newState.axes.length).fill(null)
      for (let ai = 0; ai < newState.axes.length; ai++) {
        if (newState.axes[ai] !== oldState.axes[ai]) {
          axisChanges[ai] = {
            value: newState.axes[ai],
            delta: newState.axes[ai] - oldState.axes[ai]
          }
        }
      }
      lastChange[newState.index].axes = axisChanges
  
      // check buttons
      const buttonChanges = Array(newState.buttons.length).fill(null)
      for (let bi = 0; bi < newState.buttons.length; bi++) {
        if (newState.buttons[bi].value !== oldState.buttons[bi].value) {
          buttonChanges[bi] = {
            pressed: newState.buttons[bi].pressed,
            value: newState.buttons[bi].value,
            delta: newState.buttons[bi].value - oldState.buttons[bi].value
          }
        }
      }
      lastChange[newState.index].buttons = buttonChanges
      
      // checking on the new state is done, update the stored old state with them
      this.gamepads[index] = newState
    }
    
    if (
      Object.keys(lastChange).length &&
      lastChange[0] || lastChange[1] || lastChange[2] || lastChange[3]
    ) {
      GamepadWatcher.announceGamepadChange(lastChange)
    }
    
    /* When running without gamepad events,
     * `scanConnection` can't remove gamepads from `this.gamepads`,
     * so we gotta do that in the loop.
     * This changes `this.gamepads' to current states! */
    if (!GamepadWatcher.hasEvents) {
      this.manuallyUpdateConnection(newStates)
      if (!this.connectionAmount) {
        this.stopLooping()
      }
    }
    
    window.requestAnimationFrame(this.loop.bind(this))
  }
}
