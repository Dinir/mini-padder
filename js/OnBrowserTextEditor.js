/**
 * @typedef {Object} TextEditorCallbacks
 * @property {callback} save function to call when user tries to save
 * @property {callback} load function to clal when user tries to load
 */
/**
 * @typedef {Object} TextEditorDOM
 * @property {HTMLElement} wrapper a div wrapping all the elements
 * @property {HTMLTextAreaElement} textarea
 * @property {HTMLElement} notifyArea
 * @property {HTMLButtonElement} saveButton
 * @property {HTMLButtonElement} loadButton
 */

/**
 * Create a textarea and a set of buttons to give access to the text
 * @class
 */
class OnBrowserTextEditor {
  /** @param {TextEditorCallbacks} callbacks */
  constructor (callbacks) {
    this.textarea = document.createElement('textarea')
    this.notifyArea = document.createElement('div')
    this.notifyArea.setAttribute('id', 'notify-area')
    this.saveButton = document.createElement('button')
    this.saveButton.setAttribute('class', 'save-button')
    this.saveButton.textContent =
      'Save Current Text as Configuration'
    this.loadButton = document.createElement('button')
    this.loadButton.setAttribute('class', 'load-button')
    this.loadButton.textContent =
      'Load Current Configuration'
    
    /**
     * gives the text in the textarea for the callback in the parameter to do the job.
     * In cases where the user should be notified, `notify` can accept messages.
     *
     * @example
     * callbacks.save = (text, notify) => {
     *   window.localStorage.setItem('text', text)
     * }
     */
    this.save = () =>
      callbacks.save(this.textarea.value, this.notify)
    /**
     * gives the textarea for the callback in the parameter to do the job.
     * In cases where the user should be notified, `notify` can accept messages.
     *
     * @example
     * callbacks.load = (textarea, notify) => {
     *   textarea.value = window.localStorage.getItem('text')
     * }
     */
    this.load = () =>
      callbacks.load(this.textarea, this.notify)
    
    this.saveButton.onclick = this.save.bind(this)
    this.loadButton.onclick = this.load.bind(this)
    
    this.notifyID = 0
    /**
     * accepts the message info and change the notification area class name for a brief time.
     *
     * @param {{text: String, isError: boolean}} message
     */
    this.notify = message => {
      const classNames =
        `visible${message.isError ? ' error' : ''}`
      this.notifyArea.setAttribute('class', classNames)
      this.notifyArea.innerText = message.text
      if (this.notifyID) {
        clearTimeout(this.notifyID)
      }
      this.notifyID = setTimeout(area => {
        area.setAttribute('class', 'hidden')
        area.innerText = ''
      }, 4000, this.notifyArea)
    }
  
    this.wrapper = document.createElement('div')
    this.wrapper.setAttribute('id', 'text-editor-wrapper')
    this.wrapper.appendChild(this.textarea)
    this.wrapper.appendChild(this.notifyArea)
    this.wrapper.appendChild(this.saveButton)
    this.wrapper.appendChild(this.loadButton)
  }
  
  /**
   * @returns {TextEditorDOM} the page then can use these elements
   */
  getDOM () {
    return {
      wrapper: this.wrapper,
      textarea: this.textarea,
      notifyArea: this.notifyArea,
      saveButton: this.saveButton,
      loadButton: this.loadButton
    }
  }
}
