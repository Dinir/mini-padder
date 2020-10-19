/**
 * @typedef {Object} Gamepad
 * @property {number[]} axes contains value of each axis
 * @property {Object[]} buttons
 * @property {boolean} buttons.pressed Tells if the button is pressed.
 * @property {number} buttons.value State of the button. 0 when not pressed, 1 when fully pressed. Can be a number between 0 and 1 if the button is an analog kind.
 * @property {boolean} connected shows the connection status. You see this being `false` when the gamepad object is passed via `gamepaddisconnected` event.
 * @property {string} id controller name and its vendor id and product id.
 * @property {number} index integer representing each device connected.
 * @property {string} mapping not a useful property as of 2020.
 * @property {DOMHighResTimeStamp} timestamp last time the gamepad state is updated
 */
/**
 * @typedef {Object} GamepadEvent
 * @property {Gamepad} gamepad
 * The gamepad related to this event.
 * @property {string} type
 * Either `gamepadconnected` or `gamepaddisconnected`.
 * @property {DOMHighResTimeStamp} timestamp
 * Timestamp of the moment this event is fired.
 */
/**
 * @event gamepadconnected
 * @type {GamepadEvent}
 */
/**
 * @event gamepaddisconnected
 * @type {GamepadEvent}
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
 * `GamepadChange.axes` will always be an array with the length of the number of found axes.
 * `GamepadChange.buttons` will always be an array with the length of the number of found buttons.
 *
 * @property {Object} id `Gamepad.id` formatted into the name and the gamepadId.
 * @property {string} id.name
 * @property {gamepadId} id.gamepadId
 * @property {?axisChange[]} axes
 * @property {?buttonChange[]} buttons
 */
/**
 * @typedef {Object} axisChange Contains changes made on a single axis of a gamepad.
 * @property {number} value value Raw value of the axis.
 * @property {number} delta value Represents how much it moved from the last position.
 */
/**
 * @typedef {Object} buttonChange Contains changes made on a single button of a gamepad.
 * @property {boolean} pressed Indicates the state of the button. This will be undefined if there's no change.
 * @property {number} value Value of the button. It's 0 or 1 for digital buttons, and any value between and including them for analog buttons.
 * @property {number} delta Change of the value from the last time processedGamepadChange was made.
 */

/**
 * @event GamepadWatcher#gamepadChange
 * @type {Object}
 * @description
 * Contains changes on inputs of gamepads.
 *
 * If there was no changes for a gamepad (or it's not connected), the corresponding property will be set as null.
 *
 * @property {?GamepadChange} detail.0
 * @property {?GamepadChange} detail.1
 * @property {?GamepadChange} detail.2
 * @property {?GamepadChange} detail.3
 * @property {number} detail.length Defined so it can be iterated with for loop.
 */

/**
 * Manages gamepad connections, and dispatches
 * a `{@link GamepadWatcher#event:gamepadChange gamepadChange}` event
 * when receiving inputs from connected gamepads that has changes.
 *
 * @see GamepadChange
 * @see {@link GamepadWatcher#event:gamepadChange gamepadChange (event)}
 *
 * @class
 */
