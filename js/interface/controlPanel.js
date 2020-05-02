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
  
  static get recognizedTypes () {
    return [
      'dynamicButtons', 'selectFromList', 'slider', 'textArray', 'buttons'
    ]
  }
  
  /**
   * Extract human readable description and gamepadId from `Gamepad.id`.
   * @param {string} idString
   * @returns {{name: string, gamepadId: gamepadId}}
   */
  static getGamepadId (idString) {
    const matchResult = idString.match(/ \(.*Vendor: ([0-9a-f]{4}) Product: ([0-9a-f]{4})\)/)
    if (matchResult) {
      return {
        name: idString.substring(0, matchResult.index),
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
        name: 'DInput Standard Controller?',
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
      typeof keyValuePairs !== 'object' ||
      Object.keys(keyValuePairs).length === 0
    ) {
      return false
    }
    
    this.resetPanelValues()
    for (const key in keyValuePairs) {
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
      name: name
    }
  }
  
  getControlForButtons (name) {
    return {
      name: name,
      assign: function (buttonContainer, custonCallback) {
        this.container = buttonContainer
        this.buttons = Array.from(
          buttonContainer.querySelectorAll('button')
        )
        this.callback = custonCallback
        for (let i = 0; i < this.buttons.length; i++) {
          this.buttons[i].dataset.index = i
        }
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
        this.textArray = Array.from(
          textArrayContainer.querySelectorAll('input')
        )
        this.callback = customCallback
        for (let i = 0; i < this.textArray.length; i++) {
          this.textArray[i].dataset.index = i
        }
        if (this.panelValue) {
          this.applyPanelValue()
        }
        this.container.addEventListener('change', e => {
          if (e.target.tagName !== 'INPUT') return
          const index = e.target.dataset.index
          const value = e.target.value
          this.panelValue[index] = value
          this.updatePanelValue(this.panelValue)
          this.callback(this.panelValue)
        })
      }
    }
  }
}
