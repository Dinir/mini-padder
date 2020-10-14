class MPCommon {
  /**
   * the desired fps to run the app under
   * @type {number}
   */
  static fps = 60
  /**
   * the length one frame covers in milliseconds
   * @type {number}
   */
  static frameLength = 1000 / MPCommon.fps
  /**
   * the max difference in length allowed for one frame in milliseconds squared
   * @type {number}
   */
  static maxSquareDiffAllowedInFrame = 16 ** 2
  
  /**
   * the last confirmed maximum number of gamepads available
   * @type {number}
   */
  static maxGamepads = 4
  
  /**
   * Take an Error instance or string and dispatch a custom event with it.
   * @param {string} className the class this method will be used in
   * @returns {function(Error|string)} method for the class to use to announce messages
   */
  static announceMessageFrom (className) {
    /**
     * @param {Error|string} message
     * @param {string} [typeOverride]
     */
    return (message, typeOverride) => {
      window.dispatchEvent(new CustomEvent('MPMessage', {
        detail: {
          from: className,
          type: message instanceof Error ? 'error' :
            typeOverride ? typeOverride : 'log',
          message: message
        }
      }))
    }
  }
  
  /**
   * Calculate the difference between two timestamps and return it.
   * Or if it's the first frame, return `true`.
   *
   * At ignition of a callback that should be looped on animated frames,
   * the timestamp may not be given to it and is seen as `undefined`.
   * I will consider this as a case where the calculation is not required,
   * and return `true`.
   *
   * @param {?DOMHighResTimeStamp} currentTimestamp
   * @param {?DOMHighResTimeStamp} pastTimestamp
   * @returns {boolean|number}
   * `true` at first frame, otherwise difference between two frames
   */
  static getFrameInterval (currentTimestamp, pastTimestamp) {
    if (
      currentTimestamp === undefined ||
      pastTimestamp === null
    ) { return true }
    return currentTimestamp - pastTimestamp
  }
  
  /**
   * Calculate the difference between two timestamps and
   * return true when the interval is bigger than it should be.
   *
   * @param {?DOMHighResTimeStamp} currentTimestamp
   * @param {?DOMHighResTimeStamp} pastTimestamp
   *
   * @returns {boolean} `true` if the interval was bigger
   * than the specified value in {@link MPCommon.maxSquareDiffAllowedInFrame}
   */
  static isIntervalBigEnough (currentTimestamp, pastTimestamp) {
    if (
      currentTimestamp === undefined ||
      pastTimestamp === null
    ) { return false }
    const intervalDifference =
      currentTimestamp - pastTimestamp - MPCommon.frameLength
    const squareDiff = intervalDifference * intervalDifference
    
    return squareDiff > MPCommon.maxSquareDiffAllowedInFrame
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
