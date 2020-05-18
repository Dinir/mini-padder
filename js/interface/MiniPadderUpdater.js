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
  
  static announceMessage (message) {
    window.dispatchEvent(new CustomEvent('GPVMessage', {
      detail: {
        from: 'Updater',
        type: message instanceof Error ? 'error' : 'log',
        message: message
      }
    }))
  }
  
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
        }
      }
    }
  }
}
