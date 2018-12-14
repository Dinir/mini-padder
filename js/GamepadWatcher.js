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
class GamepadWatcher {
  /**
   * create a watcher.
   *
   * @param {function} updateCallback Callback to execute for every frame or updates.
   * @param {boolean} [loopCheck=false] emits to console for every loop event.
   * @param {number} [pollInterval=2000] Interval to check the gamepads when none was found before.
   */
  constructor (updateCallback, loopCheck = false, pollInterval = 2000) {
    this.gamepadID = {}
    this.pollInterval = pollInterval
    this.updateID = {
      animation: 0,
      poll: 0
    }
    this.loopCheck = loopCheck
    if (updateCallback) {
      this.update = updateCallback
    }
    this.pollGamepads()
  }

  /**
   * get an ID of a gamepad
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
   * @return {(String|boolean)} the hex part of the ID concatenated in a string, if not found then 'false'
   */
  static getGamepadID (gamepadObj) {
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
   * return GamepadList if any gamepads exist, otherwise return false.
   *
   * @returns {(GamepadList|boolean)}
   */
  static getGamepadsIfFound () {
    const rawGamepads = navigator.getGamepads()
    const areFound = Object.values(rawGamepads)
      .filter(v => v !== null)
      .length !== 0

    return areFound ? rawGamepads : false
  }

  /**
   * check if any gamepads exist and manage update loops.
   *
   * Keeps the loop and does nothing if a poll loop is already running.
   * Repeats until a gamepad is found, at which it stops the poll loop and initiates animation loop (repeats inside `refresh`).
   */
  pollGamepads () {
    if (this.loopCheck) {
      if (this.updateID.poll !== 0) console.log('do poll loop')
    }
    const foundGamepads = GamepadWatcher.getGamepadsIfFound()
    if (foundGamepads) {
      // stop the poll loop, initiate refresh loop
      // this will start the animation loop at the end of `refresh`
      clearInterval(this.updateID.poll)
      this.updateID.poll = 0
      if (this.loopCheck) { console.log('to ani loop') }
      this.refresh()
    } else {
      if (this.updateID.animation) {
        // stop animation loop if there's any
        window.cancelAnimationFrame(this.updateID.animation)
        this.updateID.animation = 0
        if (this.loopCheck) { console.log('stop ani loop') }
      }
      if (this.updateID.poll === 0) {
        if (this.loopCheck) { console.log('to poll loop') }
        // start the poll loop if there's no any already
        this.updateID.poll = setInterval(
          this.pollGamepads.bind(this), this.pollInterval
        )
      }
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
    if (this.loopCheck) { console.info('gamepad found:', gamepadObj.index) }
  }

  /**
   * remove index from the `gamepadID` array.
   *
   * @param {number} gamepadIndex
   */
  unregister (gamepadIndex) {
    delete this.gamepadID[gamepadIndex]
    if (this.loopCheck) { console.info('gamepad lost:', gamepadIndex) }
  }

  /**
   * scans connected gamepads and update indexes in `gamepadID` array.
   * call `update()` method for each frame.
   * if no gamepad is found, stop the animation frame loop and initiate poll loop.
   */
  refresh () {
    let rawGamepads = GamepadWatcher.getGamepadsIfFound()

    if (!rawGamepads) {
      for (let index in this.gamepadID) {
        this.unregister(parseInt(index))
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
