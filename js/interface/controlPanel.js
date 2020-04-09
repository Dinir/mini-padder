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
    this.panelValue = {}
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
  }
  
  static get recognizedTypes () {
    return [
      'dynamicButtons', 'selectFromList', 'slider', 'textArrays', 'buttons'
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
    this.panelValue[key] = value
    this.savePanelValues()
  }
  removePanelValue (key) {
    delete this.panelValue[key]
  }
  savePanelValues () {
    const converted = JSON.stringify(this.panelValue)
    window.localStorage.setItem('controlPanelValues', converted)
  }
  loadPanelValues () {
    const converted = JSON.parse(
      window.localStorage.getItem('controlPanelValues')
    )
    this.panelValue = converted || {}
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
        if (this.panelValue.hasOwnProperty(name)) {
          control.receivePanelValue(
            this.panelValue[name]
          )
        }
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
    const nameOnPanel = name
    const updatePanelValue = value => {
      this.setPanelValue(nameOnPanel, value)
    }
    return {
      name: name,
      panelValue: null,
      assign: function (input, customCallback) {
        this.slider = input
        this.callback = customCallback
        if (this.panelValue) {
          this.updateSlider()
        }
        this.slider.addEventListener('change', e => {
          this.panelValue = e.target.value
          updatePanelValue(this.panelValue)
          this.callback(e)
        })
      },
      receivePanelValue: function (value) {
        this.panelValue = value
        this.updateSlider()
      },
      updateSlider () {
        if (this.slider && this.callback) {
          this.slider.value = this.panelValue
          this.callback({target: {value: this.panelValue}})
        }
      }
    }
  }
}
