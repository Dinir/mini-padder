class GamepadHandler {
  constructor(updateCallback) {
    this.gamepads = {}
    this.animationRequestID = 0
    if (updateCallback) {
      this.update = updateCallback
    }
  }

  hasNoGamepad() {
    return Object.keys(this.gamepads).length === 0
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
   * @param {Object} gamepadObj The gamepad object to find the ID of.
   *
   * @return {String} the hex part of the ID concatenated in a string
   */
  static getGamepadID(gamepadObj) {
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

  register(gamepadObj) {
    this.gamepads[gamepadObj.index] = gamepadObj
  }

  unregister(gamepadObj) {
    delete this.gamepads[gamepadObj.index]
  }

  /**
   * scans currently connected gamepads and add/remove it to/from the given array.
   *
   * it gets gamepads from `navigator.getGamepads()`
   * then it check if any gamepads in it is already in the array.
   * if it's new to the array, the function will add it to the array.
   */
  refresh() {
    const gamepads = this.gamepads
    const getGamepad = navigator.getGamepads || navigator.webkitGetGamepads
    // I assume this web thing will only run on Chrome environments,
    // so not adding any other forms of this method.
    let rawGamepads = Array.from(navigator.getGamepads())
    let rawIndexes = rawGamepads.map((v) => { if (v) return v.index })

    // check if we already have it
    rawGamepads.forEach(function (gamepadObj) {
      // checking if a gamepad is in the raw list, and in the array.
      if(gamepadObj && !gamepads[gamepadObj.index]) {
        // it doesn't exist in the array. adding it.
        that.register(gamepadObj)
      }
    })
    // remove gamepad that's disconnected but existing in the array.
    Object.keys(gamepads).forEach(function (v) {
      if (rawIndexes.indexOf(parseInt(v)) === -1) {
        that.unregister(gamepads[v])
      }
    })

    // decide if we need next frame or there's no gamepad to animate the state.
    if (this.hasNoGamepad()) {
      cancelAnimationFrame(this.animationRequestID)
    } else {
      this.update()
      this.animationRequestID = window.requestAnimationFrame(
        () => this.refresh(gamepads)
      )
    }
  }
}