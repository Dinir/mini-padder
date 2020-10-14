class MPCommon {
  /**
   * Return the last confirmed maximum number of gamepads available.
   * @returns {number}
   */
  static get maxGamepads () {
    return 4
  }
  
  /**
   * Take an Error instance or string and dispatch a custom event with it.
   * @param {string} className the class this method will be used in
   * @returns {function(Error|string)} method for the class to use to announce messages
   */
  static announceMessageFrom (className) {
    return message => {
      window.dispatchEvent(new CustomEvent('MPMessage', {
        detail: {
          from: className,
          type: message instanceof Error ? 'error' : 'log',
          message: message
        }
      }))
    }
  }
  
  /**
   * @typedef {string} gamepadId
   * @description
   * Vendor ID and Product ID of a gamepad concatenated into a 8-letter string, or
   * if the gamepad is a standard one, the value will be 'XInput' or 'DInput'.
   */
  /**
   * Extract human readable description and gamepadId from `Gamepad.id`.
   * @param {string} idString
   * @returns {{name: string, gamepadId: gamepadId}}
   */
  static getGamepadId (idString) {
    // only parse for either Chrome or Firefox environment at the moment
    const matchResult =
      idString.match(/ \(.*Vendor: ([0-9a-f]{4}) Product: ([0-9a-f]{4})\)/) ||
      idString.match(/([0-9a-f]{1,4})-([0-9a-f]{1,4})/)
    if (matchResult) {
      return {
        name:
          idString.substring(0, matchResult.index) ||
          idString.substring(10),
        gamepadId: matchResult[1] + matchResult[2]
      }
      // vender and product aren't found. assume it's a standard gamepad.
    } else if (/XInput/.test(idString)) {
      const indexBeforeBracket = idString.search(/ \(/)
      return {
        name: idString.substring(0, indexBeforeBracket),
        gamepadId: 'XInput'
      }
    } else {
      return {
        name: 'DInput Controller?',
        gamepadId: 'DInput'
      }
    }
  }
}
