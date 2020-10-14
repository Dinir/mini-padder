class ErrorLogCollector {
  constructor() {
    /**
     * Store error logs.
     *
     * By putting it in an array, the log variable can be copied by reference.
     * And when attempted to display the whole array on a textarea
     * it will only show the text.
     *
     * @type {string[]}
     */
    this.errorLog = ['']
    
    this.write = this.write.bind(this)
    this.writeCustomError = this.writeCustomError.bind(this)
    
    window.onerror = this.write
    window.addEventListener('customErrorMessage', this.writeCustomError)
  }
  
  /**
   * Return timestamp in a specific format.
   * @returns {string} DOMHighResTimeStamp
   * truncated to 3 digits below decimal point
   */
   static get #timestamp () {
    return (Math.floor(1000*performance.now())/1000).toFixed(3)
   }
  
  /**
   * Write the error to {@link ErrorLogCollector.errorLog}.
   * @param {DOMString} message
   * @param {DOMString} [url]
   * @param {integer} [lineNo]
   * @param {integer} [columnNo]
   * @param {Object} error
   * @returns {boolean}
   */
  write (message, url, lineNo, columnNo, error) {
    this.errorLog[0] += `[${ErrorLogCollector.#timestamp}] `
    this.errorLog[0] += error instanceof Error ? error.stack : message
    this.errorLog[0] += '\n'
    return false
  }
  
  /**
   * Convert a non-standard error to
   * write to {@link ErrorLogCollector.errorLog}.
   * @param {CustomEvent} e
   * @param {Error|string} e.detail
   * @returns {boolean}
   */
  writeCustomError (e) {
    return this.write(e.detail.message || e.detail, null, null, null, e.detail)
  }
}
