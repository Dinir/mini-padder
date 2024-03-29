class MiniPadderUpdater extends Updater {
  constructor (currentVersionString, alertCallback) {
    super(currentVersionString, '2.0.1')
    this.updateTasks = this.loadUpdateTasks()
    this.alert = alertCallback || (() => false)
    this.lastAlertMessage = ''
    this.lastAlertType = 'info'
  
    MiniPadderUpdater.announceMessage('Checking for updated changes...')
    const lastFoundVersionString =
      Updater.getVersionString(this.lastFoundVersion)
    if (currentVersionString === lastFoundVersionString) {
      MiniPadderUpdater.announceMessage('This is the latest version.')
    } else {
      const updateResult = this.majorUpdate()
      if (updateResult) {
        if (this.lastAlertMessage) {
          // `Update: message` or `Update x.x.x: message`
          this.alert(
            `Update${this.lastAlertMessage}`,
            this.lastAlertType
          )
        }
        MiniPadderUpdater.announceMessage('Finished updating.')
      } else {
        MiniPadderUpdater.announceMessage(
          new Error('There was a problem updating the application.')
        )
      }
    }
  }
  
  static announceMessage = MPCommon.announceMessageFrom('Updater')
  
  loadUpdateTasks () {
    const setLastAlertMessage = (message, version, type = 'info') => {
      this.lastAlertType = type
      if (!message) {
        this.lastAlertMessage = null
      } else {
        // `x.x.x: message` or `: message`
        this.lastAlertMessage = (version ? ` ${version}` : '') + `: ${message}`
      }
    }
    // only add applications of changes that couldn't be done by updating files
    return {
      '2': {
        '1': {
          '0': function () {
            if (typeof Mapper === 'undefined') {
              return false
            }
            MiniPadderUpdater.announceUpdate(
              'Copying stick button mappings to button mappings.', '2.1.0'
            )
            
            if (Mapper.mappings.hasOwnProperty('XInput')) {
              Mapper.mappings.XInput.buttons.face.l3 = Mapper.mappings.XInput.sticks.left.button
              Mapper.mappings.XInput.buttons.face.r3 = Mapper.mappings.XInput.sticks.right.button
            }
            if (Mapper.mappings.hasOwnProperty('DInput')) {
              Mapper.mappings.DInput.buttons.face.l3 = Mapper.mappings.DInput.sticks.left.button
              Mapper.mappings.DInput.buttons.face.r3 = Mapper.mappings.DInput.sticks.right.button
            }
            Mapper.store()
            
            return true
          }
        },
        '2': {
          '0': function () {
            if (typeof Renderer === 'undefined') {
              return false
            }
            MiniPadderUpdater.announceUpdate(
              'Adding a new skin for 6-button gamepads.', '2.2.0'
            )
            
            Renderer.addSkinToSkinList('MegaPad')
            
            return true
          }
        }
      },
      '3': {
        '0': {
          '0': function () {
            return true
          }
        },
        '2': {
          '0': function () {
            if (typeof Renderer === 'undefined') {
              return false
            }
            MiniPadderUpdater.announceUpdate(
              'Adding a new skin for HBox gamepads.', '3.2.0'
            )
  
            Renderer.addSkinToSkinList('HBox')
  
            return true
          },
          '1': function () {
            if (typeof Mapper === 'undefined') {
              return false
            }
            MiniPadderUpdater.announceUpdate(
              'Changing deadzone values for XInput and DInput to 0.1.', '3.2.1'
            )
  
            if (Mapper.mappings.hasOwnProperty('XInput')) {
              Mapper.mappings.XInput.sticks.deadzone = 0.1
            }
            if (Mapper.mappings.hasOwnProperty('DInput')) {
              Mapper.mappings.DInput.sticks.deadzone = 0.1
            }
            Mapper.store()
  
            return true
          }
        },
        '4': {
          '0': function () {
            if (typeof Renderer === 'undefined') {
              return false
            }
            MiniPadderUpdater.announceUpdate(
              'Adding variations for 6-button gamepads.', '3.4.0'
            )
            
            Renderer.addSkinsToSkinList(new Map([
              ['megapad-x', 'Mega Pad X Button'],
              ['megapad-d', 'Mega Pad D Button']
            ]))
            
            return true
          }
        },
        '11': {
          '4': function () {
            if (typeof Mapper === 'undefined') {
              return false
            }
            MiniPadderUpdater.announceUpdate(
              'Adding a new mapping for DualSense.', '3.11.4'
            )
            Mapper.addOrUpdate('054c0ce6', {
              "name": "DualSense",
              "properties": ["axisdpad"],
              "sticks": {
                "deadzone": 0.1,
                "left": {
                  "x": 0, "y": 1, "button": 10
                },
                "right": {
                  "x": 2, "y": 5, "button": 11
                }
              },
              "buttons": {
                "dpad": {
                  "axis": 9
                },
                "face": {
                  "down": 1, "right": 2, "left": 0, "up": 3,
                  "select": 8, "start": 9, "l3": 10, "r3": 11,
                  "home": 12, "touchpad": 13
                },
                "shoulder": {
                  "l1": 4, "r1": 5, "l2": 6, "r2": 7
                }
              }
            })
            Mapper.store()
  
            return true
          }
        }
      },
      '4': {
        '0': {
          '0': () => {
            if (typeof Mapper === 'undefined') {
              return false
            }
            MiniPadderUpdater.announceUpdate(
              'Changing mapping structure for deadzone.', '4.0.0'
            )
            for (const m in Mapper.mappings) {
              const mapping = Mapper.mappings[m]
              if (!mapping.sticks) { continue }
              if (mapping.sticks.left) {
                mapping.sticks.left.deadzone =
                  mapping.sticks.left.deadzone || mapping.sticks.deadzone
              }
              if (mapping.sticks.right) {
                mapping.sticks.right.deadzone =
                  mapping.sticks.right.deadzone || mapping.sticks.deadzone
              }
              delete mapping.sticks.deadzone
            }
            Mapper.store()
  
            setLastAlertMessage(
              'Now deadzone is applied separately for each sticks.',
              '4.0.0'
            )
  
            return true
          },
          '1': function () {
            setLastAlertMessage()
            return true
          }
        },
        '1': {
          '0': () => {
            return true
          },
          '1': () => {
            return true
          }
        },
        '2': {
          '0': () => {
            setLastAlertMessage(
              'Deadzone can be separately changed for each sticks.',
              '4.2.0'
            )
            return true
          },
          '1': () => {
            return true
          }
        }
      },
      '5': {
        '0': {
          '0': () => {
            setLastAlertMessage(
              '<b>MegaPad changed its layout</b> to accept default XInput mappings ' +
              'from Retro-Bit and 8BitDo gamepads. ' +
              'Check out the <a href="https://github.com/Dinir/mini-padder/releases/tag/5.0.0" target="_blank">repository\'s release page</a> to read more.',
              '5.0.0',
              'caution'
            )
            return true
          },
          '1': () => {
            MiniPadderUpdater.announceUpdate(
              'Removing the discontinued Mega Pad variations from the skin list.', '5.0.1'
            )
            
            Renderer.removeSkinFromSkinList('megapad')
            Renderer.removeSkinFromSkinList('megapad-x')
            Renderer.removeSkinFromSkinList('megapad-d')
            
            return true
          }
        },
        '1': {
          '0': () => {
            setLastAlertMessage(
              'Custom skin now supports `.json` and `.txt`.',
              '5.1.0'
            )
            return true
          },
          '1': () => {
            setLastAlertMessage()
            return true
          }
        },
        '2': {
          '0': () => {
            setLastAlertMessage()
            return true
          }
        },
        '3': {
          '0': () => {
            setLastAlertMessage(
              'New skins for F Commander, and dark control panel.',
              '5.3.0'
            )
            return true
          },
          '1': () => {
            if (typeof Mapper === 'undefined') {
              return false
            }
            
            MiniPadderUpdater.announceUpdate(
              'Adding a fallback mapping for \'Unknown Gamepad\'.',
              '5.3.1'
            )
            setLastAlertMessage(
              'Changed the assignment order to avoid axis assignments from ' +
              'being adjacent. Now the order is ' +
              'face - dpad - <i>shoulders</i> - <i>options</i> - sticks. ' +
              'Added a fallback mapping for \'Unknown Gamepad\'.',
              '5.3.1'
            )
            
            if (!Mapper.mappings.hasOwnProperty('00000000')) {
              if (
                Mapper.addOrUpdate('00000000', {
                  "name": "Unknown Gamepad",
                  "properties": [
                    "axisdpad"
                  ],
                  "sticks": {
                    "left": {
                      "x": 0, "y": 1, "button": 10,
                      "deadzone": 0.1
                    },
                    "right": {
                      "x": 2, "y": 5, "button": 11,
                      "deadzone": 0.1
                    }
                  },
                  "buttons": {
                    "dpad": {
                      "axis": 9
                    },
                    "face": {
                      "down": 1, "right": 2, "up": 3, "left": 0,
                      "select": 8, "start": 9, "home": 12, "touchpad": 13,
                      "l3": 10, "r3": 11
                    },
                    "shoulder": {
                      "l1": 4, "r1": 5, "l2": 6, "r2": 7
                    }
                  }
                })
              ) {
                return Mapper.store()
              }
              
              return false
            } else {
              MiniPadderUpdater.announceMessage(
                'Found an existing mapping for the gamepad. Skipping.'
              )
              
              return true
            }
          }
        },
        '4': {
          '0': () => {
            setLastAlertMessage(
              'Shoulder button background in default gamepad skins are ' +
              'now darker. Half of coloured gamepad skins ' +
              'now use yellow dpad active sprites.',
              '5.4.0'
            )
            return true
          },
          '1': () => {
            setLastAlertMessage(
              'Skins for gamepads focused on the dpad are divided into ' +
              'two variations: ones accepting dpad with ' +
              'individual buttons fading, and the other ones accepting ' +
              'left stick and dpad with the whole pad fading.',
              '5.4.1'
            )
            return true
          },
          '2': () => {
            setLastAlertMessage(
              'Dpad of Super Pad skins has background fill now. <br>' +
              'The maintenance of Mini Padder is ceased: ' +
              'if nothing changes, the domain will expire at 4 June 2023. ' +
              'You can still use it with the address `' +
              '<b>https://dinir.github.io/mini-padder</b>`. ' +
              'Thank you for using Mini Padder.',
              '5.4.2'
            )
            return true
          },
          '3': () => true
        } // 5.4
      } // 5
    } // end of update tasks
  }
}
