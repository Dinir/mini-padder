/**
 * @typedef {Object} SkinSlot
 * @memberOf GamepadRenderer#
 * @description data required to draw gamepad changes to canvases in the corresponding gamepad slot
 *
 * @property {gamepadId} gamepadId
 * gamepadId of the gamepad included in processedGamepadChange
 * when the slot is made. It is used for the GamepadRenderer to tell
 * if the gamepad which issued the change has changed, that it needs to
 * recreate a skin slot for the new gamepad.
 *
 * @property {{left: boolean, right: boolean}} stickButtonState
 * last stick button state, stored for rendering.
 *
 * Why is it in a renderer class?
 * MappingManager will always only transfer 'changes',
 * which works for usages that don't need to bind anything together:
 * a logic dealing each of the inputs separately can only work whenever
 * a change occurred therefore it's transferred from MappingManager,
 * and it won't be out of sync to a present state of the gamepad.
 *
 * But here the renderer will try to draw button press states
 * 'on' the position of each sticks, which should be updated every time
 * a corresponding stick moves, regardless of changes on the buttons.
 *
 * So it should bind the position and the button state of a stick.
 *
 * Stick position is always included in processedGamepadChange
 * to avoid stick state considered 'inactive' when it's pushed
 * all the way along a single axis.
 * And with that, the renderer only need to remember the other one,
 * the button state of the stick.
 *
 * @property {HTMLImageElement[]} src
 * reference to an image element containing a spritesheet,
 * ordered by config.json.
 *
 * @property {HTMLCanvasElement[]} layer
 * canvas element for each layers, ordered by config.json.
 *
 * @property {CanvasRenderingContext2D[]} ctx
 * canvas context for each layers, ordered by config.json.
 *
 * @property {Object} instruction
 * specific data to draw each sprites,
 * mapped in a form of processedGamepadChange.
 * It's a reference to `config.sticks` and `config.buttons`.
 */
/**
 *
 * @class
 * @listens MappingManager#processedGamepadChange
 */
class GamepadRenderer {
  /**
   *
   * @param {HTMLDivElement[]} canvasArray contains divs for each set of canvas
   */
  constructor (canvasArray) {
    // true when it's not ready to render
    this.renderPending = true
    
    // count these with `tickFpsCounter` everytime rAF is called
    this.counterFor30fps = false
    this.counterFor20fps = 2
    this.counterFor15fps = 3
  
    // class-wise definition of maximum canvas size
    this.maxCanvasSize = [256, 144]
    
    this.fadeoutFps = 60
    this.fadeoutOpacityPrecision = 4
    
    this.messageDisplayTimeInSeconds = 2
    
    this.loadOrders()
    this.loadInstructions()
  
    this.canvas = canvasArray
    // I give it default values I used when it was 'XBoxPadViewer'.
    /**
     * @typedef {Object} fadeoutOption
     * @description
     * Configuration values for fade-out effect.
     * @property {Number[]} time Milliseconds for each fade-out level.
     * It's in milliseconds to compare with DOMHighResTimestamp values.
     * @property {Number[]} opacity Transparency values for each level.
     * @property {Number} duration Transition time of fade-out effect in milliseconds.
     * It's in milliseconds to compare with DOMHighResTimestamp values.
     * @property {Number[]} deltaOpacity Amount of alpha value to apply
     * for each frame, to eventually get to the intended opacity of next level.
     * It should be calculated when setting new values.
     */
    this.fadeout = {
      time: [8,16,32],
      opacity: [0.5,0.1,0],
      duration: 4
    }
  
    this.loadFadeoutOption()
    /**
     * Contains skin data obtained from each `config.json` in their directories. Key value is their directory names.
     * @type {Object.<string, Object>}
     * @property {boolean} loaded `true` when loading is complete
     * @property {string} path
     * path to the skin directory, relative to the root of the page
     * @property {HTMLImageElement[]} src
     * contains image required for the skin
     * @property {Object} config
     * data from `config.json` in the skin directory
     */
    this.skins = {}
    /**
     * Directory names of all skins currently loaded.
     * @type {string[]}
     */
    this.skinList = []
    this.defaultSkins = ['XInput', 'DInput', 'Joystick']
    /**
     * Store relations of gamepadId and a skin directory name, as key-value pair.
     * @type {Object.<string, string>}
     */
    this.skinMapping = {}
    this.loadSkinMapping()
    // load default skins
    for (let i = 0; i < this.defaultSkins.length; i++) {
      this.loadSkin(this.defaultSkins[i])
    }
    // after finishing loading all, `renderPending` will be `false`.
    this.loadAllMappedSkins()
    this.loadAllKnownSkins = this.loadAllKnownSkins.bind(this)
    this.changeSkinOfSlot = this.changeSkinOfSlot.bind(this)
  
    /**
     * Save references of skins for each gamepad slot. Index is that of the gamepad.
     * @type {SkinSlot[]}
     */
    this.skinSlot = []
  
    this.requestRender = this.requestRender.bind(this)
    this.renderAll = this.renderAll.bind(this)
    this.requestRender()
    
    window.addEventListener('processedGamepadChange', e => {
      this._processedGamepadChange = e.detail
    })
    
    this.setSkinMappingInBulk = this.setSkinMappingInBulk.bind(this)
    this.setFadeoutOptionFromTextArray = this.setFadeoutOptionFromTextArray.bind(this)
  }
  
  static announceMessage (message, type) {
    const messageType = {
      log: 'log',
      error: 'error'
    }
    window.dispatchEvent(new CustomEvent('GPVMessage', {
      detail: {
        from: 'Gamepad Renderer',
        type: message instanceof Error ?
          messageType.error : ( messageType[type] || messageType.log ),
        message: message
      }
    }))
  }
  
  /**
   * Return an array of unique values with no duplicates.
   * If an object is given, values of the objects will be used.
   * Can't be used for arrays of non primitive values.
   *
   * @param {array|Object} list
   * @returns {array}
   */
  static getUniqueValues (list) {
    const type = list.constructor
    const array = type === Object ?
      Object.values(list) : list
    const itemSeen = {}
    return array.filter(item => {
      return itemSeen.hasOwnProperty(item) ?
        false : (itemSeen[item] = true)
    })
  }
  static isDirnameOkay (dirname) {
    const isOkay = !/[^0-9a-zA-Z_\-]/.test(dirname)
    if (!isOkay) {
      GamepadRenderer.announceMessage(new Error(
        'Directory name for the skin is invalid. ' +
        'Allowed characters are alphanumericals, hyphen and underscore.'
      ))
    }
    return isOkay
  }
  static findDefaultSkin (gamepadId, mappingProperties) {
    const defaultSkin = ['DInput', 'XInput', 'Joystick']
    if (mappingProperties.indexOf('joystick') !== -1) { return defaultSkin[2] }
    // when it's a standard XInput gamepad, the gamepadId is just 'xinput'.
    if (/XInput/i.test(gamepadId)) { return defaultSkin[1] }
    return defaultSkin[0]
  }
  static newCanvasLayer (width, height, x, y) {
    const layer = document.createElement('canvas')
    layer.setAttribute('width', width)
    layer.setAttribute('height', height)
    layer.style.top = y + 'px'
    layer.style.left = x + 'px'
    
    return layer
  }
  static updateLeftStickActiveStatesOnDpadInput (skinSlot, timestamp) {
    skinSlot.activeState.sticks.left[0] = true
    skinSlot.lastActive.sticks.left = timestamp
    skinSlot.alpha.sticks.left = 1
  }
  
