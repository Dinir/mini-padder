class MiniPadderUpdater extends Updater {
  constructor (currentVersionString, alertCallback) {
    super(currentVersionString, '2.0.1')
    this.updateTasks = this.loadUpdateTasks()
    this.alert = alertCallback || (() => false)
    this.lastAlertMessage = ''
  
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
            `Update${this.lastAlertMessage}`
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
    const setLastAlertMessage = (message, version) => {
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
          } // 4.2.0
        } // 4.2
      } // 4
    } // end of update tasks
  }
}
