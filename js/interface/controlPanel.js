/*
this is made solely for this project!
Good bye reusability!!!
 */
class ControlPanel {
  /**
   *
   * @param {Object.<string, string>} typeListingObject
   * @param {string[]} globalEventsToListen
   */
  constructor (typeListingObject, globalEventsToListen) {
    this.panel = {}
    this.globalEventCallbacks = []
    this.panelValues = {}
    this.loadPanelValues()
    
    this.browser = ControlPanel.detectBrowser()
    
    for (const item in typeListingObject) {
      if (!typeListingObject.hasOwnProperty(item)) continue
      this.panel[item] = this.getControlForType(
        typeListingObject[item], item
      )
    }
    
    this.globalEvents = globalEventsToListen
    this.globalEvents.forEach(eventType => {
      window.addEventListener(eventType, e => {
        this.globalEventCallbacks.forEach(f => f(e))
      })
    })
    
    this.setPanelValuesInBulk = this.setPanelValuesInBulk.bind(this)
  }
  
  static announceMessage (message, type) {
    const messageType = {
      log: 'log',
      error: 'error'
    }
    window.dispatchEvent(new CustomEvent('GPVMessage', {
      detail: {
        from: 'Control Panel',
        type: message instanceof Error ?
          messageType.error : ( messageType[type] || messageType.log ),
        message: type === 'error' ?
          new Error(JSON.stringify(message)) : message
      }
    }))
  }
  
  static get recognizedTypes () {
    return [
      'dynamicButtons', 'selectFromList', 'slider', 'textArray', 'buttons', 'uploader'
    ]
  }
  
  /**
   * detects if it's Firefox or Chrome.
   * @return {string}
   */
  static detectBrowser () {
    // can't believe `!!window.chrome` doesn't work on OBS browser
    if (/Chrome\/\d+/.test(navigator.userAgent)) { return 'Chrome' }
    if (typeof InstallTrigger !== 'undefined') { return 'Firefox' }
  }
  
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
  
  static getIndexedElements (elementContainer, elementType) {
    const elements = Array.from(elementContainer.querySelectorAll(elementType))
    for (let i = 0; i < elements.length; i++) {
      elements[i].dataset.index = i
    }
    return elements
  }
  
  setPanelValue (key, value) {
    this.panelValues[key] = value
    this.savePanelValues()
  }
  setPanelValuesInBulk (keyValuePairs) {
    if (
      !(keyValuePairs instanceof Object) ||
      Object.keys(keyValuePairs).length === 0
    ) {
      return new Error('invalid pairs for panel values')
    }
    
    this.resetPanelValues()
    for (const key in keyValuePairs) {
      if (!keyValuePairs.hasOwnProperty(key)) { continue }
      this.setPanelValue(key, keyValuePairs[key])
      if (this.panel.hasOwnProperty(key)) {
        this.panel[key].receivePanelValue(this.panelValues[key])
      }
    }
    this.savePanelValues()
    
    return true
  }
  removePanelValue (key) {
    delete this.panelValues[key]
  }
  resetPanelValues () {
    for (const key in this.panelValues) {
      if (!this.panelValues.hasOwnProperty(key)) { continue }
      this.removePanelValue(key)
    }
  }
  savePanelValues () {
    const converted = JSON.stringify(this.panelValues)
    window.localStorage.setItem('controlPanelValues', converted)
  }
  loadPanelValues () {
    const converted = JSON.parse(
      window.localStorage.getItem('controlPanelValues')
    )
    this.panelValues = converted || this.panelValues || {}
  }
  
  getControlForType (typeName, name) {
    if (ControlPanel.recognizedTypes.indexOf(typeName) === -1) {
      return null
    }
    
    const TypeName = typeName.charAt(0).toUpperCase() +
                     typeName.slice(1)
    
    if (this[`getControlFor${TypeName}`]) {
      const control = this[`getControlFor${TypeName}`](name)
      
      if (control.hasOwnProperty('globalEventCallback')) {
        this.globalEventCallbacks.push(
          control.globalEventCallback.bind(control)
        )
      }
    
      if (control.hasOwnProperty('panelValue')) {
        if (!this.panelValues.hasOwnProperty(name)) {
          this.setPanelValue(name, null)
        }
        // panelValue from outside -> control.panelValue
        const receivePanelValue = function (value) {
          this.panelValue = value
          this.applyPanelValue()
        }
        // control.panelValue -> CP.panelValues[name]
        const updatePanelValue = value => { this.setPanelValue(name, value) }
  
        control.receivePanelValue = receivePanelValue.bind(control)
        control.updatePanelValue = updatePanelValue.bind(this)
        control.receivePanelValue(
          this.panelValues[name]
        )
      }
    
      return control
      // `this` in the returning method points that method,
      // which is assigned to `this.panel.item` of this instance.
    } else {
      return null
    }
  }
  
