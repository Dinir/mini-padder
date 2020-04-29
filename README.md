# Gamepad Viewer

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)][JavaScript Standard Style]

---

**This is a project being developed right now. Some of the introductions below won't apply to the actual project yet.**

To use the old one that worked on only handful kind of gamepads, checkout the [1.2.1 release](https://github.com/Dinir/gamepad-viewer/releases/tag/1.2.1), or go to [this hosted page](https://dinir.github.io/gamepad-viewer/xboxpadviewer.html).

---

| ![DInput Default and Joystick Default] | ![Input Assignment on 8Bitdo NES30 Pro] |
| :---: | :---: |
| multiple gamepads with different layouts | assigning inputs |

| ![DInput ROCKETSROCKETSROCKETS] ![DInput Lightfield] |
| :---: |
| displaying over game screens |

Simple gamepad input overlay for streaming, with default skins that keep a good readability even in tough encoding situations.

- Supports 4 gamepads simultaneously.
- Default skins for XInput, DInput, 8-button arcade joysticks.
- Fade-out effect for unused buttons.
- Directly capture from OBS without running external programs.  
Configurations are stored in the local storage, which will be loaded next time the page is loaded.

It is intended to be running on a Chromium environment and depends on the use of localStorage to store and load configurations.

# How to Use

## Using the hosted version

- From OBS browser source, put the address of the [hosted webpage] as URL. Recommended Width and Height is 1048 × 600.
- Right click the source, select *Transform -> Edit Transform...* to **crop off outside of the intended display area**.  
  The intended display area vary with the way multiple gamepads are displayed. Single gamepad area is 256 × 144, and the overall area size will be displayed on the control panel. Each gamepad areas are spaced by 8 pixels.
- To make a change using the control panel, right click the source and select *Interact*.
- The page will start showing gamepads when any input is made on them.

## Hosting it yourself

By downloading the release and hosting it yourself, you can add or customize skins.

- ~~If you know how to do it, you can download the codes alone. If you don't, you can downloaded the release with [http-server](https://www.npmjs.com/package/http-server) included in it and follow below.~~
- ~~Run `runserver.bat` to host it on your localhost. The page can be found on `http://localhost:21600/gamepadviewer.html`. Close the opened command prompt window after use.  
The batch file is just a single line file that starts http-server.~~

# Exporting & Importing Settings

A local web page is not allowed to read files from the computer, so these progresses can't be made simple.

- ~~If you made a custom skin, put the whole folder in `skin` folder, then register the folder name on the control panel.~~
- If you want to keep settings for the viewer outside of it, you can copy them as a form of JSON text from the page. Paste such text to import settings.

---

I tried to make this project to prove to myself that I can make and *complete* making a thing. Also that I can use it for my own streams.

Thank you for your visit and reading through this readme file. If you find this program useful and somehow making some parts of your life better, please consider [donating](https://ko-fi.com/dinir). 



[DInput Default and Joystick Default]: ./images/DS4-and-Joystick.gif '(539.9kB) Dinput Default Skin and Joystick Default Skin'
[Input Assignment on 8Bitdo NES30 Pro]: ./images/Assignment.gif '(564.7kB) Assigning buttons for 8Bitdo NES30 Pro'
[DInput ROCKETSROCKETSROCKETS]: ./images/DInput-R3.gif '(2.15MB) Mild Button Mash'
[DInput Lightfield]: ./images/DInput-LF.gif '(1.55MB) Single Button Usage'

[hosted webpage]: https://dinir.github.io/gamepad-viewer/gamepadviewer.html
[latest release]: https://github.com/Dinir/gamepad-viewer/releases/latest
[JavaScript Standard Style]: https://standardjs.com
