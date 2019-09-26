/**
 * @typedef {Object} TextEditorCallbacks
 * @property {callback} save function to call when user tries to save
 * @property {callback} load function to clal when user tries to load
 */
/**
 * @typedef {Object} TextEditorDOM
 * @property {HTMLElement} wrapper a div wrapping all the elements
 * @property {HTMLTextAreaElement} textarea
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
  
    /**
     * gives the text in the textarea for the callback in the parameter to do the job.
     *
     * @example
     * callbacks.save = text => {
     *   window.localStorage.setItem('text', text)
     * }
     *
     * @param {MouseEvent} event the event that comes from `onclick`
     * @param {String} text text written in the textarea
     */
    this.save = (event, text = this.textarea.value) =>
      callbacks.save(text)
    /**
     * gives the textarea for the callback in the parameter to do the job.
     *
     * @example
     * callbacks.load = textarea => {
     *   textarea.value = window.localStorage.getItem('text')
     * }
     *
     * @param {MouseEvent} event the event that comes from `onclick`
     * @param {HTMLTextAreaElement} textarea to populate
     */
    this.load = (event, textarea = this.textarea) =>
      callbacks.load(textarea)
    
    this.saveButton = document.createElement('button')
    this.saveButton.setAttribute('class', 'save-button')
    this.saveButton.onclick = this.save.bind(this)
    this.saveButton.textContent =
      'Save Current Text as Configuration'
    
    this.loadButton = document.createElement('button')
    this.loadButton.setAttribute('class', 'load-button')
    this.loadButton.onclick = this.load.bind(this)
    this.loadButton.textContent =
      'Load Current Configuration'
  
    this.wrapper = document.createElement('div')
    this.wrapper.setAttribute('id', 'text-editor-wrapper')
    this.wrapper.appendChild(this.textarea)
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
      saveButton: this.saveButton,
      loadButton: this.loadButton
    }
  }
}
