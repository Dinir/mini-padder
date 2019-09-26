import OnBrowserTextEditor from './src/OnBrowserTextEditor.js'
import MappingStorageManager from './src/MappingStorageManager.js'
import GamepadWatcher from './src/GamepadWatcher.js'

window.onload = function () {
    document.body.style.fontSize = '16px'
    if (gpConstants.useFadeOut) { timeValues.fpsCheck() }
  }

  // these are things needed to count a tick of rAF per second.
  // in `gamepadDOMs.update` which is called in every tick,
  // `timeValues.fpsIncrease` is called for 1 second.
  // `timeValues.fpsCheck` is called on window load which stops
  // counting after 1 second from loading.
  var timeValues = {
    fps: 0
    , fpsChecked: false
    , fpsIncrease: function () { timeValues.fps++ }
    , fpsCheck: function () {
      var o = setTimeout(function () {
        timeValues.fpsChecked = true
        clearTimeout(o)
      }, 1000)
    }
  }

  // for the 'in' keyword: I used the code below as a reference.
  // https://github.com/luser/gamepadtest/blob/master/gamepadtest.js
  var haveEvents = 'GamepadEvent' in window
  var haveWebkitEvents = 'WebKitGamepadEvent' in window
  var rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame

  // this will contain gamepad objects.
  var gamepads = {}
  if (gpConstants.useFadeOut) {
    var gamepadTimestamps = {}

    function gamepadTimestamp () {
      var buttons = []
      var axes = {}

      this.buttonAdd = function () { buttons.push({t: 0, v: 0}) }
      this.axisAdd = function (n) { axes[n] = {t: 0, v: 0} }

      this.getButtonStatus = function (n) {
        return buttons[n]
      }
      this.getAxisTimestamp = function (n) {
        return axes[n].t
      }

      this.age = function () {
        var max = timeValues.fps * gpConstants.fadeOutTime[gpConstants.fadeOutTime.length - 1]
        for (var i = 0; i < buttons.length; i++) {
          if (buttons[i].t < max) {
            buttons[i].t++
          }
        }
        for (a in axes) {
          if (axes[a].t < max) {
            axes[a].t++
          }
        }
      }

      // these 'update' functions tell if an input method is considered as 'touched'.
      this.buttonUpdate = function (n, v) {
        if (buttons[n].v !== v) {
          buttons[n].t = 0
          buttons[n].v = v
          return true
        } else {
          return false
        }
      }
      this.axisUpdate = function (n, v) {
        // update the value always
        axes[n].v = v
        // check if the position is away enough from the center
        // that the axis values is bigger than the deadzone
        if (Math.abs(v) > gpConstants.axisDeadzone) {
          axes[n].t = 0
          return true
        } else {
          return false
        }
      }
    }
  }

  var gamepadHandler = {
    connect: function (e) {
      gamepads[e.index] = e
      console.log('connected: %d', e.index)
      gamepadDOMs.add(e)
    },
    disconnect: function (index) {
      console.log('disconnecting: %d', index)
      gamepadDOMs.remove(index)
      delete gamepads[index]
    },
    scan: function () {
      var gamepadsFromNavigator = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : [])
      for (var i = 0; i < gamepadsFromNavigator.length; i++) {
        if (gamepadsFromNavigator[i]) {
          if (gamepadsFromNavigator[i].index in gamepads) {
            gamepads[gamepadsFromNavigator[i].index] = gamepadsFromNavigator[i]
          } else {
            gamepadHandler.connect(gamepadsFromNavigator[i])
          }
        } else if ((gamepadsFromNavigator[i] === null || gamepadsFromNavigator[i] === undefined)
          && document.getElementById(`gp${i}`)) {
          gamepadHandler.disconnect(i)
        }
      }
    }
  }

  var gamepadMapping = {
    // XBox Pad (One, 360)
    // Linux
    'Microsoft Controller (STANDARD GAMEPAD Vendor: 045e Product: 02d1)': {
      buttons: [
        {name: 'A', type: 'button'}
        , {name: 'B', type: 'button'}
        , {name: 'X', type: 'button'}
        , {name: 'Y', type: 'button'}
        , {name: 'LB', type: 'button'}
        , {name: 'RB', type: 'button'}
        , {name: 'LT', type: 'button shoulder'}
        , {name: 'RT', type: 'button shoulder'}
        , {name: 'Se', type: 'button'}
        , {name: 'St', type: 'button'}
        , {name: 'L', type: 'button thumb'}
        , {name: 'R', type: 'button thumb'}
        , {name: '↑', type: 'button'}
        , {name: '↓', type: 'button'}
        , {name: '←', type: 'button'}
        , {name: '→', type: 'button'}
        , {name: 'ⓧ', type: 'button'}
      ]
      , axes: [
        {name: 'L', type: 'thumb'}
        , {name: 'L', type: 'thumb'}
        , {name: 'R', type: 'thumb'}
        , {name: 'R', type: 'thumb'}
      ]
    }
    // Windows
    , 'Xbox 360 Controller (XInput STANDARD GAMEPAD)': {
      buttons: [
        {name: 'A', type: 'button'}
        , {name: 'B', type: 'button'}
        , {name: 'X', type: 'button'}
        , {name: 'Y', type: 'button'}
        , {name: 'LB', type: 'button'}
        , {name: 'RB', type: 'button'}
        , {name: 'LT', type: 'button'}
        , {name: 'RT', type: 'button'}
        , {name: 'Se', type: 'button'}
        , {name: 'St', type: 'button'}
        , {name: 'L', type: 'button thumb'}
        , {name: 'R', type: 'button thumb'}
        , {name: '⏶', type: 'button'}
        , {name: '⏷', type: 'button'}
        , {name: '⏴', type: 'button'}
        , {name: '⏵', type: 'button'}
      ]
      , axes: [
        {name: 'L', type: 'thumb'}
        , {name: 'L', type: 'thumb'}
        , {name: 'R', type: 'thumb'}
        , {name: 'R', type: 'thumb'}
      ]
    }
    , 'xinput': {
      buttons: [
        {name: 'A', type: 'button'}
        , {name: 'B', type: 'button'}
        , {name: 'X', type: 'button'}
        , {name: 'Y', type: 'button'}
        , {name: 'LB', type: 'button'}
        , {name: 'RB', type: 'button'}
        , {name: 'LT', type: 'button'}
        , {name: 'RT', type: 'button'}
        , {name: 'Se', type: 'button'}
        , {name: 'St', type: 'button'}
        , {name: 'L', type: 'button thumb'}
        , {name: 'R', type: 'button thumb'}
        , {name: '⏶', type: 'button'}
        , {name: '⏷', type: 'button'}
        , {name: '⏴', type: 'button'}
        , {name: '⏵', type: 'button'}
      ]
      , axes: [
        {name: 'L', type: 'thumb'}
        , {name: 'L', type: 'thumb'}
        , {name: 'R', type: 'thumb'}
        , {name: 'R', type: 'thumb'}
      ]
    }

    // DualShock4
    // Windows
    , 'Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 05c4)': {
      buttons: [
        {name: 'X', type: 'button'}
        , {name: '◯', type: 'button'}
        , {name: '□', type: 'button'}
        , {name: 'Δ', type: 'button'}
        , {name: 'L1', type: 'button'}
        , {name: 'R1', type: 'button'}
        , {name: 'L2', type: 'button'}
        , {name: 'R2', type: 'button'}
        , {name: 'Sh', type: 'button'}
        , {name: 'Op', type: 'button'}
        , {name: 'L', type: 'button thumb'}
        , {name: 'R', type: 'button thumb'}
        , {name: '⏶', type: 'button'}
        , {name: '⏷', type: 'button'}
        , {name: '⏴', type: 'button'}
        , {name: '⏵', type: 'button'}
        , {name: 'PS', type: 'button'}
        , {name: 'TP', type: 'button'}
      ]
      , axes: [
        {name: 'L', type: 'thumb'}
        , {name: 'L', type: 'thumb'}
        , {name: 'R', type: 'thumb'}
        , {name: 'R', type: 'thumb'}
      ]
    }
    , 'Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 09cc)': {
      buttons: [
        {name: 'X', type: 'button'}
        , {name: '◯', type: 'button'}
        , {name: '□', type: 'button'}
        , {name: 'Δ', type: 'button'}
        , {name: 'L1', type: 'button'}
        , {name: 'R1', type: 'button'}
        , {name: 'L2', type: 'button'}
        , {name: 'R2', type: 'button'}
        , {name: 'Sh', type: 'button'}
        , {name: 'Op', type: 'button'}
        , {name: 'L', type: 'button thumb'}
        , {name: 'R', type: 'button thumb'}
        , {name: '⏶', type: 'button'}
        , {name: '⏷', type: 'button'}
        , {name: '⏴', type: 'button'}
        , {name: '⏵', type: 'button'}
        , {name: 'PS', type: 'button'}
        , {name: 'TP', type: 'button'}
      ]
      , axes: [
        {name: 'L', type: 'thumb'}
        , {name: 'L', type: 'thumb'}
        , {name: 'R', type: 'thumb'}
        , {name: 'R', type: 'thumb'}
      ]
    }
    , 'Sony Interactive Entertainment Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 09cc)': {
      buttons: [
        {name: 'X', type: 'button'}
        , {name: '◯', type: 'button'}
        , {name: '□', type: 'button'}
        , {name: 'Δ', type: 'button'}
        , {name: 'L1', type: 'button'}
        , {name: 'R1', type: 'button'}
        , {name: 'L2', type: 'button'}
        , {name: 'R2', type: 'button'}
        , {name: 'Sh', type: 'button'}
        , {name: 'Op', type: 'button'}
        , {name: 'L', type: 'button thumb'}
        , {name: 'R', type: 'button thumb'}
        , {name: '⏶', type: 'button'}
        , {name: '⏷', type: 'button'}
        , {name: '⏴', type: 'button'}
        , {name: '⏵', type: 'button'}
        , {name: 'PS', type: 'button'}
        , {name: 'TP', type: 'button'}
      ]
      , axes: [
        {name: 'L', type: 'thumb'}
        , {name: 'L', type: 'thumb'}
        , {name: 'R', type: 'thumb'}
        , {name: 'R', type: 'thumb'}
      ]
    }
  }

  var gamepadDOMs = {
    add: function (gp) {
      if (gp.id.indexOf('Unknown Gamepad') !== -1) return
      var isLinuxXpad = gp.id === 'Microsoft Controller (STANDARD GAMEPAD Vendor: 045e Product: 02d1)'
      if (gpConstants.useFadeOut) {
        // create a couple of arrays for tracking button's timestamp
        gamepadTimestamps[gp.index] = new gamepadTimestamp()
        var gts = gamepadTimestamps[gp.index]
      }

      // create dom for a gamepad
      var d = document.createElement('div')
      d.setAttribute('id', `gp${gp.index}`)
      d.setAttribute('class', gp.id)

      // create dom for buttons
      var b = document.createElement('div')
      b.setAttribute('class', 'buttons')
      for (var i = 0; i < gp.buttons.length; i++) {
        if (gamepadMapping[gp.id]) {
          var cur = gamepadMapping[gp.id].buttons[i]
          var e = document.createElement('span')
          if (cur) {
            if (cur.type === 'button thumb') {} else {
              e.setAttribute('class', cur.type)
              e.innerHTML = cur.name
            }
          }
        } else {
          var e = document.createElement('span')
          e.setAttribute('class', 'button')
          e.innerHTML = i
        }
        e.style.filter = `hue-rotate(${gpConstants.pressedButtonBackgroundColorHue}deg)`
        e.style.transition = `opacity ${gpConstants.fadeOutDuration}s`
        b.appendChild(e)
        if (gpConstants.useFadeOut) { gts.buttonAdd() }
      }
      d.appendChild(b)

      // create dom for axes
      var a = document.createElement('div')
      a.setAttribute('class', 'axes')
      var c // c resides in e and represent the position of thumb stick.
      for (i = 0; i < gp.axes.length; i++) {
        if (gamepadMapping[gp.id]) {
          var cur = gamepadMapping[gp.id].axes[i]
          if (cur.type === 'thumb') {
            if (a.getElementsByClassName(`axis ${cur.name}`).length) {
              c.style.top = `${gpConstants.thumbSize / 2}%`
            } else {
              e = document.createElement('span')
              e.setAttribute('class', `axis ${cur.name}`)
              c = document.createElement('span')
              c.style.width = `${gpConstants.thumbSize}%`
              c.style.height = `${gpConstants.thumbSize}%`
              c.style.left = `${gpConstants.thumbSize / 2}%`
              e.style.borderColor = gpConstants.defaultColor
              e.style.filter = `hue-rotate(${gpConstants.pressedButtonBackgroundColorHue}deg)`
              e.style.transition = `opacity ${gpConstants.fadeOutDuration}s`
              e.appendChild(c)
              a.appendChild(e)
              if (gpConstants.useFadeOut) { gts.axisAdd(cur.name) }
            }
          } else if (cur.type.match('button')) {
            e = document.createElement('span')
            e.setAttribute('class', cur.type)
            if (isLinuxXpad) {
              if (cur.type.match('shoulder')) {
                e.innerHTML = cur.name
              } else if (cur.type.match('polar')) {
                // linux accepts dpad LR and dpad UD through
                // 6th and 7th axes respectively.
                e.innerHTML = i === 6 ? 'R' : 'D'
                var e2 = e.cloneNode(false)
                e2.innerHTML = i === 6 ? 'L' : 'U'
                e2.style.filter = `hue-rotate(${gpConstants.pressedButtonBackgroundColorHue}deg)`
                e2.style.transition = `opacity ${gpConstants.fadeOutDuration}s`
                b.appendChild(e2)
                if (gpConstants.useFadeOut) { gts.buttonAdd() }
              }
            }
            e.style.filter = `hue-rotate(${gpConstants.pressedButtonBackgroundColorHue}deg)`
            e.style.transition = `opacity ${gpConstants.fadeOutDuration}s`
            b.appendChild(e)
            if (gpConstants.useFadeOut) { gts.buttonAdd() }
          }
        } else {
          e = document.createElement('span')
          e.setAttribute('class', 'axis')
          e.innerHTML = `${i} `
          a.appendChild(e)
        }
      }
      d.appendChild(a)

      // attach gamepad dom to the document
      document.body.appendChild(d)
    },
    remove: function (index) {
      var d = document.getElementById(`gp${index}`)
      document.body.removeChild(d)
      delete gamepadTimestamps[index]
    },
    update: function () {
      gamepadHandler.scan()
      if (gpConstants.useFadeOut && !timeValues.fpsChecked) {
        timeValues.fpsIncrease()
      }
      for (j in gamepads) {
        var gp = gamepads[j]
        if (gp.id.indexOf('Unknown Gamepad') !== -1) continue
        var isLinuxXpad = gp.id === 'Microsoft Controller (Vendor: 045e Product: 02d1)'
        if (gpConstants.useFadeOut) {
          var gts = gamepadTimestamps[gp.index]
          gts.age()
        }
        var d = document.getElementById(`gp${gp.index}`)

        var b = d.getElementsByClassName('buttons')[0]
        for (var i = 0; i < gp.buttons.length; i++) {
          var e
          var es = gp.buttons[i] // each status of buttons
          var val = 100 * es.value
          if (gamepadMapping[gp.id]) {
            var cur = gamepadMapping[gp.id].buttons[i]
          }
          if (cur && cur.type === 'button thumb') {
            e = d.getElementsByClassName(`axis ${cur.name}`)[0].children[0]
            if (val === 100) {
              e.style.background = 'url(dot.png)'
            } else {
              e.style.background = gpConstants.defaultColor
            }
            // gamepadDOMs.opacityControl(
            // 	gts.buttonUpdate(i, val),
            // 	gts.getButtonStatus(i),
            // 	e
            // );
          } else {
            e = b.children[i] // each dom for buttons
            e.style.backgroundSize = `100% ${val}%`
            e.style.color = val ? gpConstants.pressedButtonColor : gpConstants.defaultColor
            if (gpConstants.useFadeOut) {
              gamepadDOMs.opacityControl(
                gts.buttonUpdate(i, val),
                gts.getButtonStatus(i),
                e
              )
            }
          }
        }

        var a
        for (i = 0; i < gp.axes.length; i++) {
          if (gamepadMapping[gp.id]) {
            var cur = gamepadMapping[gp.id].axes[i]
            var val = gp.axes[i]
            if (cur.type === 'thumb') {
              a = d.getElementsByClassName(`axis ${cur.name}`)[0].children[0]
              var thumbMargin = (100 - gpConstants.thumbSize) / 2

              // in Windows, axis0~4 is LeftThumbXY and RightThumbXY.
              // so I made it so if i is even it should be treated
              // as Y value.
              // in Linux, though, these XY values are 0, 1 and 3, 4.
              // I made my code bit dirty by
              // simply swapping i values just before
              // converting gamepad's value to the top and left value.
              var linuxXpadCalibration = isLinuxXpad && (i === 3 || i === 4)
                if (linuxXpadCalibration) {
                    i === 3 ? i = 4 : i = 3
                }
                if (i % 2) {
                    if (linuxXpadCalibration) {
                        i === 3 ? i = 4 : i = 3
                    }
                    a.style.top = `${thumbMargin + thumbMargin * val}%`
                } else {
                    if (linuxXpadCalibration) {
                        i === 3 ? i = 4 : i = 3
                    }
                    a.style.left = `${thumbMargin + thumbMargin * val}%`
                }
              
              if (gpConstants.useFadeOut) {
                gamepadDOMs.opacityControl(
                  gts.axisUpdate(cur.name, val),
                  gts.getAxisTimestamp(cur.name),
                  a.parentElement
                )
              }
            } else if (cur.type.match('button')) {
              if (isLinuxXpad) {
                var buttonNumber
                if (cur.type.match('shoulder')) {
                  buttonNumber = i === 2 ? 11 : 12
                  e = b.children[buttonNumber]
                  val = 50 + Math.floor(50 * val)
                  if (val) {
                    e.style.color = gpConstants.pressedButtonColor
                  } else {
                    e.style.color = gpConstants.defaultColor
                  }
                  e.style.backgroundSize = `100% ${val}%`
                  if (gpConstants.useFadeOut) {
                    gamepadDOMs.opacityControl(
                      gts.buttonUpdate(buttonNumber, val),
                      gts.getButtonStatus(buttonNumber),
                      e
                    )
                  }
                } else if (cur.type.match('polar')) {
                  var dpadX = i === 6
                  var currentMinusPolarButton = dpadX ? 13 : 15
                  var currentPlusPolarButton = dpadX ? 14 : 16
                  buttonNumber
                    = val > 0 ? currentPlusPolarButton
                    : val < 0 ? currentMinusPolarButton
                      : 0
                  val = Math.abs(100 * val)
                  if (buttonNumber) {
                    e = b.children[buttonNumber]
                    e.style.backgroundSize = `100% ${val}%`
                    e.style.color = gpConstants.pressedButtonColor
                  } else {
                    e = b.children[currentMinusPolarButton]
                    e.style.backgroundSize
                      = e.nextSibling.style.backgroundSize
                      = '100% 0%'
                    e.style.color
                      = e.nextSibling.style.color
                      = gpConstants.defaultColor
                  }
                  if (gpConstants.useFadeOut) {
                    if (buttonNumber) {
                      gamepadDOMs.opacityControl(
                        gts.buttonUpdate(buttonNumber, val),
                        gts.getButtonStatus(buttonNumber),
                        e
                      )
                    } else {
                      gamepadDOMs.opacityControl(
                        gts.buttonUpdate(currentMinusPolarButton, 0),
                        gts.getButtonStatus(currentMinusPolarButton),
                        b.children[currentMinusPolarButton]
                      )
                      gamepadDOMs.opacityControl(
                        gts.buttonUpdate(currentPlusPolarButton, 0),
                        gts.getButtonStatus(currentPlusPolarButton),
                        b.children[currentPlusPolarButton]
                      )
                    }
                  }
                }
              }
            }
          } else {
            var a = d.getElementsByClassName('axis')
            e = a[i]
            e.innerHTML = `${i}${gp.axes[i].toFixed(2)} `
          }
        }

      }
      rAF(gamepadDOMs.update)
    }
    , opacityControl: function (isChanged, status, element) {
      if (element) {
        // button's status will be passed as {timestamp, value}.
        // axis' status will be passed as timestamp,
        // and then converted to {timestamp, value=0}.
        if (typeof status === 'number') {
          status = {t: status, v: 0}
        }
        if (isChanged || status.v) {
          element.style.transition = 'opacity 0s'
          element.style.opacity = 1
          var si = setInterval(function () {
            element.style.transition = `opacity ${gpConstants.fadeOutDuration}s`
            clearInterval(si)
          }, 1)
        } else {
          var ts = status.t / timeValues.fps
          // this for loop breaks after checking the last condition fitting, don't need to put a condition to prevent it from keep running.
          for (var k = gpConstants.fadeOutTime.length - 1; k >= 0; k--) {
            if (ts >= gpConstants.fadeOutTime[k]) {
              element.style.opacity = 1 - gpConstants.fadeOutStrength[k]
              break
            }
          }
        }
      }
    }
  }

  // ignite the gamepad update loop.
  rAF(gamepadDOMs.update)

  if (haveEvents) {
    window.addEventListener('gamepadconnected', function (e) {
      gamepadHandler.connect(e.gamepad)
    })
    window.addEventListener('gamepaddisconnected', function (e) {
      gamepadHandler.disconnect(e.gamepad)
    })
  } else if (haveWebkitEvents) {
    window.addEventListener('webkitgamepadconnected', function (e) {
      gamepadHandler.connect(e.gamepad)
    })
    window.addEventListener('webkitgamepaddisconnected', function (e) {
      gamepadHandler.disconnect(e.gamepad)
    })
  } else {
    var scanningWithNoEvents = setInterval(gamepadHandler.scan, 500)
  }