  tickFpsCounter () {
    this.counterFor30fps = !this.counterFor30fps
    this.counterFor20fps = (this.counterFor20fps + 1) % 3
    this.counterFor15fps = (this.counterFor15fps + 1) % 4
  }
  timingForFps (fps) {
    switch (fps) {
      case 60: return true
      case 30: return this.counterFor30fps
      case 20: return this.counterFor20fps === 0
      case 15:
      default: return this.counterFor15fps === 0
    }
  }
  
  /**
   * Set option values for fade-out effect from
   * an object of properties with the matching type,
   * and create some values based on them,
   * then call `saveFadeoutOption` to save the values to the local storage.
   *
   * If `optionObj` is not given, it will try to save the default values
   * declared in the constructor instead.
   *
   * All the other variations of this method should eventually call this method.
   *
   * @param {?Object} optionObj
   * @param {number[]} optionObj.time Seconds for each fade-out level.
   * @param {number[]} optionObj.opacity Opacity values for each level.
   * 1 is maximum opacity, 0 is maximum transparency.
   * @param {number} optionObj.duration Transition time of fade-out effect.
   */
  setFadeoutOption (optionObj) {
    if (optionObj) {
      this.fadeout.time = optionObj.time.map(v => 1000*v) || [0]
      this.fadeout.opacity = optionObj.opacity || [1]
      this.fadeout.duration = 1000*Number(optionObj.duration) || 0
    }
    const opacityOrder = this.fadeout.opacity
    const duration = this.fadeout.duration/1000
    /*
    if duration is longer than 2 seconds on 60fps,
    the deltaOpacity becomes too small that result of one full animation
    doesn't reach the target opacity.
    I'll try to reduce the fadeout speed to compensate.
     */
    const fadeoutFps = this.fadeoutFps
    const deltaOpacity = []
    for (let i = 0; i < opacityOrder.length; i++) {
      if (opacityOrder[i] >= 1) {
        deltaOpacity.push(1)
        continue
      } else if (duration === 0) {
        // 0.1 deltaOpacity puts the picture on 9/255 alpha over 35 frames.
        // that's instant enough for human eyes.
        deltaOpacity.push(0.1)
        continue
      }
      
      const pastValue = opacityOrder[i-1] || 1
      const diffRate = opacityOrder[i] <= 0 ?
        10 ** ( -1 * ( this.fadeoutOpacityPrecision ) ) :
        opacityOrder[i] / pastValue
      const frames = fadeoutFps * duration
      const delta = diffRate**( 1/frames )
      deltaOpacity.push(delta)
    }
    this.fadeout.deltaOpacity = deltaOpacity
    this.fadeout.totalTime =
      this.fadeout.time[this.fadeout.time.length - 1] +
      this.fadeout.duration
    
    this.saveFadeoutOption()
  }
  /**
   * Convert fade-out options given in input elements
   * into a number array / number and save the converted value to the instance.
   *
   * @param {Object.<string, string>} optionObj
   * @param {string} optionObj.time Seconds for each fade-out level.
   * A string made of numbers and separating commas.
   * @param {string} optionObj.opacity Transparency values for each level.
   * A string made of numbers and separating commas.
   * @param {string} optionObj.duration Transition time of fade-out effect.
   * One number value in string type.
   */
  setFadeoutOptionFromStringObject (optionObj) {
    const convertIntoArray =
      v => v.split(',')
        .map(v => Number(v))
        .filter(v => !isNaN(v))
    
    this.setFadeoutOption({
      time: convertIntoArray(optionObj.time || '0'),
      opacity: convertIntoArray(optionObj.opacity || '1'),
      duration: Number(optionObj.duration) || 0
    })
  }
  setFadeoutOptionFromTextArray (optionArray) {
    if (!optionArray) {
      // set as the default values declared in the constructor instead
      this.setFadeoutOption()
      return false
    }
    const optionObj = {
      time: optionArray[0],
      opacity: optionArray[1],
      duration: optionArray[2]
    }
    this.setFadeoutOptionFromStringObject(optionObj)
  }
  getFadeoutOptionAsTextArray () {
    return [
      this.fadeout.time.map(v => v/1000).join(','),
      this.fadeout.opacity.join(','),
      (this.fadeout.duration/1000).toString()
    ]
  }
  saveFadeoutOption () {
    const optionJSON = JSON.stringify(this.fadeout)
    window.localStorage.setItem('fadeOption', optionJSON)
  }
  loadFadeoutOption () {
    const fadeOutOption = JSON.parse(window.localStorage.getItem('fadeOption'))
    this.setFadeoutOption(fadeOutOption || this.fadeout || {})
  }
  
  getFadeoutState (timeInactive) {
    let fadingOut = false
    let inactivityLevel = -1
    let deltaOpacity = 1
    const fadeoutOpt = this.fadeout
    
    const timePastTotalTime =
      timeInactive - fadeoutOpt.totalTime
    if (timePastTotalTime > 0) {
      // all fade-out is done
      if (
        timePastTotalTime <= 100 &&
        fadeoutOpt.opacity[fadeoutOpt.opacity.length - 1] === 0
      ) {
        // just one last tick to completely hide the picture
        fadingOut = true
        deltaOpacity = 0
      }
      return [fadingOut, deltaOpacity]
    }
    
    // findout which level the inactivity is in
    /*
     * time |      |-->|      |-->|      |-->|                  duration
     *      | ---- 0 -------- 1 -------- 2 ------------------- threshold
     *      | loop at l===0                                        level
     *      |   V  :                    didn't reach level 0        -1
     *      |      | V :                passed level 0, fading-out   0
     *      |          | V    :         finished level 0 fade-out    0
     *      | loop at l===1
     *      |          |    V :         didn't reach level 1         0
     *      |                 | V :     passed level 1, fading-out   1
     *      |                     |  V  finished level 1 fade-out    1
     *
     *  V - time at the loop, | - inclusive border, : - exclusive border
     */
    for (let l = 0; l < fadeoutOpt.time.length; l++) {
      const timePastThreshold = timeInactive - fadeoutOpt.time[l]
      if (timePastThreshold < 0) {
        // didn't reach level l
        inactivityLevel = l - 1
        break
      } else if (timePastThreshold < fadeoutOpt.duration) {
        // passed level l, fading-out
        inactivityLevel = l
        fadingOut = true
        break
      }
      // finished level l fade-out
    }
    deltaOpacity = fadeoutOpt.deltaOpacity[inactivityLevel] || 1
    
    return [fadingOut, deltaOpacity]
  }
  getMultipliedAlpha (alpha, deltaOpacity) {
    if (alpha === 0) return alpha
    return Math.floor(
      alpha * deltaOpacity * 10 ** this.fadeoutOpacityPrecision
    ) / 10 ** this.fadeoutOpacityPrecision
  }
  
