class Updater {
  constructor (currentVersionString, oldestVersion) {
    this.currentVersion = Updater.formatVersionString(currentVersionString)
    this.lastFoundVersion = Updater.formatVersionString(
      window.localStorage.getItem('version') || oldestVersion || '0.0.0'
    )
    /**
     * @typedef {Object.<
     *   string, Object<
     *     string, Object<
     *       string, function(): boolean
     *     >
     *   >
     * >} UpdateTasks
     *
     * @example
       {
         '2': {
           '0': {
             '0': function () {console.log('update test 200'); return true},
             '1': function () {console.log('update test 201'); return true},
             '2': function () {console.log('update test 202'); return true},
             '4': function () {console.log('update test 204'); return true}
           },
           '1': {
             '0': function () {console.log('update test 210'); return true},
             '1': function () {console.log('update test 211'); return true},
             '2': function () {console.log('update test 212'); return true}
           },
           '3': {
             '0': function () {console.log('update test 230'); return true}
           },
           '5': {
             '0': function () {console.log('update test 250'); return true},
             '2': function () {console.log('update test 252'); return true},
             '3': function () {console.log('update test 253'); return true},
             '5': function () {console.log('update test 255'); return true}
           },
           '6': {
             '0': function () {console.log('update test 260'); return true},
             '1': function () {console.log('update test 261'); return true}
           }
         }
       }
     */
    this.updateTasks = {}
  }
  
  static formatVersionString (versionString) {
    const segmentNames = ['major', 'minor', 'patch']
    if (!versionString) { versionString = '0.0.0' }
    const formattedVersionObject = {}
    versionString.split('.').forEach((v, i) => {
      formattedVersionObject[segmentNames[i]] = v
    })
    return formattedVersionObject
  }
  static getVersionString (formattedVersionObject) {
    return formattedVersionObject.major + '.' +
           formattedVersionObject.minor + '.' +
           formattedVersionObject.patch
  }
  static announceMessage (message) {
    if (message instanceof Error) {
      console.error(message)
    }
    console.log(message)
  }
  
  get version () {
    return Updater.getVersionString(this.currentVersion)
  }
  
  setLastUpdatedVersionToCurrentVersion () {
    this.lastFoundVersion.major = this.currentVersion.major
    this.lastFoundVersion.minor = this.currentVersion.minor
    this.lastFoundVersion.patch = this.currentVersion.patch
  }
  announceUpdateCompletionAndSetLastUpdatedVersion (
    newMajorNumber, newMinorNumber, newPatchNumber
  ) {
    let message = 'Updated: ' + Updater.getVersionString(this.lastFoundVersion)
    if (!isNaN(parseInt(newMajorNumber))) {
      this.lastFoundVersion.major = String(newMajorNumber)
    }
    if (!isNaN(parseInt(newMinorNumber))) {
      this.lastFoundVersion.minor = String(newMinorNumber)
    }
    if (!isNaN(parseInt(newPatchNumber))) {
      this.lastFoundVersion.patch = String(newPatchNumber)
    }
    message += ' -> ' + Updater.getVersionString(this.lastFoundVersion)
    Updater.announceMessage(message)
  }
  saveLastUpdatedVersion () {
    const versionString = Updater.getVersionString(this.lastFoundVersion)
    window.localStorage.setItem('version', versionString)
  }
  
  patchUpdate () {
    const majorNumber = this.lastFoundVersion.major
    const minorNumber = this.lastFoundVersion.minor
    let patchNumber = this.lastFoundVersion.patch
    
    const allPatchUpdates = this.updateTasks[majorNumber][minorNumber]
    
    const updateIndex = Object.keys(allPatchUpdates)
    
    for (let i = 0; i < updateIndex.length; i++) {
      if (patchNumber >= updateIndex[i]) { continue }
      
      try {
        const updateResult = allPatchUpdates[updateIndex[i]] ?
          allPatchUpdates[updateIndex[i]]() : true
        if (updateResult) {
          this.announceUpdateCompletionAndSetLastUpdatedVersion(
            null, null, updateIndex[i]
          )
          patchNumber = updateIndex[i]
        }
      } catch (e) {
        Updater.announceMessage(e)
        return false
      }
    }
    
    this.saveLastUpdatedVersion()
    return true
  }
  
  minorUpdate () {
    const majorNumber = this.lastFoundVersion.major
    let minorNumber = this.lastFoundVersion.minor
    let patchNumber = this.lastFoundVersion.patch
    
    const allMinorUpdates = this.updateTasks[majorNumber]
    if (!allMinorUpdates) { return false }
    
    const updateIndex = Object.keys(allMinorUpdates)
    
    for (let i = 0; i < updateIndex.length; i++) {
      if (minorNumber > updateIndex[i]) { continue }
  
      if (minorNumber < updateIndex[i]) {
        // minor version up
        try {
          const updateResult = allMinorUpdates[updateIndex[i]][0] ?
            allMinorUpdates[updateIndex[i]][0]() : true
          if (updateResult) {
            this.announceUpdateCompletionAndSetLastUpdatedVersion(
              null, updateIndex[i], 0
            )
            minorNumber = updateIndex[i]
            patchNumber = 0
          }
        } catch (e) {
          Updater.announceMessage(e)
          return false
        }
      }
  
      // put same version case after 'current is older' case
      // so after increasing the version it can still work on lower version changes in the same loop
      if (minorNumber === updateIndex[i]) {
        // patches under the minor version
        try {
          const updateResult = this.patchUpdate()
          if (updateResult) {
            Updater.announceMessage(`Updated all patches under ${majorNumber}.${minorNumber}.`)
        
          }
        } catch (e) {
          Updater.announceMessage(e)
          return false
        }
      }
    }
    
    // minor update is successfully done
    this.saveLastUpdatedVersion()
    return true
  }
  
  majorUpdate () {
    let majorNumber = this.lastFoundVersion.major
    let minorNumber = this.lastFoundVersion.minor
    let patchNumber = this.lastFoundVersion.patch
    
    const allUpdates = this.updateTasks
    
    const updateIndex = Object.keys(allUpdates)
    
    for (let i = 0; i < updateIndex.length; i++) {
      if (majorNumber > updateIndex[i]) { continue }
      
      if (majorNumber < updateIndex[i]) {
        // major version up
        try {
          const updateResult = allUpdates[updateIndex[i]][0][0]?
            allUpdates[updateIndex[i]][0][0]() : true
          if (updateResult) {
            this.announceUpdateCompletionAndSetLastUpdatedVersion(
              updateIndex[i], 0, 0
            )
            majorNumber = updateIndex[i]
            minorNumber = 0
            patchNumber = 0
          }
        } catch (e) {
          Update.announceMessage(e)
          return false
        }
      }
  
      // put same version case after 'current is older' case
      // so after increasing the version it can still work on lower version changes in the same loop
      if (majorNumber === updateIndex[i]) {
        // patches under the major version
        try {
          const updateResult = this.minorUpdate()
          if (updateResult) {
            Updater.announceMessage(`Updated all minors under ${majorNumber}.`)
          }
        } catch (e) {
          Updater.announceMessage(e)
          return false
        }
      }
    }
    
    // major update is successfully done
    this.saveLastUpdatedVersion()
    return true
  }
}
