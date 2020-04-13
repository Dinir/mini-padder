class ErrorLogCollector {
  constructor() {
    /*
    By putting it in an array, the log variable can be copied by reference.
    And when attempted to display the whole array on a textarea
    it will only show the text.
     */
    this.errorLog = ['']
    this.write = this.write.bind(this)
    window.onerror = this.write
  }
  
  write (message, url, lineNo, columnNo, error) {
    const timestamp =
      (Math.floor(1000*performance.now())/1000).toFixed(3)
    this.errorLog[0] += `[${timestamp}] `
    this.errorLog[0] += error ? error.stack : message
    this.errorLog[0] += '\n'
    return false
  }
}
