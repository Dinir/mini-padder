/**
 * @typedef {Object} SkinSlot
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
 * MappingStorageManager will always only transfer 'changes',
 * which works for usages that don't need to bind anything together:
 * a logic dealing each of the inputs separately can only work whenever
 * a change occurred therefore it's transferred from MappingStorageManager,
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
 * canvas contex for each layers, ordered by config.json.
 *
 * @property {Object} instruction
 * specific data to draw each sprites,
 * mapped in a form of processedGamepadChange.
 * It's a reference to `config.sticks` and `config.buttons`.
 */
class GamepadRenderer {
  /**
   *
   * @param {HTMLDivElement[]} canvasArray contains divs for each set of canvas
   */
  constructor (canvasArray) {
    this.renderPending = true
    
    this.loadOrders()
    this.loadInstructions()
    this.followInstructions.bind(this)
  
    this.canvas = canvasArray
    this.fadeOut = {}
  
    this.loadFadeOutOption()
    
    /**
     * @type {Object.<string, Object>}
     * Contains skin data obtained from each `config.json` in their directories. Key value is their directory names.
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
     * @type {Object.<string, string>}
     * store relations of gamepadId and a skin directory name, as key-value pair.
     */
    this.skinMapping = {}
    this.loadSkinMapping()
    // after finishing loading all, `renderPending` will be `false`.
    this.loadAllStoredSkins()
  
    /**
     * @type {SkinSlot[]} save references of skins for each gamepad slot.
     * Index is that of the gamepad.
     */
    this.skinSlot = []
    
    this.requestRender = this.requestRender.bind(this)
    this.renderAll = this.renderAll.bind(this)
    
    window.addEventListener('processedGamepadChange', this.requestRender.bind(this))
  }
  
  static isDirnameOkay (dirname) {
    return !/[^0-9a-zA-Z_\-]/.test(dirname)
  }
  static announceMessage (message, type) {
    const messageType = {
      log: 'log',
      error: 'error'
    }
    window.dispatchEvent(new CustomEvent('GPVMessage', {
      detail: {
        from: 'Gamepad Renderer',
        type: messageType[type] || messageType.log,
        message: message
      }
    }))
  }
  
  /**
   * Convert fade out options given in input elements
   * into a number array / number and save the converted value to the instance.
   *
   * `time` and `opacity` is a string with numbers separated by commas. `duration` is one number.
   *
   * @param {Object.<string, string>} optionObj
   * @param {string} optionObj.time seconds for each fade out level.
   * @param {string} optionObj.opacity transparency values for each level
   * @param {string} optionObj.duration transition time of fade out
   */
  setFadeOutOption (optionObj) {
    const convertIntoArray =
      v => v.split(',')
        .map(v => Number(v))
        .filter(v => !isNaN(v))
    this.fadeOut.time = convertIntoArray(optionObj.time || '0')
    this.fadeOut.opacity = convertIntoArray(optionObj.opacity || '0')
    this.fadeOut.duration = Number(optionObj.duration) || 0
    
    this.saveFadeOutOption()
  }
  setFadeOutOptionFromArray (optionObj) {
    this.fadeOut.time = optionObj.time || [0]
    this.fadeOut.opacity = optionObj.opacity || [0]
    this.fadeOut.duration = Number(optionObj.duration) || 0
  }
  saveFadeOutOption () {
    const optionJSON = JSON.stringify(this.fadeOut)
    window.localStorage.setItem('fadeOutOption', optionJSON)
  }
  loadFadeOutOption () {
    const fadeOutOption = JSON.parse(window.localStorage.getItem('fadeOutOption'))
    this.setFadeOutOptionFromArray(fadeOutOption || this.fadeOut || {})
  }
  