  setSkinMapping (gamepadId, skinDirname) {
    if (!GamepadRenderer.isDirnameOkay(skinDirname)) { return false }
    this.skinMapping[gamepadId] = skinDirname
    this.saveSkinMapping()
    return true
  }
  setSkinMappingInBulk (idDirnamePairs) {
    if (
      typeof idDirnamePairs !== 'object' ||
      Object.keys(idDirnamePairs).length === 0
    ) {
      return false
    }
    
    this.resetSkinMapping()
    for (const gamepadId in idDirnamePairs) {
      this.setSkinMapping(gamepadId, idDirnamePairs[gamepadId])
    }
    this.saveSkinMapping()
    
    return true
  }
  saveSkinMapping () {
    const mappingJSON = JSON.stringify(this.skinMapping)
    window.localStorage.setItem('rendererSkinMapping', mappingJSON)
  }
  resetSkinMapping () {
    for (const gamepadId in this.skinMapping) {
      if (!this.skinMapping.hasOwnProperty(gamepadId)) { continue }
      delete this.skinMapping[gamepadId]
    }
  }
  loadSkinMapping () {
    const rendererSkinMapping = JSON.parse(window.localStorage.getItem('rendererSkinMapping'))
    this.skinMapping = rendererSkinMapping || this.skinMapping || {}
  }
  loadAllMappedSkins () {
    const dirnameSeen = {}
    const allSkinDirnames = GamepadRenderer.getUniqueValues(this.skinMapping)
    for (let d = 0; d < allSkinDirnames.length; d++) {
      this.loadSkin(allSkinDirnames[d])
    }
    this.renderPending = false
  }
  
  /**
   * Try to load all skins from an array of skin directory names.
   * @param {string[]} newSkinList
   */
  loadAllKnownSkins (newSkinList) {
    // delete every skin that exists on skinlist but not on the given list
    const skinList = this.skinList
    for (let i = 0; i < skinList.length; i++) {
      if (this.defaultSkins.indexOf(skinList[i]) !== -1) {
        // don't unload default skins
        continue
      }
      if (newSkinList.indexOf(skinList[i]) === -1) {
        this.unloadSkin(skinList[i])
      }
    }
    // then load all skins on the given list
    for (let i = 0; i < newSkinList.length; i++) {
      this.loadSkin(newSkinList[i])
    }
    return true
  }
  /**
   * loads a skin and store the config under `this.skins[dirname]`.
   * @param {string} dirname directory name for the skin
   */
  loadSkin (dirname) {
    if (!GamepadRenderer.isDirnameOkay(dirname)) { return false }
    if (
      this.skins[dirname] &&
      typeof this.skins[dirname].loaded === 'boolean'
    ) { return true }
    this.skins[dirname] = {
      loaded: false
    }
    this.skinList.push(dirname)
    const skin = this.skins[dirname]
    const path = `./skin/${dirname}`
    fetch(`${path}/config.json`)
      .then(response => response.json())
      .then(data => {
        skin.path = path
        skin.config = data
        skin.src = []
        for (let i = 0; i < skin.config.src.length; i++) {
          skin.src[i] = new Image()
          skin.src[i].src = `${skin.path}/${skin.config.src[i]}`
        }
        skin.loaded = true
        GamepadRenderer.announceMessage(
          `Skin '${skin.config.name}' is loaded.`
        )
      })
      .catch(error => {
        this.unloadSkin(dirname)
        GamepadRenderer.announceMessage(error, 'error')
      })
  }
  unloadSkin (dirname) {
    const skinName = this.skins[dirname] && this.skins[dirname].config ?
      this.skins[dirname].config.name : dirname
    delete this.skins[dirname]
    const indexOnSkinList = this.skinList.indexOf(dirname)
    if (indexOnSkinList !== -1) {
      this.skinList.splice(this.skinList.indexOf(dirname), 1)
    }
    GamepadRenderer.announceMessage(`Unloaded skin ${skinName}.`)
  }
  /**
   * setup a loaded skin for one of four canvas
   * @param {string} dirname directory name for the skin
   * @param {number} slot index for one of four canvas
   * @param {gamepadId} gamepadId gamepad the skin is set to be used for
   */
  applySkinToSlot (dirname, slot, gamepadId) {
    if (!this.skins[dirname] || typeof slot === 'undefined') {
      this.loadSkin(dirname)
      return false
    }
    if (!this.skins[dirname].loaded) { return false }
    
    const skin = this.skins[dirname]
    const config = skin.config
  
    const canvas = this.canvas[slot]
    this.skinSlot[slot] = {}
    /** @type {SkinSlot} */
    const skinSlot = this.skinSlot[slot]
    
    skinSlot.dirname = dirname
    skinSlot.gamepadId = gamepadId
    skinSlot.src = skin.src
    skinSlot.layer = []
    skinSlot.ctx = []
    skinSlot.instruction = {
      sticks: skin.config.sticks,
      buttons: skin.config.buttons
    }
    skinSlot.properties = config.properties
    /**
     * It's false when `activeState` is an empty object.
     * @type {boolean}
     */
    skinSlot.activeStateReady = false
    /**
     * Stores the last seen states of sticks and buttons.
     *
     * Value is boolean, the structure follows that of the skin config,
     * and a stick value is an array containing two booleans -
     * one for stick movement and one for stick button press.
     *
     * @type {Object}
     */
    skinSlot.activeState = {}
    /**
     * Contains timestamp the last time a stick or a button is active.
     *
     * The structure follows that of the skin config.
     *
     * @type {Object}
     */
    skinSlot.lastActive = {}
    /**
     * Contains alpha values for sticks and buttons.
     *
     * The structure follows that of the skin config.
     *
     * @type {Object}
     */
    skinSlot.alpha = {}
    /**
     * true when assignment is in process
     * @type {boolean}
     */
    skinSlot.assigning = false
    /**
     * deduct at every frame, remove the message when it reaches 0, then deduct one more time.
     * @type {number}
     */
    skinSlot.messageDisplayTimeLeft = -1
  
    const altMessage = `a layer of canvas to display inputs of gamepad ${slot}`
    for (let l = 0; l < config.layer.length; l++) {
      const layer = GamepadRenderer.newCanvasLayer(
        config.layer[l].width,
        config.layer[l].height,
        config.layer[l].x,
        config.layer[l].y
      )
      layer.innerHTML = altMessage
      
      skinSlot.layer.push(layer)
      skinSlot.ctx.push(layer.getContext('2d'))
      canvas.appendChild(layer)
    }
  
    // add top layer for displaying messages
    const infoLayer = GamepadRenderer.newCanvasLayer(...this.maxCanvasSize, 0, 0)
    infoLayer.innerHTML = `a layer of canvas to display messages in regards to gamepad ${slot}`
    
    skinSlot.layer.push(infoLayer)
    skinSlot.ctx.push(infoLayer.getContext('2d'))
    canvas.appendChild(infoLayer)
    skinSlot.instruction.info = {
      layer: skinSlot.layer.length - 1,
      message: {
        clear: [
          {
            instruction: "clearRect",
            x: 0, y: 0,
            width: this.maxCanvasSize[0], height: this.maxCanvasSize[1]
          }
        ],
        show: [
          {
            instruction: "writeTextLines",
            y: this.maxCanvasSize[1]
          }
        ]
      }
    }
    
    return true
  }
  removeSkinFromSlot (slot) {
    delete this.skinSlot[slot].gamepadId
    delete this.skinSlot[slot].activeStateReady
    delete this.skinSlot[slot].activeState
    delete this.skinSlot[slot].lastActive
    delete this.skinSlot[slot].alpha
    delete this.skinSlot[slot].src
    delete this.skinSlot[slot].layer
    delete this.skinSlot[slot].ctx
    delete this.skinSlot[slot].instruction
    delete this.skinSlot[slot]
    while (this.canvas[slot].firstChild) {
      this.canvas[slot].removeChild(this.canvas[slot].lastChild)
    }
  }
  changeSkinOfSlot (slot, gamepadId, skinDirname = null) {
    if (skinDirname) {
      const skinMappingUpdated = this.setSkinMapping(gamepadId, skinDirname)
      if (!skinMappingUpdated) {
        GamepadRenderer.announceMessage(new Error(
          `Skin for the slot ${slot} couldn't be changed.`
        ))
        return false
      }
    }
    this.removeSkinFromSlot(slot)
    return this.applySkinToSlot(
      this.skinMapping[gamepadId],
      slot,
      gamepadId
    )
  }
  
