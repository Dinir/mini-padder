class MappingInterface extends MappingStorageManager {
  constructor (newMappings) {
    super(newMappings)
  }
  
  saveFromEditor (text) {
    try {
      // check if it's a valid json
      const parsedText = JSON.parse(text)
      // should be valid. save it as the active mappings
      // then save it to the localstorage
      this.mappings = parsedText
      this.store()
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
      title: 'Gamepad Mappings',
      save: this.saveFromEditor.bind(this),
      load: this.loadToEditor.bind(this)
    }
  }
  
  /**
   * force store default mappings to localStorage,
   * then load that to the instance.
   */
  initiate () {
    this.mappings = {
      "XInput": {
        "name": "XInput Generic Controller",
        "properties": [],
        "axes": {
          "deadzone": 0.08,
          "left": {
            "x": 0, "y": 1, "button": 10
          },
          "right": {
            "x": 2, "y": 3, "button": 11
          }
        },
        "buttons": {
          "dpad": {
            "up": 12, "down": 13, "left": 14, "right": 15
          },
          "face": {
            "down": 0, "right": 1, "left": 2, "up": 3,
            "select": 8, "start": 9
          },
          "shoulder": {
            "l1": 4, "r1": 5, "l2": 6, "r2": 7
          }
        }
      },
      "054c05c4": {
        "name": "DualShock4 (ZCT1x)",
        "properties": [],
        "axes": {
          "deadzone": 0.08,
          "left": {
            "x": 0, "y": 1, "button": 10
          },
          "right": {
            "x": 2, "y": 3, "button": 11
          }
        },
        "buttons": {
          "dpad": {
            "up": 12, "down": 13, "left": 14, "right": 15
          },
          "face": {
            "down": 0, "right": 1, "left": 2, "up": 3,
            "select": 8, "start": 9,
            "PS": 16, "Touchpad": 17
          },
          "shoulder": {
            "l1": 4, "r1": 5, "l2": 6, "r2": 7
          }
        }
      },
      "054c09cc": {
        "name": "DualShock4 (ZCT2x)",
        "properties": [],
        "axes": {
          "deadzone": 0.08,
          "left": {
            "x": 0, "y": 1, "button": 10
          },
          "right": {
            "x": 2, "y": 3, "button": 11
          }
        },
        "buttons": {
          "dpad": {
            "up": 12, "down": 13, "left": 14, "right": 15
          },
          "face": {
            "down": 0, "right": 1, "left": 2, "up": 3,
            "select": 8, "start": 9,
            "home": 16, "Touchpad": 17
          },
          "shoulder": {
            "l1": 4, "r1": 5, "l2": 6, "r2": 7
          }
        }
      },
      "2dc86101": {
        "name": "8BitDo SN30 Pro (DInput)",
        "properties": ["axisdpad"],
        "axes": {
          "deadzone": 0.02,
          "left": {
            "x": 0, "y": 1, "button": 13
          },
          "right": {
            "x": 2, "y": 5, "button": 14
          }
        },
        "buttons": {
          "dpad": {
            "axis": 9,
            "precision": 0.1,
            "up": -1, "upright": -0.8, "right": -0.5, "downright": -0.2,
            "down": 0.1, "downleft": 0.4, "left": 0.7, "upleft": 1
          },
          "face": {
            "right": 0, "down": 1, "up": 3, "left": 4,
            "select": 10, "start": 11,
            "home": 2
          },
          "shoulder": {
            "l1": 6, "r1": 7, "l2": 8, "r2": 9
          }
        }
      },
      "0f301012": {
        "name": "Q4RAF (DInput - PS3.PC)",
        "properties": ["axisdpad", "dpadleftstick"],
        "axes": {
          "deadzone": 0,
          "left": {
            "x": 0, "y": 1, "button": null
          },
          "right": null
        },
        "buttons": {
          "dpad": {
            "axis": 9,
            "precision": 0.1,
            "up": -1, "upright": -0.8, "right": -0.5, "downright": -0.2,
            "down": 0.1, "downleft": 0.4, "left": 0.7, "upleft": 1
          },
          "face": {
            "down": 0, "right": 1, "left": 2, "up": 3,
            "select": 8, "start": 9
          },
          "shoulder": {
            "r1": 4, "l1": 5, "r2": 6, "l2": 7
          }
        }
      }
    }
    this.store()
  }
}

// TODO: proper callbacks are made, now need to make it pop up and go away.
/*
web page has 'show current mappings'
the editor can have 'save current mappings', 'undo all changes & reload from storage'.
 */
