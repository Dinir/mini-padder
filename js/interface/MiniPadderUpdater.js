class MiniPadderUpdater extends Updater {
  constructor (currentVersionString) {
    super(currentVersionString, '2.0.1')
    this.updateTasks = this.loadUpdateTasks()
  
    MiniPadderUpdater.announceMessage('Checking for updated changes...')
    if (currentVersionString === Updater.getVersionString(this.lastFoundVersion)) {
      MiniPadderUpdater.announceMessage('This is the latest version.')
    } else {
      const updateResult = this.majorUpdate()
      if (updateResult) {
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
    // only add applications of changes that couldn't be done by updating files
    return {
      '2': {
        '1': {
          '0': function () {
            if (
              typeof Mapper === 'undefined'
            ) {
              return false
            }
            const version = '2.1.0'
            MiniPadderUpdater.announceMessage(
              version + ': Copying stick button mappings to button mappings.'
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
            if (
              typeof Renderer === 'undefined'
            ) {
              return false
            }
            const version = '2.2.0'
            MiniPadderUpdater.announceMessage(
              version + ': Adding a new skin for 6-button gamepads.'
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
            if (
              typeof Renderer === 'undefined'
            ) {
              return false
            }
            const version = '3.2.0'
            MiniPadderUpdater.announceMessage(
              version + ': Adding a new skin for HBox gamepads.'
            )
  
            Renderer.addSkinToSkinList('HBox')
  
            return true
          },
          '1': function () {
            if (
              typeof Mapper === 'undefined'
            ) {
              return false
            }
            const version = '3.2.1'
            MiniPadderUpdater.announceMessage(
              version + ': Changing deadzone values for XInput and DInput to 0.1.'
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
            if (
              typeof Renderer === 'undefined'
            ) {
              return false
            }
            const version = '3.4.0'
            MiniPadderUpdater.announceMessage(
              version + ': Adding variations for 6-button gamepads.'
            )
            
            Renderer.addSkinsToSkinList(new Map([
              ['megapad-x', 'Mega Pad X Button'],
              ['megapad-d', 'Mega Pad D Button']
            ]))
            
            return true
          }
        } // 3.4
      } // 3
    } // end of update tasks
  }
}