  /**
   *
   * @returns {boolean} `true` if the render could be started,
   * instead of already being started at the time of request.
   */
  requestRender () {
    if (this.renderPending) { return false }
    
    this.renderPending = true
    this.tickFpsCounter()
    requestAnimationFrame(this.renderAll)
  }
  renderAll (timestamp) {
    this.renderPending = false
    
    /**
     * @type {DOMHighResTimeStamp}
     * @description Contains a timestamp at the moment `renderAll` just started running.
     */
    this._timestamp = timestamp || performance.now()
    
    for (
      let gamepadIndex = 0;
      gamepadIndex < 4;
      gamepadIndex++
    ) {
      const skinSlot = this.skinSlot[gamepadIndex]
      /** @type {?ProcessedGamepadChange} */
      const gamepadChange = this._processedGamepadChange ?
        this._processedGamepadChange[gamepadIndex] : null
      
      // render process for inputs
      if (gamepadChange) {
        // changes are received, work on rendering them
        if (skinSlot) {
          skinSlot.assigning = gamepadChange.properties.indexOf('assigning') !== -1
          // skinSlot already exists
          if (
            skinSlot.dirname === this.skinMapping[gamepadChange.id.gamepadId]
          ) {
            // it's the same slot used before
            if (skinSlot.assigning) { this.renderFrame(gamepadIndex) }
            if (!skinSlot.activeStateReady) {
              this.renderFrame(gamepadIndex)
            } else {
              this.render(gamepadIndex, gamepadChange)
            }
          } else {
            // the gamepad for the slot is changed
            this.changeSkinOfSlot(gamepadIndex, gamepadChange.id.gamepadId)
            if (
              this.skins[this.skinMapping[gamepadChange.id.gamepadId]] &&
              this.skins[this.skinMapping[gamepadChange.id.gamepadId]].loaded
            ) {
              this.renderFrame(gamepadIndex)
            }
          }
        } else {
          // skinSlot isn't made
          // find skin for the gamepad
          let newSkinDirname = this.skinMapping[gamepadChange.id.gamepadId]
          if (!newSkinDirname) {
            newSkinDirname = GamepadRenderer.findDefaultSkin(
              gamepadChange.id.gamepadId, gamepadChange.properties
            )
            this.setSkinMapping(gamepadChange.id.gamepadId, newSkinDirname)
          }
          this.applySkinToSlot(
            newSkinDirname, gamepadIndex, gamepadChange.id.gamepadId
          )
          if (
            this.skins[newSkinDirname] &&
            this.skins[newSkinDirname].loaded
          ) {
            this.renderFrame(gamepadIndex)
          }
        }
      } else if (skinSlot) {
        // no changes are received, but skin slot for the index exists
        if (!skinSlot.activeStateReady) {
          // skinSlot might be recreated - active state should be made
          this.renderFrame(gamepadIndex)
        } else if (this.timingForFps(this.fadeoutFps)) {
          // skin is loaded and active state also exist
          this.renderFadeout(gamepadIndex)
        }
      }
    } // for loop of gamepadIndex
    
    this._processedGamepadChange = null
    this._timestamp = null
    
    this.requestRender()
  }
  
