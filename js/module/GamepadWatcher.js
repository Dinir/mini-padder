// watch gamepad states using rAF,
// send changes when different timestamp is found
// also send changes on connection state of gamepads

/**
 * @typedef {Object} GamePad
 * @property {number[]} axes
 * @property {GamepadButton[]} buttons
 * @property {boolean} connected
 * @property {string} id
 * @property {number} index
 * @property {string} mapping
 * @property {number} timestamp
 */

class GamepadWatcher {
  constructor() {
    /**
     * Contains Gamepads passed by value from gamepad connection events.
     * Gamepads are only passed when they actually represents one.
     * @type {Object}
     * @property {Gamepad} 0
     * @property {Gamepad} 1
     * @property {Gamepad} 2
     * @property {Gamepad} 3
     */
    this.gamepads = {}
    this.onLoop = false
    this.pollID = 0
    
    if (GamepadWatcher.hasEvents) {
      window.addEventListener('gamepadconnected', e => { this.updateConnection(e, true) }, false)
      window.addEventListener('gamepaddisconnected', e => { this.updateConnection(e, false) }, false)
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
  get connectionAmount () {
    return Object.keys(this.gamepads).length
  }
  
  updateConnection (event, connection) {
    const gamepad = event.gamepad
    
    if (connection) {
      this.gamepads[gamepad.index] = gamepad
    } else {
      delete this.gamepads[gamepad.index]
    }
    
    const connectionsFound = this.connectionAmount
    if (connectionsFound > 0) {
      this.startLooping()
    } else if (connectionsFound === 0) {
      this.stopLooping()
    }
  }
  scanConnection () {
    // not like `this.gamepads`, this one always have 4 properties
    const gamepads = navigator.getGamepads()
    // only add ones that actually exist to `this.gamepads`
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) { this.gamepads[i] = gamepads[i] }
    }
    // so we can check the amount in a consistent way
    const connectionsFound = this.connectionAmount
    
    if (connectionsFound) {
      this.startLooping()
    }
  }
  
  startLooping () {
    if (this.onLoop) { return }
    
    this.onLoop = true
    if (!this.hasEvents) {
      clearInterval(this.pollID)
    }
    this.loop()
  }
  stopLooping () {
    if (!this.onLoop) { return }
    
    this.onLoop = false
    if (!this.hasEvents) {
      this.pollID = setInterval(this.scanConnection, 1000)
    }
  }
  
  loop () {
    if (!this.onLoop) { return }
    
    const oldStates = this.gamepads
    const newStates = navigator.getGamepads()
    
    // compare timestamps of pads where newStates[i] !== null
    // if timestamp is different, loop through the pad to get differences
    // arrange the differences, and somehow send it outside
    
    window.requestAnimationFrame(this.loop.bind(this))
  }
}
