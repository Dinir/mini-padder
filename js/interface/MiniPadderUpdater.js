class MiniPadderUpdater extends Updater {
  constructor (currentVersionString) {
    super(currentVersionString, '2.0.1')
    this.updateTasks = this.loadUpdateTasks()
  
    MiniPadderUpdater.announceMessage('Checking for updated changes...')
    if (currentVersionString === Updater.getVersionString(this.lastFoundVersion)) {
      MiniPadderUpdater.announceMessage('This is the latest version.')
    } else {
      const updateResult = this.minorUpdate()
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
        }
      }
    }
  }
}