  /**
   * Render the changes of gamepads,
   * and for unchanged sticks/buttons on a gamepad that made changes
   * calculate and render the fade-out effect.
   * @param {number} gamepadIndex
   * @param {ProcessedGamepadChange} gamepadChange
   * @param {boolean} useFadeout
   * @returns {boolean}
   */
  render (gamepadIndex, gamepadChange, useFadeout = true) {
    const skinSlot = this.skinSlot[gamepadIndex]
    if (!skinSlot.activeStateReady) {
      GamepadRenderer.announceMessage(
        `Active state of the skin for slot ${gamepadIndex} isn't populated.` +
        'Rendering the frame first and populating the state.'
      )
      this.renderFrame(gamepadIndex)
      return false
    }
    const src = skinSlot.src
    const ctx = skinSlot.ctx
    const inst = skinSlot.instruction
    const properties = skinSlot.properties
    if (!src || !ctx || !inst) {
      GamepadRenderer.announceMessage({
        message: 'Renderer is ready to draw but tools are somehow missing.',
        skinSlot: skinSlot
      }, 'error')
      return false
    }
  
    const activeState = skinSlot.activeState
    const lastActive = skinSlot.lastActive
    const alpha = skinSlot.alpha
    const timestampAtStart = this._timestamp || performance.now()
    
    const forJoystick = properties.indexOf('joystick') !== -1
    const dpadInUse = activeState.buttons.dpad && activeState.buttons.dpad.value
    
    /** @type {{left: ?stickChange, right: ?stickChange}} */
    const sticks = gamepadChange.sticks
    const stickLayerIndex = inst.sticks.layer
    
    // give instructions for sticks
    for (let s = 0; s < this.order.stick.length; s++) {
      const stickName = this.order.stick[s]
      const stickInst = inst.sticks[stickName]
      // skip if the referred instruction is not made
      if (!stickInst || stickInst.constructor !== Object) { continue }
      
      if (forJoystick && dpadInUse) {
        // skip rendering sticks because dpad is active
      } else if (sticks[stickName]) {
        // change for the stick is confirmed
        const values = sticks[stickName]
        let fadingOut = false
        let deltaOpacity = 1
        
        // update active state last seen
        activeState.sticks[stickName][0] = values.active
        if (values.pressed !== null) {
          // only update button state when a change is found,
          // otherwise keep the last seen state
          activeState.sticks[stickName][1] = values.pressed
        }
        // update last active time (if active) and alpha value
        if (
          activeState.sticks[stickName][0] ||
          activeState.sticks[stickName][1]
        ) {
          lastActive.sticks[stickName] = timestampAtStart
          alpha.sticks[stickName] = 1
        } else if (this.timingForFps(this.fadeoutFps)) {
          const timeInactive =
            timestampAtStart - lastActive.sticks[stickName]
          ;[fadingOut, deltaOpacity] = this.getFadeoutState(timeInactive)
          if (fadingOut) {
            alpha.sticks[stickName] = this.getMultipliedAlpha(
              alpha.sticks[stickName], deltaOpacity
            )
          }
        }
        
        this.followInstructions(
          ctx[stickLayerIndex], src, stickInst.clear,
          null, alpha.sticks[stickName], null
        )
        if (activeState.sticks[stickName][1]) {
          this.followInstructions(
            ctx[stickLayerIndex], src, stickInst.on,
            values.value, alpha.sticks[stickName], values.delta
          )
        } else {
          this.followInstructions(
            ctx[stickLayerIndex], src, stickInst.off,
            values.value, alpha.sticks[stickName], values.delta
          )
        }
      } else if (useFadeout) {
        // if stick change isn't found, apply fade-out route
        // if it's actually active, update the lastActive time instead
        if (
          activeState.sticks[stickName][0] ||
          activeState.sticks[stickName][1]
        ) {
          lastActive.sticks[stickName] = timestampAtStart
        } else if (this.timingForFps(this.fadeoutFps)) {
          const timeInactive =
            timestampAtStart - lastActive.sticks[stickName]
          let [ fadingOut, deltaOpacity ] = this.getFadeoutState(timeInactive)
  
          alpha.sticks[stickName] = this.getMultipliedAlpha(
            alpha.sticks[stickName], deltaOpacity
          )
  
          this.followInstructions(
            ctx[stickLayerIndex], src, stickInst.clear,
            null, alpha.sticks[stickName], null
          )
          this.followInstructions(
            ctx[stickLayerIndex], src, stickInst.off,
            [0, 0, null], alpha.sticks[stickName], [0, 0, null]
          )
        }
      }
    }
    
    /**
     *  @type {Object}
     *  @property {?Object.<string, ?(buttonChange|basicButtonChange)>} dpad
     *  @property {?Object.<string, ?buttonChange>} face
     *  @property {?Object.<string, ?buttonChange>} shoulder
     */
    const buttons = gamepadChange.buttons
    const buttonLayerIndex = inst.buttons.layer
    
    // give instructions for buttons
    for (let bg = 0; bg < this.order.buttonGroup.length; bg++) {
      const buttonGroupName = this.order.buttonGroup[bg]
      // skip the button group if the skin doesn't include it
      if (!inst.buttons[buttonGroupName]) { continue }
      
      // check for changes for a button group
      if (buttons[buttonGroupName]) {
        // changes for a button group is confirmed
        for (let b = 0; b < this.order.button[bg].length; b++) {
          // skip other dpad instructions on joystick
          if (forJoystick && bg === 0 && b !== 0) { break }
          
          const buttonName = this.order.button[bg][b]
          const buttonInst = inst.buttons[buttonGroupName][buttonName]
          // skip if the referred instruction is not made
          if (!buttonInst || buttonInst.constructor !== Object) { continue }
    
          if (buttons[buttonGroupName][buttonName]) {
            // change for the button is confirmed
            const value = buttons[buttonGroupName][buttonName].value
      
            this.followInstructions(
              ctx[buttonLayerIndex], src, buttonInst.clear,
              null, null, null
            )
  
            // joystick skin uses dpad.value which is [x-axis, y-axis]
            const valueIsOff = forJoystick && bg === 0 && b === 0 ?
              value[0] === 0 && value[1] === 0 : value === 0
            if (valueIsOff) {
              this.followInstructions(
                ctx[buttonLayerIndex], src, buttonInst.off,
                null, null, null
              )
              if (forJoystick && bg === 0 && b === 0) {
                activeState.sticks.left[0] = false
              }
              activeState.buttons[buttonGroupName][buttonName] = false
            } else {
              this.followInstructions(
                ctx[buttonLayerIndex], src, buttonInst.on,
                value, null, null
              )
              if (forJoystick && bg === 0 && b === 0) {
                GamepadRenderer.updateLeftStickActiveStatesOnDpadInput(
                  skinSlot, timestampAtStart
                )
              }
              activeState.buttons[buttonGroupName][buttonName] = true
              lastActive.buttons[buttonGroupName][buttonName] = timestampAtStart
              alpha.buttons[buttonGroupName][buttonName] = 1
            }
          } else if (useFadeout) {
            // for unchanged buttons in a changed group
            // if it's actually active, update the lastActive time instead
            if (activeState.buttons[buttonGroupName][buttonName]) {
              if (forJoystick && bg === 0 && b === 0) {
                GamepadRenderer.updateLeftStickActiveStatesOnDpadInput(
                  skinSlot, timestampAtStart
                )
              }
              lastActive.buttons[buttonGroupName][buttonName] = timestampAtStart
            } else if (this.timingForFps(this.fadeoutFps)) {
              // dpad for joystick render fade-out using left stick part
              if (forJoystick && bg === 0 && b === 0) { continue }
              
              const timeInactive =
                timestampAtStart - lastActive.buttons[buttonGroupName][buttonName]
              let [ fadingOut, deltaOpacity ] = this.getFadeoutState(timeInactive)
              
              // check if it needs to be fading-out
              if (!fadingOut) { continue }
  
              alpha.buttons[buttonGroupName][buttonName] = this.getMultipliedAlpha(
                alpha.buttons[buttonGroupName][buttonName], deltaOpacity
              )
  
              this.followInstructions(
                ctx[buttonLayerIndex], src, buttonInst.clear,
                null, null, null
              )
              this.followInstructions(
                ctx[buttonLayerIndex], src, buttonInst.off,
                null, alpha.buttons[buttonGroupName][buttonName], null
              )
            }
          }
        }
      } else if (useFadeout) {
        // for unchanged button groups in a changed gamepad
        for (let b = 0; b < this.order.button[bg].length; b++) {
          // skip other dpad instructions on joystick
          if (forJoystick && bg === 0 && b !== 0) { break }
          
          const buttonName = this.order.button[bg][b]
          const buttonInst = inst.buttons[buttonGroupName][buttonName]
          // skip if the referred instruction is not made
          if (!buttonInst || buttonInst.constructor !== Object) { continue }
  
          // if it's actually active, update the lastActive time instead
          if (activeState.buttons[buttonGroupName][buttonName]) {
            lastActive.buttons[buttonGroupName][buttonName] = timestampAtStart
          } else if (this.timingForFps(this.fadeoutFps)) {
            // dpad for joystick render fade-out using left stick part
            if (forJoystick && bg === 0 && b === 0) { continue }
            const timeInactive =
              timestampAtStart - lastActive.buttons[buttonGroupName][buttonName]
            let [ fadingOut, deltaOpacity ] = this.getFadeoutState(timeInactive)
  
            // check if it needs to be fading-out
            if (!fadingOut) { continue }
  
            alpha.buttons[buttonGroupName][buttonName] = this.getMultipliedAlpha(
              alpha.buttons[buttonGroupName][buttonName], deltaOpacity
            )
  
            this.followInstructions(
              ctx[buttonLayerIndex], src, buttonInst.clear,
              null, null, null
            )
            this.followInstructions(
              ctx[buttonLayerIndex], src, buttonInst.off,
              null, alpha.buttons[buttonGroupName][buttonName], null
            )
          }
        }
      }
    }
  
    const infoLayerIndex = inst.info.layer
    const infoInst = inst.info.message
    // message disappear timer
    if (skinSlot.messageDisplayTimeLeft !== -1 && !skinSlot.assigning) {
      if (skinSlot.messageDisplayTimeLeft === 0) {
        this.followInstructions(
          ctx[infoLayerIndex], null, infoInst.clear, null
        )
      }
      skinSlot.messageDisplayTimeLeft--
    }
    if (gamepadChange.message) {
      if (skinSlot.messageDisplayTimeLeft === -1) {
        skinSlot.messageDisplayTimeLeft = this.messageDisplayTimeInSeconds * 60
      }
      this.followInstructions(
        ctx[infoLayerIndex], null, infoInst.clear, null
      )
      this.followInstructions(
        ctx[infoLayerIndex], null, infoInst.show, gamepadChange.message
      )
    }
    
    return true
  }
  