  getControlForDynamicButtons (name) {
    return {
      name: name,
      assign: function (buttonContainer, customCallback) {
        this.container = buttonContainer
        this.buttons = ControlPanel.getIndexedElements(buttonContainer, 'button')
        this.callback = customCallback
        this.container.addEventListener('click', e => {
          if (e.target.tagName !== 'BUTTON') return
          this.callback(
            e.target.dataset.index,
            e.target.dataset.name,
            e.target.dataset.gamepadId
          )
        })
      },
      globalEventCallback: function (e) {
        if (
          e.type !== 'gamepadconnected' &&
          e.type !== 'gamepaddisconnected'
        ) {
          return false
        }
        if (!this.buttons || !this.changeLabel) {
          return false
        }
        switch (e.gamepad.connected) {
          case true:
            const id = ControlPanel.getGamepadId(e.gamepad.id)
            const label = `${id.name}<br><span>${id.gamepadId}</span>`
            this.changeLabel(e.gamepad.index, id, label)
            this.buttons[e.gamepad.index].classList.remove('inactive')
            break
          case false:
            this.changeLabel(e.gamepad.index, null, '-')
            this.buttons[e.gamepad.index].classList.add('inactive')
            break
        }
        
      },
      changeLabel: function (index, id, newText) {
        if (typeof newText !== 'string' || !newText.length) { return }
        this.buttons[index].dataset.name = id ? id.name : ''
        this.buttons[index].dataset.gamepadId = id ? id.gamepadId : ''
        this.buttons[index].innerHTML = newText
      }
    }
  }
  
  getControlForSelectFromList (name) {
    return {
      name: name,
      assign: function (
        selectContainer, labelTextElements, listReference, customCallback,
        defaultSelectedList
      ) {
        this.container = selectContainer
        this.texts = labelTextElements
        this.list = listReference
        this.defaultSelectedList = defaultSelectedList
        this.selects = ControlPanel.getIndexedElements(selectContainer, 'select')
        this.addPlaceholder()
        this.addItems(this.list)
        this.callback = customCallback
        this.container.addEventListener('mouseenter', () => {
          this.updateItems(this.list)
        })
        this.container.addEventListener('change', e => {
          if (e.target.tagName !== 'SELECT') return
          const index = e.target.dataset.index
          const text = this.texts[index]
          this.callback(
            index,
            text.dataset.gamepadId,
            e.target.selectedOptions[0].value
          )
        })
      },
      getExistingValues: function () {
        return Array.from(this.selects[0].options).map(v => v.value)
      },
      addPlaceholder: function () {
        const item = document.createElement('option')
        item.value = '...'
        item.innerHTML = '...'
        item.setAttribute('disabled','')
        item.setAttribute('selected','')
        for(let s = 0; s < this.selects.length; s++) {
          this.selects[s].options.add(item.cloneNode(true))
        }
      },
      addItem: function (value) {
        if (typeof value === 'undefined' || value === null || !value.length) { return false }
        const item = document.createElement('option')
        item.value = value
        item.setAttribute('name', value)
        item.innerHTML = value
        for(let s = 0; s < this.selects.length; s++) {
          this.selects[s].options.add(item.cloneNode(true))
        }
      },
      addItems: function (valueArray) {
        const existingValues = this.getExistingValues()
        for (let i = 0; i < valueArray.length; i++) {
          if (existingValues.indexOf(valueArray[i]) === -1) {
            this.addItem(valueArray[i])
          }
        }
      },
      removeItem: function (value) {
        if (typeof value === 'undefined' || !value.length) { return false }
        for (let s = 0; s < this.selects.length; s++) {
          this.selects[s].options.namedItem(value).remove()
        }
      },
      removeAllItems: function () {
        for (let s = 0; s < this.selects.length; s++) {
          while (this.selects[s].options.length > 0) {
            this.selects[s].options.remove(0)
          }
        }
      },
      updateItems: function (valueArray) {
        const existingValues = this.getExistingValues()
        // remove ones that doesn't exist in valueArray
        // i === 0 is the placeholder
        for (let i = 1; i < existingValues.length; i++) {
          if (valueArray.indexOf(existingValues[i]) !== -1) { continue }
          // update all selects that were pointing at this index
          /*
           * this will only work if the lists are stored as references to
           * actual lists properly being updated before this method is called.
           */
          for (let s = 0; s < this.selects.length; s++) {
            const select = this.selects[s]
            if (select.selectedIndex !== i) { continue }
            const gamepadId = this.texts[s].dataset.gamepadId
            const mappedItem = this.defaultSelectedList[gamepadId]
            const indexOfMappedItem = this.list.indexOf(mappedItem)
            // selectIndex === listIndex + 1 (there's a placeholder at index 0)
            select.selectedIndex = indexOfMappedItem !== -1 ? indexOfMappedItem + 1 : 0
            /*
             * for the skin list usage, these are the references:
             * - list === Renderer.skinList
             * - defaultSelectedList === Renderer.skinMapping
             * The final chosen index will be one decided by
             * `GamepadRenderer.findDefaultSkin`,
             * which is applied to skinMapping before this method is called.
             */
          }
          // remove the index
          this.removeItem(existingValues[i])
        }
        // call addItems which will skip items already existing in valueArray
        this.addItems(valueArray)
      },
      globalEventCallback: function (e) {
        if (
          e.type !== 'gamepadconnected' &&
          e.type !== 'gamepaddisconnected'
        ) {
          return false
        }
        if (!this.selects) {
          return false
        }
        switch (e.gamepad.connected) {
          case true:
            const id = ControlPanel.getGamepadId(e.gamepad.id)
            const text = `${id.name} <sub>${id.gamepadId}</sub>`
            this.changeLabel(e.gamepad.index, id, text)
            const defaultValue = this.defaultSelectedList[id.gamepadId]
            if (defaultValue) {
              this.selects[e.gamepad.index].value = defaultValue
            }
            this.texts[e.gamepad.index].parentElement.classList.remove('inactive')
            break
          case false:
            this.changeLabel(e.gamepad.index, null, '-')
            this.texts[e.gamepad.index].parentElement.classList.add('inactive')
            break
        }
      },
      changeLabel: function (index, id, newText) {
        if (typeof newText !== 'string' || !newText.length) { return }
        this.texts[index].dataset.name = id ? id.name : ''
        this.texts[index].dataset.gamepadId = id ? id.gamepadId : ''
        this.texts[index].innerHTML = newText
      }
    }
  }
  
