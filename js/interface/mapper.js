class MappingInterface extends MappingStorageManager {
  constructor (newMappings) {
    super(newMappings)
  }
  
  /*
  Direction of save/load
  
  [ Editor ]<-Load[  HTML  ]      [  Local  ]
  [        ]Save->[ Active ]      [ Storage ]
  [        ]      [Mappings]Save->[         ]
 */
  
  saveFromEditor (text) {
    try {
      // check if it's a valid json
      const parsedText = JSON.parse(text)
      // should be valid. save it as the active mappings
      // then save it to the localstorage
      this.mappings = parsedText
    } catch (e) {
      MappingInterface.announceMessage({name: e.name, message: e.message}, 'error')
    }
  }
  loadToEditor (textarea) {
    // stringify current active mappings
    const stringifiedMappings = JSON.stringify(this.mappings, null, 2)
    textarea.value = stringifiedMappings
    MappingInterface.announceMessage('Loaded current mappings.')
  }
  
  
  get editorCallbacks () {
    return {
      save: this.saveFromEditor,
      load: this.loadToEditor
    }
  }
}

// TODO: proper callbacks are made, now need to make it pop up and go away.