  /**
   * Calculate and render the fade-out effect to every stick/button,
   * when the whole gamepad has not made any changes.
   *
   * @param {number} gamepadIndex
   * @returns {boolean}
   */
  renderFadeout (gamepadIndex) {
    const skinSlot = this.skinSlot[gamepadIndex]
    if (!skinSlot.activeStateReady) {
      GamepadRenderer.announceMessage(
        `Active state of the skin for slot ${gamepadIndex} isn't populated.` +
        'Rendering the frame first and populating the state.'
      )
      this.renderFrame(gamepadIndex)
      return false
    }
    const src = skinSlot.src
    const ctx = skinSlot.ctx
    const inst = skinSlot.instruction
    const properties = skinSlot.properties
    if (!src || !ctx || !inst) {
      GamepadRenderer.announceMessage({
        message: 'Renderer is ready to draw but tools are somehow missing.',
        skinSlot: skinSlot
      }, 'error')
      return false
    }
  
    const activeState = skinSlot.activeState
    const lastActive = skinSlot.lastActive
    const alpha = skinSlot.alpha
    const timestampAtStart = this._timestamp || performance.now()
  
    const forJoystick = properties.indexOf('joystick') !== -1
    
    // sticks
    const stickLayerIndex = inst.sticks.layer
    
    for (let s = 0; s < this.order.stick.length; s++) {
      const stickName = this.order.stick[s]
      const stickInst = inst.sticks[stickName]
      if (!stickInst || stickInst.constructor !== Object) { continue }
      
      
      // if it's actually active, update the lastActive time instead
      if (
        activeState.sticks[stickName][0] ||
        activeState.sticks[stickName][1]
      ) {
        lastActive.sticks[stickName] = timestampAtStart
        continue
      }
      
      const timeInactive =
        timestampAtStart - lastActive.sticks[stickName]
      let [ fadingOut, deltaOpacity ] = this.getFadeoutState(timeInactive)
      
      // check if it needs to be fading-out
      if (!fadingOut) { continue }
      
      alpha.sticks[stickName] = this.getMultipliedAlpha(
        alpha.sticks[stickName], deltaOpacity
      )
  
      this.followInstructions(
        ctx[stickLayerIndex], src, stickInst.clear,
        null, alpha.sticks[stickName], null
      )
      this.followInstructions(
        ctx[stickLayerIndex], src, stickInst.off,
        [0, 0, null], alpha.sticks[stickName], [0, 0, null]
      )
    }
  
    // buttons
    const buttonLayerIndex = inst.buttons.layer
    
    for (let bg = 0; bg < this.order.buttonGroup.length; bg++) {
      const buttonGroupName = this.order.buttonGroup[bg]
      // skip the button group if the skin doesn't include it
      if (!inst.buttons[buttonGroupName]) { continue }
      
      for (let b = 0; b < this.order.button[bg].length; b++) {
        // skip other dpad instructions on joystick
        if (forJoystick && bg === 0 && b !== 0) { break }
        
        const buttonName = this.order.button[bg][b]
        const buttonInst = inst.buttons[buttonGroupName][buttonName]
        if (!buttonInst || buttonInst.constructor !== Object) { continue }
  
        // if it's actually active, update the lastActive time instead
        if (activeState.buttons[buttonGroupName][buttonName]) {
          if (forJoystick && bg === 0 && b === 0) {
            GamepadRenderer.updateLeftStickActiveStatesOnDpadInput(
              skinSlot, timestampAtStart
            )
          }
          lastActive.buttons[buttonGroupName][buttonName] = timestampAtStart
          continue
        }
        
        // dpad for joystick render fade-out using left stick part
        if (forJoystick && bg === 0 && b === 0) { continue }
  
        const timeInactive =
          timestampAtStart - lastActive.buttons[buttonGroupName][buttonName]
        let [ fadingOut, deltaOpacity ] = this.getFadeoutState(timeInactive)
        
        // check if it needs to be fading-out
        if (!fadingOut) { continue }
  
        alpha.buttons[buttonGroupName][buttonName] = this.getMultipliedAlpha(
          alpha.buttons[buttonGroupName][buttonName], deltaOpacity
        )
        
        this.followInstructions(
          ctx[buttonLayerIndex], src, buttonInst.clear,
          null, null, null
        )
        this.followInstructions(
          ctx[buttonLayerIndex], src, buttonInst.off,
          null, alpha.buttons[buttonGroupName][buttonName], null
        )
      }
    }
    
    const infoLayerIndex = inst.info.layer
    const infoInst = inst.info.message
    // message disappear timer
    if (skinSlot.messageDisplayTimeLeft !== -1 && !skinSlot.assigning) {
      if (skinSlot.messageDisplayTimeLeft === 0) {
        this.followInstructions(
          ctx[infoLayerIndex], null, infoInst.clear, null
        )
      }
      skinSlot.messageDisplayTimeLeft--
    }
  }
  