class GamepadWatcher {
  constructor() {
    /**
     * the last confirmed maximum number of gamepads available
     * @type {number}
     */
    this.maxGamepads = MPCommon.maxGamepads || 4
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
    /** @type {Array<{name: string, gamepadId: string}>} */
    this.gamepadId = []
    this.onLoop = false
    this.pollID = 0
    /** @type {?DOMHighResTimeStamp} */
    this._lastTimestamp = null
    
    this.browser = GamepadWatcher.detectBrowser()
    
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
   * Dispatch an event of 'gamepadChange' type
   * with data of changes included in it.
   * @param {Object.<GamepadChange, number>} gamepadChanges
   * @fires GamepadWatcher#gamepadChange
   */
  static announceGamepadChange(gamepadChanges) {
    window.dispatchEvent(new CustomEvent('gamepadChange', {
      detail: gamepadChanges
    }))
  }
  
  static announceMessage = MPCommon.announceMessageFrom('Gamepad Watcher')
  
  /**
   * detects if it's Firefox or Chrome.
   * @return {string}
   */
  static detectBrowser () {
    // can't believe `!!window.chrome` doesn't work on OBS browser
    if (/Chrome\/\d+/.test(navigator.userAgent)) { return 'Chrome' }
    if (typeof InstallTrigger !== 'undefined') { return 'Firefox' }
  }
  
  get connectionAmount () {
    return Object.keys(this.gamepads).length
  }
  
  /**
   * @param {GamepadEvent} event
   * @param {boolean} connection
   * @listens event:gamepadconnected
   * @listens event:gamepaddisconnected
   */
  updateConnection (event, connection) {
    const gamepad = event.gamepad
    
    if (connection) {
      this.gamepads[gamepad.index] = gamepad
      this.gamepadId[gamepad.index] =
        MPCommon.getGamepadId(gamepad.id)
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
        this.gamepadId[gamepads[i].index] =
          MPCommon.getGamepadId(gamepads[i].id)
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
  
  /**
   *
   * @param {?DOMHighResTimeStamp} timestamp
   */
  loop (timestamp) {
    /**
     * true if the interval from the last frame was longer than 2 frame length
     * @type {boolean}
     */
    const framesLost =
      MPCommon.isIntervalBigEnough(timestamp, this._lastTimestamp)
    if (framesLost) {
      const approxFrames = Math.round(
        (timestamp - this._lastTimestamp) / MPCommon.frameLength
      )
      GamepadWatcher.announceMessage(
        `Frames delayed: ${approxFrames}`,
        'warn'
      )
    }
    
    this._lastTimestamp = timestamp || null
    if (!this.onLoop) { return }
    
    // make copy of current states at the time the loop starts
    const newStates = navigator.getGamepads()
  
    /**
     * If there was no changes for a gamepad (or it's not connected), the corresponding property will be set as null.
     *
     * @type {Object}
     * @property {?GamepadChange} 0
     * @property {?GamepadChange} 1
     * @property {?GamepadChange} 2
     * @property {?GamepadChange} 3
     * @property {number} length defined so it can be iterated with for loop
     */
    const lastChanges = {}
    lastChanges.length = this.maxGamepads

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
      
      /*
       * the `oldState` is a reference to a LIVE STATE of a gamepad in firefox...
       */
      // check if the state is changed
      if (newState.timestamp !== oldState.timestamp || this.browser === 'Firefox') {
        // add gamepadId into the change object
        lastChanges[newState.index] = {
          id: this.gamepadId[newState.index]
        }
      } else {
        lastChanges[newState.index] = null
        continue
      }
      const lastChange = lastChanges[newState.index]
      
      // check axes
      const axisChanges = Array(newState.axes.length).fill(null)
      for (let ai = 0; ai < newState.axes.length; ai++) {
        axisChanges[ai] = {
          value: newState.axes[ai],
          delta: newState.axes[ai] - oldState.axes[ai]
        }
      }
      lastChange.axes = axisChanges
  
      // check buttons
      const buttonChanges = Array(newState.buttons.length).fill(null)
      for (let bi = 0; bi < newState.buttons.length; bi++) {
        /*
         * the `oldState` is a reference to a LIVE STATE of a gamepad in firefox...
         */
        if (newState.buttons[bi].value !== oldState.buttons[bi].value || this.browser === 'Firefox') {
          buttonChanges[bi] = {
            pressed: newState.buttons[bi].pressed,
            value: newState.buttons[bi].value,
            delta: newState.buttons[bi].value - oldState.buttons[bi].value
          }
        }
      }
      lastChange.buttons = buttonChanges
      
      // checking on the new state is done, update the stored old state with them
      this.gamepads[index] = newState
    }
    
    if (
      Object.keys(lastChanges).length &&
      lastChanges[0] ||
      lastChanges[1] ||
      lastChanges[2] ||
      lastChanges[3]
    ) {
      GamepadWatcher.announceGamepadChange(lastChanges)
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