  getControlForButtons (name) {
    return {
      name: name,
      assign: function (buttonContainer, custonCallback) {
        this.container = buttonContainer
        this.buttons = ControlPanel.getIndexedElements(buttonContainer, 'button')
        this.callback = custonCallback
        this.container.addEventListener('click', e => {
          if (e.target.tagName !== 'BUTTON') return
          this.callback(e)
        })
      }
    }
  }
  
  getControlForSlider (name) {
    return {
      name: name,
      /** @type {number} */
      panelValue: null,
      applyPanelValue: function () {
        if (this.slider && this.callback) {
          this.slider.value = this.panelValue
          this.callback({target: {value: this.panelValue}})
        }
      },
      assign: function (input, customCallback) {
        this.slider = input
        this.callback = customCallback
        if (this.panelValue) {
          this.applyPanelValue()
        } else {
          this.receivePanelValue(this.slider.min)
          this.updatePanelValue(this.panelValue)
        }
        this.slider.addEventListener('change', e => {
          this.panelValue = e.target.value
          this.updatePanelValue(this.panelValue)
          this.callback(e)
        })
      },
    }
  }
  
  getControlForTextArray (name) {
    return {
      name: name,
      /** @type {string[]} */
      panelValue: null,
      applyPanelValue: function () {
        if (this.textArray && this.callback) {
          for (let i = 0; i < this.textArray.length; i++) {
            this.textArray[i].value = this.panelValue[i]
          }
          this.callback(this.panelValue)
        }
      },
      assign: function (textArrayContainer, customCallback) {
        this.container = textArrayContainer
        this.textArray =
          ControlPanel.getIndexedElements(textArrayContainer, 'input')
        this.callback = customCallback
        if (this.panelValue) {
          this.applyPanelValue()
        }
        this.container.addEventListener('change', e => {
          if (e.target.tagName !== 'INPUT') return
          const index = e.target.dataset.index
          this.panelValue[index] = e.target.value
          this.updatePanelValue(this.panelValue)
          this.callback(this.panelValue)
        })
      }
    }
  }
  
