/* eslint-disable no-unused-vars */
/**
 * @typedef {Object} GamepadList
 * @property {(GamePad|null)} 0
 * @property {(GamePad|null)} 1
 * @property {(GamePad|null)} 2
 * @property {(GamePad|null)} 3
 * @property {number} length
 */
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
/**
 * @typedef {Object} GamepadButton
 * @property {boolean} pressed
 * Tells if the button is pressed.
 * @property {number} value
 * State of the button. 0 when not pressed, 1 when fully pressed.
 * Can be a number between 0 and 1 if the button is an analog kind.
 */

/**
 * watch gamepad connections,
 * adjust updating interval in relation to the present of connected gamepads,
 * execute a callback for every frame or update moments
 */
export default class GamepadWatcher {
  /**
   * create a watcher.
   *
   * @param {function} updateCallback Callback to execute for every frame or updates.
   * @param {boolean} [logMessage=false] emits to console for every loop event.
   * @param {number} [pollInterval=2000] Interval to check the gamepads when none was found before.
   */
  constructor (updateCallback, logMessage = false, pollInterval = 2000) {
    // `gamepadID` only contains the obtained ID of each gamepads.
    this.gamepadID = {}
    this.pollInterval = pollInterval
    this.updateAtEveryFrame = false
    this.updateID = 0
    this.flushUpdateID = function () {
      if (this.updateID) {
        clearInterval(this.updateID)
      }
      this.updateID = 0
    }
    this.logMessage = logMessage
    if (updateCallback) {
      this.update = updateCallback
    }
    this.pollGamepads()
  }

  /**
   * Unless it's recognized as a general XInput controller, which has no explicit ID, get an ID of a gamepad.
   *
   * ID format is different for two browsers:
   * `/([0-9a-f]{1,4})-/g` in Firefox,
   * `/([0-9a-f]{4})/g` in Chrome.
   *
   * @example
   * Firefox 54c-5c4-Wireless Controller
   * Chrome  Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 05c4)
   *
   * @param {GamePad} gamepadObj The gamepad object to find the ID of.
   *
   * @return {(String|boolean)} the hex part of the ID concatenated in a string, if not found then `false`. If it's a general XInput controller it's simply `XInput`.
   */
  static getGamepadID (gamepadObj) {
    const isGeneralXInput = gamepadObj.id.match(/xinput/i)
    if (isGeneralXInput) {
      return 'XInput'
    }

    const idPattern = /([0-9a-f]{4})/g

    const matches = gamepadObj.id.match(idPattern)
    if (matches.length !== 2) {
      return false
    }

    // concatenate the hex part to return the 8 letters from the ID.
    return matches.reduce(
      (pv, cv) => pv + (cv.replace(/[^0-9a-f]/, '')).padStart(4, '0'),
      ''
    )
  }
  
  /**
   * tell if any gamepads exist.
   * @param {GamepadList} list if GamepadList is already retrieved, you can manually put it as the parameter here.
   *
   * @returns {boolean}
   */
  static gamepadsExist (list = navigator.getGamepads()) {
    return Object.values(list)
      .filter(v => v !== null)
     .length !== 0
  }

  /**
   * return GamepadList if any gamepads exist, otherwise return false.
   *
   * @returns {(GamepadList|boolean)}
   */
  static getGamepadsIfFound () {
    const rawGamepads = navigator.getGamepads()

    return this.gamepadsExist(rawGamepads) ? rawGamepads : false
  }

  /**
   * check if any gamepads exist and manage update loops.
   *
   * Keeps the loop and does nothing if a poll loop is already running.
   * Repeats until a gamepad is found, at which it stops the poll loop and initiates animation loop (repeats inside `refresh`).
   */
  pollGamepads () {
    if (GamepadWatcher.gamepadsExist()) {
      // stop the poll loop, initiate refresh loop
      // this will start the animation loop at the end of `refresh`
      this.flushUpdateID()
      this.updateAtEveryFrame = true
      if (this.logMessage) { console.info('Gamepad is found. Now updating in every frame.') }
      this.refresh()
    } else {
      if (this.updateAtEveryFrame) {
        // stop animation loop if there's any
        window.cancelAnimationFrame(this.updateID)
        this.flushUpdateID()
        this.updateAtEveryFrame = false
        if (this.logMessage) { console.info('No gamepads left. Now polling.') }
      }
      // start the poll loop if there's no any already
      if (!this.updateID) {
        this.updateID = setInterval(
          this.pollGamepads.bind(this), this.pollInterval
        )
        if (this.logMessage) { console.info('Started polling.') }
      }
      if (this.logMessage) { console.info('Waiting for a gamepad.') }
    }
  }

  /**
   * add index and gamepadID of the gamepad to `gamepadID` array.
   *
   * @param {Gamepad} gamepadObj
   */
  register (gamepadObj) {
    this.gamepadID[gamepadObj.index] =
      GamepadWatcher.getGamepadID(gamepadObj)
    if (this.logMessage) { console.info('gamepad found:', gamepadObj.index) }
  }

  /**
   * remove index from the `gamepadID` array.
   *
   * @param {number} gamepadIndex
   */
  unregister (gamepadIndex) {
    delete this.gamepadID[gamepadIndex]
    if (this.logMessage) { console.info('gamepad lost:', gamepadIndex) }
  }

  /**
   * scans connected gamepads and update indexes in `gamepadID` array.
   * call `update()` method for each frame.
   * if no gamepad is found, stop the animation frame loop and initiate poll loop.
   */
  refresh () {
    let rawGamepads = GamepadWatcher.getGamepadsIfFound()

    // no gamepads found, start poll loop.
    if (!rawGamepads) {
      for (let index in this.gamepadID) {
        if (this.gamepadID.hasOwnProperty(index)) {
          this.unregister(parseInt(index))
        }
      }
      this.pollGamepads()
      return
    }

    for (let index = 0; index < rawGamepads.length; index++) {
      // add gamepad information to the array.
      if (rawGamepads[index] && !this.gamepadID[index]) {
        this.register(rawGamepads[index])
      }
      // remove gamepad information from the array.
      if (this.gamepadID[index] && !rawGamepads[index]) {
        this.unregister(index)
      }
    }

    this.update(rawGamepads)

    window.requestAnimationFrame(this.refresh.bind(this))
  }
}
