class MappingInterface extends MappingManager {
  constructor (newMappings) {
    super(newMappings)
  }
  
  /**
   * The purpose of this 'interface' for now
   * is just storing more mappings for initiating.
   */
  initiate () {
    this.mappings = {
      "XInput": {
        "name": "XInput Standard Controller",
        "properties": [],
        "sticks": {
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
            "select": 8, "start": 9, "l3": 10, "r3": 11,
            "home": 16
          },
          "shoulder": {
            "l1": 4, "r1": 5, "l2": 6, "r2": 7
          }
        }
      },
      "DInput": {
        "name": "DInput Standard Controller",
        "properties": [],
        "sticks": {
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
            "select": 8, "start": 9, "l3": 10, "r3": 11,
            "home": 16, "touchpad": 17
          },
          "shoulder": {
            "l1": 4, "r1": 5, "l2": 6, "r2": 7
          }
        }
      },
      "0f30": {
        "name": "Qanba Joystick",
        "properties": ["joystick"],
        "sticks": {
          "deadzone": 0.5,
          "left": {
            "x": 0, "y": 1, "button": 10
          },
          "right": null
        },
        "buttons": {
          "dpad": {
            "axis": 9
          },
          "face": {
            "down": 0, "right": 1, "left": 2, "up": 3,
            "select": 8, "start": 9, "l3": 10, "r3": 11, "home": 12, "touchpad": 13
          },
          "shoulder": {
            "r1": 4, "l1": 5, "r2": 6, "l2": 7
          }
        }
      },
      "0f0d": {
        "name": "Hori Joystick",
        "properties": ["joystick"],
        "sticks": {
          "deadzone": 0.5,
          "left": {
            "x": 0, "y": 1, "button": 10
          },
          "right": {
            "x": 2, "y": 3, "button": 11
          }
        },
        "buttons": {
          "dpad": {
            "axis": 9
          },
          "face": {
            "down": 0, "right": 1, "left": 2, "up": 3,
            "select": 8, "start": 9, "l3": 10, "r3": 11
          },
          "shoulder": {
            "r1": 4, "l1": 5, "r2": 6, "l2": 7
          }
        }
      },
      "0738": {
        "name": "Mad Catz Joystick",
        "properties": ["joystick"],
        "sticks": {
          "deadzone": 0.5,
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
            "left": 0, "down": 1, "right": 2, "up": 3,
            "select": 8, "start": 9, "l3": 10, "r3": 11, "home": 12, "touchpad": 13
          },
          "shoulder": {
            "l1": 4, "r1": 5, "l2": 6, "r2": 7
          }
        }
      },
      "2dc8": {
        "name": "8BitDo Gamepad (DInput)",
        "properties": ["axisdpad"],
        "sticks": {
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
            "axis": 9
          },
          "face": {
            "right": 0, "down": 1, "up": 3, "left": 4,
            "select": 10, "start": 11, "l3": 13, "r3": 14,
            "home": 2
          },
          "shoulder": {
            "l1": 6, "r1": 7, "l2": 8, "r2": 9
          }
        }
      }
    }
    this.store()
  }
}
