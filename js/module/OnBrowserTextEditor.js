/**
 * @typedef {Object} TextEditorCallbacks
 * @property {string} title short description of what user is seeing and editing
 * @property {callback} save function to call when user tries to save
 * @property {callback} load function to call when user tries to load
 */
/**
 * @typedef {Object} TextEditorDOM
 * @property {HTMLElement} wrapper a div wrapping all the elements
 * @property {HTMLHeadingElement} title
 * @property {HTMLTextAreaElement} textarea
 * @property {HTMLElement} notifyArea
 * @property {HTMLButtonElement} saveButton
 * @property {HTMLButtonElement} loadButton
 */

/*
Direction of save/load

[ Editor ]<-Load[  HTML  ]      [  Local  ]
[        ]Save->[ Active ]      [ Storage ]
[        ]      [ Config ]Save->[         ]
*/

/**
 * Create a textarea and a set of buttons to give access to the text
 * @class
 */
class OnBrowserTextEditor {
  constructor () {
    this.callbacks = {}
    this.makeDomStructure()
    
    this.visibilityTimerID = 0
    this.buttonProtectionTimerID = 0
  }
  
  makeDomStructure () {
    const title = document.createElement('h1')
    title.setAttribute('class', 'title')
    const closeButton = document.createElement('button')
    closeButton.classList.add('close')
    closeButton.textContent = '　　Ｘ　　'
    const textarea = document.createElement('textarea')
    textarea.setAttribute('class', 'after-margin')
    const notifyArea = document.createElement('div')
    notifyArea.setAttribute('id', 'notify-area')
    notifyArea.setAttribute('class', 'no-divider')
    const buttonDiv = document.createElement('div')
    const saveButton = document.createElement('button')
    saveButton.textContent =
      'Save Current Text as Configuration'
    const loadButton = document.createElement('button')
    loadButton.textContent =
      'Load Current Configuration'
    const oneEmptySpaceLetter = document.createElement('span')
    oneEmptySpaceLetter.innerText = ' '
    buttonDiv.appendChild(saveButton)
    buttonDiv.appendChild(oneEmptySpaceLetter)
    buttonDiv.appendChild(loadButton)
  
    closeButton.addEventListener('click', () => {this.visibility = false})
    saveButton.addEventListener('click', this.save.bind(this))
    loadButton.addEventListener('click', this.load.bind(this))
  
    const wrapper = document.createElement('div')
    wrapper.setAttribute('id', 'text-editor-wrapper')
    wrapper.appendChild(title)
    wrapper.appendChild(closeButton)
    wrapper.appendChild(textarea)
    wrapper.appendChild(notifyArea)
    wrapper.appendChild(buttonDiv)
    
    this.dom = {
      wrapper, title, textarea, notifyArea, buttonDiv, saveButton, loadButton
    }
  }
  
  appendToParent (parentDom) {
    parentDom.appendChild(this.dom.wrapper)
  }
  
  set visibility (state) {
    if (typeof state === 'boolean') {
      if (state) this.dom.wrapper.classList.add('active')
      else this.dom.wrapper.classList.remove('active')
    } else {
      this.dom.wrapper.classList.toggle('active')
    }
    /*
     this prevents accidental double clicks
     where the second one actually reaching a button
     before the user recognize the button appearing.
     */
    if (this.dom.wrapper.classList.contains('active')) {
      const buttons = Array.from(
        this.dom.buttonDiv.getElementsByTagName('button')
      )
      if (this.buttonProtectionTimerID) {
        clearTimeout(this.buttonProtectionTimerID)
      }
      buttons.forEach(b => {
        b.setAttribute('disabled', '')
      })
      this.buttonProtectionTimerID =
        setTimeout(buttons => {
          buttons.forEach(b => {
            b.removeAttribute('disabled')
          })
        }, 500, buttons)
    }
  }
  
  /** @param {TextEditorCallbacks} callbacks */
  changeFocus (callbacks) {
    this.callbacks = callbacks
    this.dom.title.innerText = this.callbacks.title
    this.load()
  }
  
  /**
   * gives the text in the textarea for the callback in the parameter to do the job.
   */
  save () {
    if (!this.callbacks.save) {
      this.notify('There\'s no save function assigned!', true)
      return false
    }
    this.callbacks.save(this.dom.textarea.value, this.notify.bind(this))
  }
  /**
   * gives the textarea for the callback in the parameter to do the job.
   */
  load () {
    if (!this.callbacks.load) {
      this.notify('There\'s no load function assigned!', true)
      return false
    }
    this.dom.textarea.value = ''
    this.callbacks.load(this.dom.textarea, this.notify.bind(this))
  }
  
  /**
   * accepts the message info and change the notification area class name for a brief time.
   *
   * @param {string} message
   * @param {boolean} isError
   */
  notify (message, isError) {
    this.dom.notifyArea.classList.add('visible')
    if (isError) {
      this.dom.notifyArea.classList.add('error')
    }
    this.dom.notifyArea.innerText = message
    if (this.visibilityTimerID) {
      clearTimeout(this.visibilityTimerID)
    }
    this.visibilityTimerID = setTimeout(area => {
      area.classList.remove('visible')
      area.classList.remove('error')
    }, 4000, this.dom.notifyArea)
  }
}
