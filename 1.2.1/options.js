var gpConstants = {
  // how big the thumb sticks should be? (0~100)
  thumbSize: 60,
  // if not monospace, what fonts should be used?
  defaultFont: 'Fira Code',
  // what should be the color of buttons?
  defaultColor: 'white',
  // what should be the background color for axes?
  axesBgColor: 'rgba(0, 0, 0, 0.8)',
  // what color the text of the pressed button should turn to?
  pressedButtonColor: 'orange',
  // change the hue of buttons.
  // this affects background color of pressed buttons as well as
  // the default color of buttons.
  // if you want to separately change the background color,
  // modify the single pixel image file `dot.png`.
  pressedButtonBackgroundColorHue: '0',
  // how far should the stick have moved 
  // to be considered as an intentional movement? (0~1)
  // 0 is the center, 1 is the border.
  // currently it tracks the position of individual axes, 
  // so the deadzone is shaped like a square.
  axisDeadzone: 0.08,
  // should unpressed buttons fade out? (true/false)
  useFadeOut: true,
  // set the seconds the fade-out starts in the array.
  fadeOutTime: [8, 16, 32],
  // set the strength of the fade-out for each timing above. (0~1)
  fadeOutStrength: [0.5, 0.9, 1],
  // set the seconds each fade-out applies through.
  fadeOutDuration: 4
}
