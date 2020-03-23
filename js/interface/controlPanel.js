/**
 * @typedef {string} gamepadId 8-digit hexadecimal string
 */

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
    for (const item in typeListingObject) {
      if (!typeListingObject.hasOwnProperty(item)) continue
      this.panel[item] = this.getControlForType(typeListingObject[item])
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
      'buttons', 'selectFromList', 'slider', 'textArrays', 'button'
    ]
  }
  
  /**
   * Extract human readable description and gamepadId from `Gamepad.id`.
   * @param {string} idString
   * @returns {{name: string, gamepadId: (gamepadId|string)}}
   */
  static getGamepadId (idString) {
    if (/XInput/.test(idString)) {
      const indexBeforeBracket = idString.search(/ \(/)
      return {
        name: idString.substring(0, indexBeforeBracket),
        gamepadId: 'XInput'
      }
    } else {
      const matchResult = idString.match(/ \(.*Vendor: ([0-9a-f]{4}) Product: ([0-9a-f]{4})\)/)
      return {
        name: idString.substring(0, matchResult.index),
        gamepadId: matchResult[1] + matchResult[2]
      }
    }
  }
  
  getControlForType (typeName) {
    if (ControlPanel.recognizedTypes.indexOf(typeName) === -1) {
      return null
    }
    const TypeName = typeName.charAt(0).toUpperCase() +
                     typeName.slice(1)
    if (this[`getControlFor${TypeName}`]) {
      const control = this[`getControlFor${TypeName}`]()
      if (control.hasOwnProperty('globalEventCallback')) {
        this.globalEventCallbacks.push(control.globalEventCallback.bind(control))
      }
      return control
      // `this` in the returning method points that method,
      // which is assigned to `this.panel.item` of this instance.
    } else {
      return null
    }
  }
  
  getControlForButtons () {
    return {
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
}





/*
cp.assignment.click(0)
cp.layout.set(0).to(5)
cp.displayWidth.set(4)
cp.fadeout.time.set(8,16,32)
cp.fadeout.opacity.set(0.5,0.9,1)
cp.fadeout.duration.set(4)
cp.mappingmanagement.click()
 */
