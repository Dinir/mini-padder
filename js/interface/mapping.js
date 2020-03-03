const MappingInterface = new MappingStorageManager()

/*
  Direction of save/load
  
  [ Editor ]<-Load[  HTML  ]      [  Local  ]
  [        ]Save->[ Active ]      [ Storage ]
  [        ]      [Mappings]Save->[         ]
 */

MappingInterface.editorCallbacks = {
  save: function (text) {
    try {
      // check if it's a valid json
      const parsedText = JSON.parse(text)
      // should be valid. save it as the active mappings
      // then save it to the localstorage
      MappingInterface.mappings = parsedText
    } catch (e) {
      window.dispatchEvent(new CustomEvent('mappingManagerError', {
        detail: {name: e.name, message: e.message}
      }))
    }
  },
  load: function (textarea) {
    // stringify current active mappings
    const stringifiedMappings = JSON.stringify(MappingInterface.mappings)
    textarea.value = stringifiedMappings
    window.dispatchEvent(new CustomEvent('mappingManagerMessage', {
      detail: 'Loaded current mappings.'
    }))
  }
}
const obte = new OnBrowserTextEditor(MappingInterface.editorCallbacks)

// TODO: proper callbacks are made, now need to make it pop up and go away.
