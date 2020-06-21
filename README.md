# Mini Padder

[![OBS Forum][badge: obs forum]][OBS Tool Page]
[![Trello][badge: trello]][Trello]
[![JavaScript Style Guide][badge: standard style]][standard style]
[![stargazers][badge: stargazers]][stargazers]

![Default Skins]

Simple gamepad input overlay for streaming, with default skins that keep good readability even in tough encoding situations.

- Supports 4 gamepads simultaneously.
- Default skins for XInput, DInput, 8-button arcade joysticks and 6-button gamepads.
- Fade-out effect for unused buttons, of which the duration and opacity can be adjusted.
- Directly capture from OBS without running external programs.

# Requirements

- A **Chromium** browser environment and access to local storage. This is the environment of OBS browser source.
- Features confirmed to be working on **OBS 24.0.3** and onward. On OBS 21.1.0 and below, gamepad inputs might not be detected.

# How to Use

- From OBS browser source, put the address of [the hosted webpage] as URL. Recommended Width and Height is 1048 × 600.
- Right-click the source, select *Transform -> Edit Transform...* to **crop off outside of the intended display area**.  
  The intended display area varies with the way multiple gamepads are displayed. Single gamepad area is 256 × 144, and the overall area size will be displayed on the control panel. The margin between each gamepad areas is 8 pixels.
- To make a change using the control panel, right-click the source and select *Interact*.
- Mini Padder will start showing gamepads on their first input.

See [the wiki page][wiki: how to use] for a little more detailed guide on how to use.

# Exporting & Importing Settings

A web page can't read files from the client computer before the user allows it, so this progress couldn't be made simple.

- If you made a custom skin, load the files on the control panel. Loaded skin then can be copied as a single large JSON on the control panel. To learn how to make a custom skin, refer to [the wiki page][wiki: making a skin].
- If you want to keep settings for the application outside of it, you can copy them as a form of JSON text from the page. Paste such text to import settings.

---

I tried to make this application to prove to myself that I can make and *complete* making a thing. Also that I can use it for my streams.

If you find Mini Padder useful, please consider a [donation][Donation Link]. 

Thank you for reading to the end! 😁



[Default Skins]: ./image/open-graph-image-0_5x.png 'All default skins'

[badge: obs forum]: https://img.shields.io/static/v1?label=&message=Forum&color=302e31&logo=obs-studio
[OBS Tool Page]: https://obsproject.com/forum/resources/mini-padder.944/
[badge: trello]: https://img.shields.io/static/v1?label=&message=Board&color=0079bf&logo=trello
[Trello]: https://trello.com/b/JvScNymb/mini-padder
[badge: standard style]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard style]: https://standardjs.com
[badge: stargazers]: https://img.shields.io/github/stars/Dinir/mini-padder?style=social&link=https://github.com/Dinir/mini-padder&link=https://github.com/Dinir/mini-padder/stargazers
[stargazers]: https://github.com/Dinir/mini-padder/stargazers

[the hosted webpage]: https://dinir.github.io/mini-padder/
[wiki: how to use]: https://github.com/Dinir/mini-padder/wiki/How-to-Use
[wiki: making a skin]: https://github.com/Dinir/mini-padder/wiki/Making-a-Skin

[Donation Link]: https://ko-fi.com/dinir