  getControlForUploader (name) {
    return {
      name: name,
      assign: function (
        localStorageKey, {
          input, droparea, visibleButton, indicator, removeButton
        }, {
          typeCheckFunction, indicatorUpdateCallback, customCallback
        }) {
        this.maxFileAmount = 5
        
        this.input = input
        this.droparea = droparea
        this.replaceInput = Boolean(visibleButton)
        this.button = visibleButton || null
        this.typeCheck = typeCheckFunction
        this.removeButton = removeButton
        this.updateIndicator = indicatorUpdateCallback
        this.callback = customCallback
        
        this.localStorageKey = localStorageKey
        this.loadedData = {}
        this.loadData(undefined, false)
        
        // receive dropped files just in case
        this.droparea.addEventListener('dragenter', this._preventDefault, false)
        this.droparea.addEventListener('dragover', this._preventDefault, false)
        this.droparea.addEventListener('drop', e => {
          this._preventDefault(e)
          this._handleFiles(e.dataTransfer.files)
        }, false)
        
        this.input.addEventListener('change', e => {
          this._preventDefault(e)
          this._handleFiles(e.target.files)
        })
        if (this.replaceInput) {
          this.button.addEventListener('click', () => {
            this.input.click()
          }, false)
        }
        this.removeButton.addEventListener('click', this.removeData.bind(this), false)
      },
      _preventDefault: function (e) {
        e.stopPropagation()
        e.preventDefault()
      },
      _applyData: function (dataObj = this.loadedData, runCallback = true) {
        if (!dataObj) {
          this.updateIndicator('')
          if (runCallback) { this.callback(null) }
          return
        }
        this.updateIndicator(dataObj.name)
        if (runCallback) { this.callback(dataObj) }
      },
      
      // the data will be too big with images as dataURI,
      // so I give this type its own local storage control
      setData: function (dataObj, runCallback = true) {
        for (const property in this.loadedData) {
          if (!this.loadedData.hasOwnProperty(property)) { continue }
          delete this.loadedData[property]
        }
        Object.assign(this.loadedData, dataObj || {})
        this.saveData(dataObj)
        this._applyData(dataObj, runCallback)
      },
      saveData: function (dataObj) {
        if (!dataObj) {
          window.localStorage.removeItem(this.localStorageKey)
          return
        }
        const dataJson = JSON.stringify(dataObj)
        window.localStorage.setItem(this.localStorageKey, dataJson)
      },
      loadData: function (dataJson, runCallback = true) {
        try {
          const dataObj = JSON.parse(
            dataJson || window.localStorage.getItem(this.localStorageKey)
          )
          if (dataObj) {
            this.setData(dataObj, runCallback)
          }
        } catch (e) {
          ControlPanel.announceMessage(new Error(e))
        }
      },
      removeData: function () {
        this.setData(null)
      },
      
      _handleFiles: function (files, maxAmount = this.maxFileAmount) {
        const fileAmount = Math.min(files.length, maxAmount)
        const fileNames = []
        const dataPrepared = []
        
        for (let i = 0; i < fileAmount ; i++) {
          const file = files[i]
          const type = this.typeCheck ?
            this.typeCheck(file.type) : file.type
          
          if (!type) {
            ControlPanel.announceMessage(new Error(
              'wrong file type is given: ' + file.type
            ))
            continue
          }
          
          const dataPromise = new Promise((resolve, reject) => {
            const reader = new FileReader()
            switch (type) {
              case 'json': reader.readAsText(file); break
              case 'image': reader.readAsDataURL(file); break
              default:
                reject('wrong file type is given: ' + file.type)
                break
            }
            reader.onload = () => resolve(reader.result)
          })
          
          // put json as the first data in the array
          switch (type) {
            case 'json':
              fileNames.unshift(file.name)
              dataPrepared.unshift(dataPromise)
              break
            default:
              fileNames.push(file.name)
              dataPrepared.push(dataPromise)
              break
          }
        }
        
        // send loaded data to given callbacks
        Promise.all(dataPrepared).then(dataArray => {
          // parse first data - which is expected to be a json
          dataArray[0] = JSON.parse(dataArray[0])
          const config = dataArray[0]
          
          // replace image file name with corresponding data url
          for (let i = 0; i < config.src.length; i++) {
            const srcName = config.src[i]
            // skip conversion if the source is a data url or a link
            if (
              srcName.startsWith('data:image/') ||
              srcName.startsWith('http')
            ) { continue }
            
            const srcIndexInFiles = fileNames.indexOf(srcName)
            if (srcIndexInFiles === -1) {
              // for typo in config.json
              ControlPanel.announceMessage(new Error(
                `src file name \`${srcName}\` doesn't match any actual file.`
              ))
              return this.callback(false)
            }
            
            config.src[i] = dataArray[srcIndexInFiles]
          }
  
          this.setData(config)
        }, reason => {
          ControlPanel.announceMessage(new Error(reason))
        })
      }
    }
  }
}