  setSkinMapping (gamepadId, skinDirname) {
    if (!GamepadRenderer.isDirnameOkay(skinDirname)) { return false }
    this.skinMapping[gamepadId] = skinDirname
    this.saveSkinMapping()
  }
  saveSkinMapping () {
    const mappingJSON = JSON.stringify(this.skinMapping)
    window.localStorage.setItem('rendererSkinMapping', mappingJSON)
  }
  loadSkinMapping () {
    const rendererSkinMapping = JSON.parse(window.localStorage.getItem('rendererSkinMapping'))
    this.skinMapping = rendererSkinMapping || this.skinMapping || {}
  }
  loadAllStoredSkins () {
    const dirnameSeen = {}
    const allSkinDirnames = Object.values(this.skinMapping)
      .filter(dirname => {
        return dirnameSeen.hasOwnProperty(dirname) ?
          false : (dirnameSeen[dirname] = true)
      })
    for (let d = 0; d < allSkinDirnames.length; d++) {
      this.loadSkin(allSkinDirnames[d])
    }
    this.renderPending = false
  }
  /**
   * loads a skin and store the config under `this.skins[dirname]`.
   * @param {string} dirname directory name for the skin
   */
  loadSkin (dirname) {
    if (!GamepadRenderer.isDirnameOkay(dirname)) { return false }
    this.skins[dirname] = {
      loaded: false
    }
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
        delete this.skins[dirname]
        GamepadRenderer.announceMessage(error, 'error')
      })
  }
  /**
   * setup a loaded skin for one of four canvas
   * @param {string} dirname directory name for the skin
   * @param {number} slot index for one of four canvas
   * @param {gamepadId} gamepadId gamepad the skin is set to be used for
   */
  applySkinToSlot (dirname, slot, gamepadId) {
    if (!this.skins[dirname] || typeof slot === 'undefined') { return false }
    if (!this.skins[dirname].loaded) { return false }
    
    const skin = this.skins[dirname]
    const config = skin.config
  
    const canvas = this.canvas[slot]
    this.skinSlot[slot] = {}
    /** @type {SkinSlot} */
    const skinSlot = this.skinSlot[slot]
    
    skinSlot.gamepadId = gamepadId
    skinSlot.stickButtonState = {
      left: false,
      right: false
    }
    skinSlot.src = skin.src
    skinSlot.layer = []
    skinSlot.ctx = []
    skinSlot.instruction = {
      sticks: skin.config.sticks,
      buttons: skin.config.buttons
    }
    
    for (let l = 0; l < config.layer.length; l++) {
      const layer = document.createElement('canvas')
      layer.setAttribute('width', config.layer[l].width)
      layer.setAttribute('height', config.layer[l].height)
      layer.style.top = config.layer[l].y + 'px'
      layer.style.left = config.layer[l].x + 'px'
      
      skinSlot.layer.push(layer)
      skinSlot.ctx.push(layer.getContext('2d'))
      canvas.appendChild(layer)
    }
  }
  removeSkinFromSlot (slot) {
    delete this.skinSlot[slot].gamepadId
    delete this.skinSlot[slot].stickButtonState
    delete this.skinSlot[slot].src
    delete this.skinSlot[slot].layer
    delete this.skinSlot[slot].ctx
    delete this.skinSlot[slot].instruction
    delete this.skinSlot[slot]
    while (this.canvas[slot].firstChild) {
      this.canvas[slot].removeChild(this.canvas[slot].lastChild)
    }
  }
  
  requestRender (e) {
    if (this.renderPending) { return false }
    if (!e.detail) {
      GamepadRenderer.announceMessage(
        'Type of the received `processedGamepadChange` event is different.',
        'error'
      )
      return false
    }
    
    this._e = e.detail
    this.renderPending = true
    requestAnimationFrame(this.renderAll)
  }
  renderAll () {
    this.renderPending = false
    if (!this._e) { return false }
    
    for (
      let gamepadIndex = 0;
      gamepadIndex < this._e.length;
      gamepadIndex++
    ) {
      if (!this._e[gamepadIndex]) { continue }
      
      const skinSlot = this.skinSlot[gamepadIndex]
      /** @type {processedGamepadChange} */
      const gamepadChange = this._e[gamepadIndex]
      
      // skinSlot already exists
      if (skinSlot) {
        // it's the same slot used before
        if (skinSlot.gamepadId === gamepadChange.id.gamepadId) {
          this.render(gamepadIndex)
        } else { // the gamepad for the slot is changed
          this.removeSkinFromSlot(gamepadIndex)
          this.applySkinToSlot(
            this.skinMapping[gamepadChange.id.gamepadId],
            gamepadIndex,
            gamepadChange.id.gamepadId
          )
          if (
  
            this.skins[this.skinMapping[gamepadChange.id.gamepadId]] &&
            this.skins[this.skinMapping[gamepadChange.id.gamepadId]].loaded
          ) {
            this.render(gamepadIndex)
          } else {
            GamepadRenderer.announceMessage(
              'skipping first frame for gamepad ' + gamepadIndex +
              ' as the skin is not ready'
            )
          }
        }
      } else { // skinSlot isn't made
        // find skin for the gamepad
        const newSkinDirname =
          this.skinMapping[gamepadChange.id.gamepadId] ||
          (/XInput/i.test(gamepadChange.id.gamepadId) ? 'xinput' : 'dinput')
        if (!newSkinDirname) {
          GamepadRenderer.announceMessage({
            message: 'Can\'t assign a skin directory name for the gamepad.',
            processedGamepadChange: gamepadChange
          }, 'error')
          continue
        }
        this.setSkinMapping(gamepadChange.id.gamepadId, newSkinDirname)
        this.applySkinToSlot(
          newSkinDirname, gamepadIndex, gamepadChange.id.gamepadId
        )
        if (
          this.skins[newSkinDirname] &&
          this.skins[newSkinDirname].loaded
        ) {
          this.render(gamepadIndex)
        } else {
          GamepadRenderer.announceMessage(
            'skipping first frame for gamepad ' + gamepadIndex +
            ' as the skin is not ready'
          )
        }
      }
    }
    this._e = null
  }
  render (gamepadIndex) {
    const stickButtonState = this.skinSlot[gamepadIndex].stickButtonState
    const src = this.skinSlot[gamepadIndex].src
    const ctx = this.skinSlot[gamepadIndex].ctx
    const inst = this.skinSlot[gamepadIndex].instruction
    if (!src || !ctx || !inst) {
      GamepadRenderer.announceMessage({
        message: 'Renderer is ready to draw but tools are somehow missing.',
        skinSlot: this.skinSlot[gamepadIndex]
      }, 'error')
      return false
    }
    /** @type {{left: ?stickChange, right: ?stickChange}} */
    const sticks = this._e[gamepadIndex].sticks
    const stickLayerIndex = inst.sticks.layer
    /**
     *  @type {Object}
     *  @property {?Object.<string, ?(buttonChange|basicButtonChange)>} dpad
     *  @property {?Object.<string, ?buttonChange>} face
     *  @property {?Object.<string, ?buttonChange>} shoulder
     */
    const buttons = this._e[gamepadIndex].buttons
    const buttonLayerIndex = inst.buttons.layer
    
    // give instructions for sticks
    for (let s = 0; s < this.order.stick.length; s++) {
      // sticks in the change will always exist
      const stickName = this.order.stick[s]
      if (!sticks[stickName]) { continue }
      const values = sticks[stickName]
      // update last seen stick button state when a change is found
      if (values.pressed !== null) {
        stickButtonState[stickName] = values.pressed
      }
      const stickInst = inst.sticks[stickName]
      // skip if the referred instruction is not made
      if (!stickInst || stickInst.constructor !== Object) { continue }
      
      this.followInstructions(ctx[stickLayerIndex], src, stickInst.clear, null, null)
      if (stickButtonState[stickName]) {
        this.followInstructions(ctx[stickLayerIndex], src, stickInst.on, values.value, values.delta)
      } else {
        this.followInstructions(ctx[stickLayerIndex], src, stickInst.off, values.value, values.delta)
      }
    }
    
    // give instructions for buttons
    for (let bg = 0; bg < this.order.buttonGroup.length; bg++) {
      const buttonGroupName = this.order.buttonGroup[bg]
      // dpad will be null on non 'axisdpad' gamepads when there's no change
      if (!buttons[buttonGroupName]) { continue }
      
      for (let b = 0; b < this.order.button[bg].length; b++) {
        const buttonName = this.order.button[bg][b]
        if(!buttons[buttonGroupName][buttonName]) { continue }
        
        // at this point the existence of the button input is confirmed
        const value = buttons[buttonGroupName][buttonName].value
        const buttonInst = inst.buttons[buttonGroupName][buttonName]
        // skip if the referred instruction is not made
        if (!buttonInst || buttonInst.constructor !== Object) { continue }
        
        this.followInstructions(ctx[buttonLayerIndex], src, buttonInst.clear, null, null)
        // comparing to 0 so that analog buttons with non-zero value
        // will be drawn with 'on' instruction
        if (value === 0) {
          this.followInstructions(ctx[buttonLayerIndex], src, buttonInst.off, null, null)
        } else {
          this.followInstructions(ctx[buttonLayerIndex], src, buttonInst.on, value, null)
        }
      }
    }
  }
  
  followInstructions (ctx, src, inst, value) {
    // `this` is bound as `GamepadRenderer` in the constructor
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
            if(inst[i].hasOwnProperty(parameterName)) {
              instArgs.push(inst[i][parameterName])
            }
        }
      }
      this.instruction[instName](...instArgs)
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
      drawImageInPolygon: ['ctx', 'src', 'path', 'coord', 'alpha'],
      drawImageInPolygonByValue: ['ctx', 'src', 'value', 'areaWidth', 'path', 'coord', 'alpha'],
      clearParallelogram: ['ctx', 'xMin', 'xMax', 'yMin', 'height', 'skewAway', 'vertical'],
      clearParallelogramByValue: ['ctx', 'value', 'areaWidth', 'xMin', 'xMax', 'yMin', 'height', 'skewAway', 'vertical']
    }
    this.instruction = {
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
      drawImage: function (ctx, src, coord, alpha = 1) {
        if (alpha === 0) { return }
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
        ctx, src, value, areaWidth,
        path, coord, alpha = 1
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
      clearParallelogram: function (
        ctx, xMin, xMax, yMin, height, skewAway = false, vertical = false
      ) {
        ctx.save()
        ctx.globalCompositeOperation = 'destination-out'
        ctx.fillStyle = 'black'
        
        ctx.beginPath()
        if (!vertical) {
          ctx.moveTo(xMax, yMin)
          ctx.lineTo(xMin, yMin)
          if (!skewAway) {
            ctx.lineTo(xMin - height, yMin + height)
            ctx.lineTo(xMax - height, yMin + height)
          } else {
            ctx.lineTo(xMin + height, yMin + height)
            ctx.lineTo(xMax + height, yMin + height)
          }
        } else {
          ctx.moveTo(yMin, xMax)
          ctx.lineTo(yMin, xMin)
          if (!skewAway) {
            ctx.lineTo(yMin + height, xMin - height)
            ctx.lineTo(yMin + height, xMax - height)
          } else {
            ctx.lineTo(yMin + height, xMin + height)
            ctx.lineTo(yMin + height, xMax + height)
          }
        }
        ctx.closePath()
        ctx.fill()
        
        ctx.restore()
      },
      clearParallelogramByValue: function (
        ctx, value, areaWidth,
        xMin, xMax, yMin, height, skewAway = false, vertical = false
      ) {
        const width = value * areaWidth
        this.clearParallelogram(
          ctx, xMin + width, xMax, yMin, height, skewAway, vertical
        )
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
        ['up','down','left','right'],
        ['down','right','left','up','select','start','home','touchpad'],
        ['l1','r1','l2','r2']
      ]
    }
  }
}
