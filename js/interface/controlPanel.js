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
      assign: function (buttonDomArray, callbackOnClick) {
        this.buttons = buttonDomArray
        this.buttons.forEach((v, i) => {
          v.dataset.index = i
          v.addEventListener('click', callbackOnClick)
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
            this.changeLabel(e.gamepad.index, label)
            this.buttons[e.gamepad.index].classList.remove('inactive')
            break;
          case false:
            this.changeLabel(e.gamepad.index, '-')
            this.buttons[e.gamepad.index].classList.add('inactive')
            break;
        }
        
      },
      changeLabel: function (index, newText) {
        if (
          typeof newText === 'string' &&
          newText.length
        ) {
          this.buttons[index].innerHTML = newText
        }
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
      assign: function (buttonDomArray, callbackOnClick) {
        this.buttons = buttonDomArray
        this.buttons.forEach((v, i) => {
          v.dataset.index = i
          v.addEventListener('click', callbackOnClick)
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
