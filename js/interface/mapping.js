const MappingInterface = new MappingStorageManager()

/*
  Direction of save/load
  
  [ Editor ]<-Load[  HTML  ]      [  Local  ]
  [        ]Save->[ Active ]      [ Storage ]
  [        ]      [Mappings]Save->[         ]
 */

MappingInterface.editorCallbacks = {
  save: function (text, notify) {
    let parsedText = ''
    try {
      // check if it's a valid json
      const parsedText = JSON.parse(text)
      // should be valid. save it as the active mappings
      // then save it to the localstorage
      MappingInterface.mappings = parsedText
      const message = MappingInterface.store()
      // tell the editor the storing is done
      notify({
        text: message,
        isError: false
      })
    } catch (e) {
      const message =
          `${e.name}: ${e.message}`
      notify({
        text: message,
        isError: true
      })
    }
  },
  load: function (textarea, notify) {
    // stringify current active mappings
    const stringifiedMappings = JSON.stringify(MappingInterface.mappings)
    textarea.value = stringifiedMappings
    notify({
      text: 'Loaded current mappings.',
      isError: false
    })
  }
}
const obte = new OnBrowserTextEditor(MappingInterface.editorCallbacks)

// TODO: proper callbacks are made, now need to make it pop up and go away.