  /**
   * Render the frame of the skin, to show every part of skin.
   * It walks over every part of gamepad part in the skin,
   * and populate `activeState` and `lastActive` along the way.
   * @param {number} gamepadIndex
   * @see GamepadRenderer#render
   */
  renderFrame (gamepadIndex) {
    const skinSlot = this.skinSlot[gamepadIndex]
    const src = skinSlot.src
    const ctx = skinSlot.ctx
    const inst = skinSlot.instruction
    const properties = skinSlot.properties
    if (!src || !ctx || !inst) {
      GamepadRenderer.announceMessage({
        message: 'Renderer is ready to draw but tools are somehow missing.',
        skinSlot: skinSlot
      }, 'error')
      return false
    }
  
    const activeState = skinSlot.activeState
    const lastActive = skinSlot.lastActive
    const alpha = skinSlot.alpha
    const timestampAtStart = this._timestamp || performance.now()
    
    activeState.sticks = activeState.sticks || {}
    lastActive.sticks = lastActive.sticks || {}
    alpha.sticks = alpha.sticks || {}
  
    const stickLayerIndex = inst.sticks.layer
    
    for (let s = 0; s < this.order.stick.length; s++) {
      const stickName = this.order.stick[s]
      const stickInst = inst.sticks[stickName]
      if (!stickInst || stickInst.constructor !== Object) { continue }
      
      this.followInstructions(
        ctx[stickLayerIndex], src, stickInst.clear,
        null, null, null
      )
      this.followInstructions(
        ctx[stickLayerIndex], src, stickInst.off,
        [0, 0, null], null, [0, 0, null]
      )
      
      // for stick movement and stick button
      activeState.sticks[stickName] = [false, false]
      lastActive.sticks[stickName] = timestampAtStart
      alpha.sticks[stickName] = 1
    }
    
    activeState.buttons = activeState.buttons || {}
    lastActive.buttons = lastActive.buttons || {}
    alpha.buttons = alpha.buttons || {}
  
    const buttonLayerIndex = inst.buttons.layer
    
    for (let bg = 0; bg < this.order.buttonGroup.length; bg++) {
      const buttonGroupName = this.order.buttonGroup[bg]
      // skip the button group if the skin doesn't include it
      if (!inst.buttons[buttonGroupName]) { continue }
      
      activeState.buttons[buttonGroupName] =
        activeState.buttons[buttonGroupName] || {}
      lastActive.buttons[buttonGroupName] =
        lastActive.buttons[buttonGroupName] || {}
      alpha.buttons[buttonGroupName] =
        alpha.buttons[buttonGroupName] || {}
        
      for (let b = 0; b < this.order.button[bg].length; b++) {
        const buttonName = this.order.button[bg][b]
        const buttonInst = inst.buttons[buttonGroupName][buttonName]
        // if the instruction is not made and therefore not an Object,
        // the loop will skip the button meant for the instruction
        if (!buttonInst || buttonInst.constructor !== Object) { continue }
        
        this.followInstructions(
          ctx[buttonLayerIndex], src, buttonInst.clear,
          null, null, null
        )
        this.followInstructions(
          ctx[buttonLayerIndex], src, buttonInst.off,
          null, null, null
        )
        
        activeState.buttons[buttonGroupName][buttonName] = false
        lastActive.buttons[buttonGroupName][buttonName] = timestampAtStart
        alpha.buttons[buttonGroupName][buttonName] = 1
      }
    }
    
    if (!skinSlot.activeStateReady) {
      skinSlot.activeStateReady = true
    }
  }
  
  followInstructions (ctx, src, inst, value, alpha, additionalValue) {
    // `this` is bound as `GamepadRenderer` in the constructor
    if (!inst) { return false }
    
    for (let i = 0; i < inst.length; i++) {
      const instName = inst[i].instruction
      const instArgs = []
      for (let a = 0; a < this.instructionParameters[instName].length; a++) {
        const parameterName = this.instructionParameters[instName][a]
        switch (parameterName) {
          case 'ctx':
            instArgs.push(ctx)
            break
          case 'src':
            instArgs.push(src[inst[i].src])
            break
          case 'value':
          case 'pos':
            instArgs.push(value)
            break
          case 'alpha':
            instArgs.push(typeof alpha === 'number' ? alpha : 1)
            break
          default:
            instArgs.push(
              inst[i].hasOwnProperty(parameterName) ?
                inst[i][parameterName] : undefined
            )
            break
        }
      }
      this.instruction[instName](...instArgs, additionalValue)
    }
  }
  
