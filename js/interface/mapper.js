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
      window.dispatchEvent(new CustomEvent('mappingManagerError', {
        detail: {name: e.name, message: e.message}
      }))
    }
  }
  loadToEditor (textarea) {
    // stringify current active mappings
    const stringifiedMappings = JSON.stringify(this.mappings)
    textarea.value = stringifiedMappings
    window.dispatchEvent(new CustomEvent('mappingManagerMessage', {
      detail: 'Loaded current mappings.'
    }))
  }
  
  
  get editorCallbacks () {
    return {
      save: this.saveFromEditor,
      load: this.loadToEditor
    }
  }
}

// TODO: proper callbacks are made, now need to make it pop up and go away.
