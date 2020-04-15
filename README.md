# Gamepad Viewer

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)][JavaScript Standard Style]

---

**This is a project being developed right now. Many of the introductions below won't apply to the actual project yet.**

To use the old one that worked on only handful kind of gamepads, checkout the [1.2.1 release](https://github.com/Dinir/gamepad-viewer/releases/tag/1.2.1), or go to [this hosted page](https://dinir.github.io/gamepad-viewer/xboxpadviewer.html).

---

| ![DInput Default and Joystick Default] | ![DInput ROCKETSROCKETSROCKETS] <br> ![DInput Lightfield] |
| :---: | :---: |
| multiple gamepads with different layouts | displaying over game screens |



Simple gamepad input overlay for streaming, with default skins that keep a good readability even in tough encoding situations.

- Supports 4 gamepads simultaneously.
- Default skins for XInput, DInput, 8-button arcade joysticks.
- Fade-out effect for unused buttons.
- Customizable skin configuration - layout button shape, and direction for displaying a partly pressed analog shoulder button.

This is made to be directly used in OBS Browser source without running any external programs. It is intended to be running in a Chromium environment and depends on the use of localStorage to store and load various options.

# How to Use

- ~~Download and unzip the [latest release] and **capture `gamepadviewer.html` in your streaming software**. If you can grant access to the Local storage to the [hosted webpage], you can capture it instead without downloading anything.~~ Recommended Width and Height is 1048 × 600.
- Right click the source, select *Transform -> Edit Transform...* to **crop off outside of the intended display area**.  
  The intended display area vary with the way you want multiple gamepads to be displayed. Single gamepad area is 256 × 144, and the overall area size will be displayed on the control panel.
- To make a change using the control panel, right click the source and select *Interact*.
- The page will start showing gamepads when any input is made on them.

# Exporting & Importing Settings

A local web page is not allowed to read files from the computer, so these progresses can't be made simple.

- If you made a custom skin, put the whole folder in `skin` folder, then register the folder name on the control panel.
- If you want to keep settings for the viewer outside of it, you can copy them as a form of JSON text from the page. Paste such text to import settings.

---

I tried to make this project to prove to myself that I can make and *complete* making a thing. Also that I can use it for my own streams.

[DInput Default and Joystick Default]: ./images/DS4-and-Joystick.gif '(539.9kB) Dinput Default Skin and Joystick Default Skin'
[DInput ROCKETSROCKETSROCKETS]: ./images/DInput-R3.gif '(2.15MB) Mild Button Mash'
[DInput Lightfield]: ./images/DInput-LF.gif '(1.55MB) Single Button Usage'

[hosted webpage]: https://dinir.github.io/gamepad-viewer/gamepadviewer.html
[latest release]: https://github.com/Dinir/gamepad-viewer/releases/latest
[JavaScript Standard Style]: https://standardjs.com