  /**
   * This method is to define many drawing instructions inside the class,
   * so render method can use them without redefining them every time.
   */
  loadInstructions () {
    this.instructionParameters = {
      clearRect: ['ctx', 'x', 'y', 'width', 'height'],
      clearPolygon: ['ctx', 'path'],
      drawImage: ['ctx', 'src', 'coord', 'alpha'],
      drawImageByPos: ['ctx', 'src', 'pos', 'areaSize', 'coord', 'alpha'],
      drawImageInNinePos: ['ctx', 'src', 'pos', 'length', 'lengthDiagonal', 'coord', 'alpha'],
      drawDifferentImageInNinePos: ['ctx', 'src', 'pos', 'allCoords', 'alpha'],
      drawImageInPolygon: ['ctx', 'src', 'path', 'coord', 'alpha'],
      drawImageInPolygonByValue: ['ctx', 'src', 'value', 'areaWidth', 'path', 'coord', 'alpha'],
      writeTextLine: ['ctx', 'y', 'value', 'color', 'fontSize', 'alpha'],
      writeTextLines: ['ctx', 'y', 'value', 'newLineOnBelow', 'color', 'fontSize', 'alpha']
    }
    // everything here has `this.instruction` as `this`
    this.instruction = {
      _posOrder: [
        'upleft','up','upright',
        'left','neutral','right',
        'downleft','down','downright'
      ],
      /**
       * Take the position data and convert their number to either -1, 0, or 1.
       *
       * It turns out there's a joystick that can't push the input all the way to 1,
       * so this method is to ensure stick/dpad position is always one of 9 possible cases.
       *
       * @param {number[]} pos
       * array of x-axis and y-axis value, each in a range of 0 ~ 1 (inclusive)
       * @param {number} [threshold=0.5] axis value below this is considered inactive
       * @returns {number[]} returns new pos data with values always being either -1, 0, or 1.
       * @private
       */
      _getDigitalPos: function (pos, threshold = 0.5) {
        if (!pos) { pos = [0, 0] }
        const posMagnitude = [ Math.abs(pos[0]), Math.abs(pos[1]) ]
        const digitalPos = [
          posMagnitude[0] >= threshold ?
            pos[0] / posMagnitude[0] : 0,
          posMagnitude[1] >= threshold ?
            pos[1] / posMagnitude[1] : 0
        ]
        if (digitalPos[0] % 1 !== 0 || digitalPos[1] % 1 !== 0) {
          GamepadRenderer.announceMessage(
            new Error('Value divided by its magnitude didn\'t return 1. ' +
                      'Code will keep running but it should be always rounded.')
          )
          digitalPos[0] = Math.round(digitalPos[0])
          digitalPos[1] = Math.round(digitalPos[1])
        }
        
        return digitalPos
      },
      clearRect: function (
        ctx, x, y, width, height
      ) {
        ctx.clearRect(x, y, width, height)
      },
      clearPolygon: function (
        ctx, path
      ) {
        ctx.save()
        ctx.globalCompositeOperation = 'destination-out'
        ctx.beginPath()
        for (let p = 0; p < path.length; p=p+2) {
          if (typeof path[p+1] === 'undefined') { continue }
          ctx.lineTo(path[p], path[p+1])
        }
        ctx.closePath()
        ctx.fill()
    
        ctx.restore()
      },
      drawImage: function (
        ctx, src, coord, alpha = 1
      ) {
        if (
          alpha === 0 ||
          !coord
        ) { return }
        if (alpha !== 1) {
          ctx.save()
          ctx.globalAlpha = alpha
        }
        ctx.drawImage(src, ...coord)
        if (alpha !== 1) {
          ctx.restore()
        }
      },
      drawImageByPos: function (
        ctx, src,
        pos, areaSize, coord,
        alpha = 1
      ) {
        if (!coord) { return }
        if (pos === null) { pos = [0, 0] }
        
        const fixedPos = []
        for (let a = 0; a < 2; a++) {
          fixedPos.push(pos[a] * areaSize[a])
        }
        const fixedCoord = []
        
        for (let p = 0; p < coord.length; p++) {
          if (coord[p].constructor === Array) {
            for (let a = 0; a < 2; a++) {
              fixedCoord.push(
                fixedPos[a] + (coord[p][a+2] ? 1 : -1) * coord[p][a]
              )
            }
          } else {
            fixedCoord.push(coord[p])
          }
        }
        this.drawImage(
          ctx, src, fixedCoord, alpha
        )
      },
      drawImageInNinePos: function (
        ctx, src,
        pos, length, lengthDiagonal, coord,
        alpha = 1
      ) {
        if (pos === null) { pos = [0, 0] }
        if (typeof lengthDiagonal === 'undefined') {
          lengthDiagonal = length * Math.sin(Math.PI*0.75)
        }
        
        const digitalPos = this._getDigitalPos(pos)
        
        // if both axis is not zero then dP[0]*dP[1] will be true
        const fixedLength = digitalPos[0] * digitalPos[1] ? lengthDiagonal : length
        const fixedCoord = []
        
        for (let p = 0; p < coord.length; p++) {
          if (coord[p].constructor === Array) {
            for (let a = 0; a < 2; a++) {
              fixedCoord.push(
                fixedLength * digitalPos[a] + coord[p][a]
              )
            }
          } else {
            fixedCoord.push(coord[p])
          }
        }
        
        this.drawImage(
          ctx, src, fixedCoord, alpha
        )
      },
      drawDifferentImageInNinePos: function (
        ctx, src, pos, allCoords, alpha = 1
      ) {
        if (pos === null) { pos = [0, 0] }
    
        const digitalPos = this._getDigitalPos(pos)
    
        /*
         * this.posOrder = [
         *   'upleft','up','upright',
         *   'left','neutral','right',
         *   'downleft','down','downright'
         * ]
         */
        const positionIndex = 4 + digitalPos[0] + 3 * digitalPos[1]
    
        this.drawImage(
          ctx, src, allCoords[this._posOrder[positionIndex]], alpha
        )
      },
      drawImageInPolygon: function (
        ctx, src, path, coord, alpha = 1
      ) {
        ctx.save()
        if (alpha === 0) { return }
        if (alpha !== 1) { ctx.globalAlpha = alpha }
        ctx.beginPath()
        for (let p = 0; p < path.length; p=p+2) {
          if (typeof path[p+1] === 'undefined') { continue }
          ctx.lineTo(path[p], path[p+1])
        }
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(src, ...coord)
        ctx.restore()
      },
      drawImageInPolygonByValue: function (
        ctx, src,
        value, areaWidth, path,
        coord, alpha = 1
      ) {
        const fixedPath = []
        const width = value * areaWidth
        for (let p = 0; p < path.length; p++) {
          if (path[p].constructor === Array) {
            fixedPath.push(
              path[p][0] + (path[p][1] ? 1 : -1) * width
            )
          } else {
            fixedPath.push(path[p])
          }
        }
        this.drawImageInPolygon(
          ctx, src, fixedPath, coord, alpha
        )
      },
      /**
       * write text on a semitransparent black line that fills up the full width
       * @param {CanvasRenderingContext2D} ctx
       * @param {number} y bottom point of the text
       * @param {string} value
       * @param {string} [color='white']
       * @param {number} [fontSize=16]
       * @param {number} [alpha=1]
       */
      writeTextLine: function (
        ctx, y, value, color = 'white', fontSize = 16, alpha = 1
      ) {
        ctx.save()
  
        // fill background color
        ctx.globalAlpha = 0.5 * alpha
        ctx.fillStyle = 'black'
        /*const letterHeight =
          parseFloat(
            window.getComputedStyle(ctx.canvas, null)
              .getPropertyValue('font-size')
          )*/
        ctx.fillRect(0, y, ctx.canvas.clientWidth, -1 * fontSize)
        
        // write text
        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        ctx.font = '1em monospace'
        ctx.textBaseline = 'ideographic'
        
        ctx.fillText(value, 0, y)
        
        ctx.restore()
      },
      /**
       * write multiple text lines on a semitransparent black line that fills up the full width
       * @param {CanvasRenderingContext2D} ctx
       * @param {number} y bottom point of the text
       * @param {string[]} value
       * @param {boolean} [newLineOnAbove=false] next line will appear above the last line
       * @param {string} [color='white']
       * @param {number} [fontSize=16]
       * @param {number} [alpha=1]
       */
      writeTextLines: function (
        ctx, y, value, newLineOnAbove = false, color = 'white', fontSize = 16, alpha = 1
      ) {
        ctx.save()
        
        // fill background color
        ctx.globalAlpha = 0.25 * alpha
        ctx.fillStyle = 'black'
        const totalHeight = value.length * fontSize
        ctx.fillRect(0, y, ctx.canvas.clientWidth, -1 * totalHeight)
        
        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        ctx.font = '1em monospace'
        ctx.textBaseline = 'ideographic'
        
        for (let l = 0; l < value.length; l++) {
          ctx.fillText(
            value[l], 0,
            y - ( newLineOnAbove ? l : (value.length - 1 - l) ) * fontSize
          )
        }
        
        ctx.restore()
      }
    }
  }
  
  /**
   * This method is to define gamepad input orders in a way
   * I can hopefully efficiently loop through.
   */
  loadOrders () {
    this.order = {
      stick: ['left','right'],
      buttonGroup: ['dpad', 'face', 'shoulder'],
      button: [
        // joystick rendering will skip after first property of this array
        // so first property should be the joystick related dpad value
        ['value','up','down','left','right'],
        ['down','right','left','up','select','start','l3','r3','home','touchpad'],
        ['l1','r1','l2','r2']
      ]
    }
  }
}
