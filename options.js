var gpConstants = {
	// how big the thumb sticks should be? (0~100)
	thumbSize: 60
	// what should be the color of buttons?
	,defaultColor: "white"
	// what color the text of the pressed button should turn to?
	,pressedButtonColor: "orange"
	// change the hue of buttons.
	// this affects background color of pressed buttons as well as
	// the default color of buttons.
	// if you want to separately change the background color,
	// modify the single pixel image file `dot.png`.
	,pressedButtonBackgroundColorHue: "0"
	// how responsive should thumb stick tracking be? (0~)
	// it refers to this value when deciding if you moved the stick.
	// eg) 3 -> will track the position of the stick DOM
	// to 10^-3 below the decimal point.
	,axisSensitivity: 1
	// should unpressed buttons fade out? (true/false)
	,useFadeOut: true
	// set the seconds the fade-out starts in the array.
	,fadeOutTime: [8, 16, 32]
	// set the strength of the fade-out for each timing above. (0~1)
	,fadeOutStrength: [.5, .9, 1]
	// set the seconds each fade-out applies through.
	,fadeOutDuration: 4
};
