/**
 * @typedef processedGamepadChange
 * @type {Object}
 * @description
 * This object contains input changes of a gamepad, arranged by a corresponding mapping.
 */

class GamepadRenderer {
  constructor (canvasArray) {
    this.canvas = canvasArray
    this.skins = []
    this.ready = Array(4).fill(false)
    this.renderPending = false
    window.addEventListener('gamepadChange', this.requestRender.bind(this))
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
  
  getSkin (gamepadIndex, dirname) {
    this.ready[gamepadIndex] = false
    if (dirname.search(/[^0-9a-zA-Z_\-]/) !== -1) return false
    
    const skinpath = `./skin/${dirname}/`
    fetch(skinpath + 'config.json')
      .then(response => response.json())
      .then(data => {
        this.skins[gamepadIndex] = {
          path: skinpath, config: data
        }
        this.ready[gamepadIndex] = true
        this.applySkin(gamepadIndex)
        GamepadRenderer.announceMessage(
          `Gamepad ${gamepadIndex} now has ` +
          `'${this.skins[gamepadIndex].config.name}' skin.`
        )
      })
      .catch(error => {
        this.skins[gamepadIndex] = null
        GamepadRenderer.announceMessage(error, 'error')
      })
  }
  applySkin (gamepadIndex) {
    this.skins[gamepadIndex].img = []
    this.skins[gamepadIndex].layer = []
    this.skins[gamepadIndex].tool = {}
    const { config, img, layer, tool } =
      this.skins[gamepadIndex]
    const canvas = this.canvas[gamepadIndex]
    
    for (let i = 0; i < config.src.length; i++) {
      img[i] = new Image()
      img[i].src = this.skins[gamepadIndex].path + config.src[i]
    }
    for (let i = 0; i < config.layer.length; i++) {
      switch (config.layer[i].dynamic) {
        case false:
          layer[i] = document.createElement('div')
          layer[i].style.backgroundImage =
            `url(${img[config.layer[i].src].src})`
          layer[i].style.backgroundPosition =
            config.layer[i].x + 'px ' +
            config.layer[i].y + 'px'
          canvas.appendChild(layer[i])
          break;
        case true:
          layer[i] = document.createElement('canvas')
          layer[i].setAttribute('width', config.layer[i].width)
          layer[i].setAttribute('height', config.layer[i].height)
          layer[i].style.top = config.layer[i].y + 'px'
          layer[i].style.left = config.layer[i].x + 'px'
          tool[config.layer[i].name] = {
            ctx: layer[i].getContext('2d'),
            src: img[config.layer[i].src]
          }
          canvas.appendChild(layer[i])
          break;
      }
    }
  }
  
  requestRender () {
    if (this.renderPending) { return false }
    this.renderPending = true
    requestAnimationFrame(this.renderAll.bind(this))
  }
  renderAll () {
    this.renderPending = false
    
    this.render(0)
    this.render(1)
    this.render(2)
    this.render(3)
  }
  render (gamepadIndex) {
    if (!this.ready[gamepadIndex]) { return false }
    
    
  }
}
