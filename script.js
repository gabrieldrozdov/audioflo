// Slider values
let settings = {
	imageHue: .5,
	backgroundBrightness: .5,
	backgroundColor: .5,
	micSensitivity: .5,
	imageDistortion: .5,
	imageScale: .5
}

// Setup canvas
let visualizer = document.querySelector(".visualizer");
let canvasContainer = document.querySelector(".canvas");
let canvas, audioContext, mic, fft, pitch;
let notes = ["c0","c1","csharp","d","eflat","e","f0","f1","fsharp","g","gsharp","a0","a1","bflat","b0","b1","misc0","misc1","misc2","misc3"];
function setup() {
	canvas = createCanvas(canvasContainer.offsetWidth*2, (visualizer.offsetHeight-80)*2);
	canvas.parent('canvas');
	canvas.mousePressed(() => {startVisualizer(); startPitch();});
	audioContext = getAudioContext();
	mic = new p5.AudioIn();
	mic.start();
	angleMode(DEGREES);
	colorMode(HSB, 360, 100, 100, 1);
	imageMode(CENTER);
	background(0);
}

// Start visualizer audio input on click
let controls = document.querySelector(".controls");
function startVisualizer() {
	controls.style.opacity = 1;
	controls.style.pointerEvents = "unset";
	canvasContainer.style.cursor = "unset";
	document.querySelector(".canvas-message").style.display = "none";
	userStartAudio();
}

// Resize canvas
function windowResized() {
	resizeCanvas(canvasContainer.offsetWidth, (visualizer.offsetHeight-80));
	background(0);
}

// Easing
function easeInOutSine(x) {
	return -(Math.cos(Math.PI * x) - 1) / 2;
}
function easeInOutQuart(x) {
	return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
}

// Visualizer image class
let visualizerObjects = {};
class VisualizerObject {
	constructor(img) {
		this.src = loadImage(`assets/visualizer/${img}.png`);
		this.scaleDelta = settings["imageScale"]*width/2+10;
		this.scaleMin = 0;
		this.rot = Math.random()*360;
		this.rotVel = Math.random()*1-.5;
		this.pos = [(width/2)*(Math.random()), (height/2)*(Math.random())];
		this.vel = [Math.random()*10-5, Math.random()*10-5];
		this.totalLife = 60+Math.random()*200;
		this.lifespan = this.totalLife;
		this.easing = 0;
	}
	drawImage() {
		this.lifespan--;
		this.pos = [this.pos[0]+this.vel[0], this.pos[1]+this.vel[1]];
		this.rot = this.rot + this.rotVel;
		this.easing = easeInOutSine(1-Math.abs(0.5-this.lifespan/this.totalLife)*2);
		translate(width/2, height/2);
		rotate(this.rot);
		// tint(255, this.easing);
		image(this.src, this.pos[0], this.pos[1], this.scaleMin + this.scaleDelta*this.easing, this.scaleMin + this.scaleDelta*this.easing);
		rotate(-this.rot);
		translate(-width/2, -height/2);
	}
}

// Main p5 loop
let activeNote = "unknown";
let dist = 0;
let objectId = 0;
let delay = 0;
function draw() {
	background(360-settings["backgroundColor"]*360, 100, 100-settings["backgroundBrightness"]*100);
	delay--;

	// Set image distortion level
	if (settings["imageDistortion"] < .2) {
		dist = 4;
	} else if (settings["imageDistortion"] < .4) {
		dist = 3;
	} else if (settings["imageDistortion"] < .6) {
		dist = 2;
	} else if (settings["imageDistortion"] < .8) {
		dist = 1;
	} else {
		dist = 0;
	}

	// Draw images
	let note = "misc" + Math.floor(Math.random()*4);
	if (mic.getLevel() > .05) {
		if (activeNote != "unknown") {
			note = activeNote.replace(/[0-9]/g, '');
			if (note == "c" || note == "f" || note == "a" || note == "b") {
				note = note + Math.floor(Math.random()*2);
			} else if (note == "low" || note == "high") {
				note = "misc" + Math.floor(Math.random()*4);
			}
		}
	
		// Quantity of images
		if (delay <= 0) {
			visualizerObjects[String(objectId)] = new VisualizerObject(`dist${dist}-${note}`);
			objectId++;
			delay = 20 - settings["micSensitivity"]*20;
		}
		console.log(delay);
	}

	for (let key of Object.keys(visualizerObjects)) {
		visualizerObjects[key].drawImage();
		if (visualizerObjects[key].lifespan <= 0) {
			delete visualizerObjects[key];
		}
	}
}

// Pitch detection
let noteFrequencies = {
	low: 493.883/8,

	c2: 261.63/4,
	csharp2: 277.183/4,
	d2: 293.665/4,
	eflat2: 311.127/4,
	e2: 329.628/4,
	f2: 349.228/4,
	fsharp2: 369.994/4,
	g2: 391.995/4,
	gsharp2: 415.305/4,
	a2: 440/4,
	bflat2: 466.164/4,
	b2: 493.883/4,

	c3: 261.63/2,
	csharp3: 277.183/2,
	d3: 293.665/2,
	eflat3: 311.127/2,
	e3: 329.628/2,
	f3: 349.228/2,
	fsharp3: 369.994/2,
	g3: 391.995/2,
	gsharp3: 415.305/2,
	a3: 440/2,
	bflat3: 466.164/2,
	b3: 493.883/2,

	c4: 261.63,
	csharp4: 277.183,
	d4: 293.665,
	eflat4: 311.127,
	e4: 329.628,
	f4: 349.228,
	fsharp4: 369.994,
	g4: 391.995,
	gsharp4: 415.305,
	a4: 440,
	bflat4: 466.164,
	b4: 493.883,

	c5: 261.63*2,
	csharp5: 277.183*2,
	d5: 293.665*2,
	eflat5: 311.127*2,
	e5: 329.628*2,
	f5: 349.228*2,
	fsharp5: 369.994*2,
	g5: 391.995*2,
	gsharp5: 415.305*2,
	a5: 440*2,
	bflat5: 466.164*2,
	b5: 493.883*2,

	c6: 261.63*4,
	csharp6: 277.183*4,
	d6: 293.665*4,
	eflat6: 311.127*4,
	e6: 329.628*4,
	f6: 349.228*4,
	fsharp6: 369.994*4,
	g6: 391.995*4,
	gsharp6: 415.305*4,
	a6: 440*4,
	bflat6: 466.164*4,
	b6: 493.883*4,

	high: 261.63*8
}
function startPitch() {
	pitch = ml5.pitchDetection('pitchmodel/', audioContext , mic.stream, getPitch);
}
function getPitch() {
	pitch.getPitch(function(err, frequency) {
		if (frequency) {
			activeNote = detectNote(frequency);
		} else {
			activeNote = "unknown";
		}
		console.log(activeNote);
		getPitch();
	})
}
// Detect closest note to frequency
function detectNote(freq) {
	let keys = Object.keys(noteFrequencies);
	console.log(freq);
	for (let i=0; i<keys.length; i++) {
		if (freq < noteFrequencies[keys[i]]) {
			if (i == 0) {
				console.log(keys[i])
				return keys[i];
			}
			if (noteFrequencies[keys[i]]-freq > freq-noteFrequencies[keys[i-1]]) {
				console.log(keys[i-1])
				return keys[i-1];
			} else {
				console.log(keys[i])
				return keys[i];
			}
		}
	}
	return "high";
}

// Variable type
let variableType = document.querySelectorAll(".variable-type");
for (let type of variableType) {
	let temp = "";
	for (let char of type.innerText) {
		temp += `<span class="variable-type-char" style="animation-duration:${Math.random()+1}s">${char}</span>`;
	}
	type.innerHTML = temp;
}

// Info in and out
let body = document.querySelector("body");
let info = document.querySelector(".info");
function openInfo() {
	body.style.overflow = "hidden";
	info.style.transform = "translateY(0%)";
	info.scrollTop = 0;
}
function closeInfo() {
	body.style.overflow = "unset";
	info.style.transform = "translateY(100%)";
}

// Slider functions
let sliders = document.querySelectorAll(".controls-slider");
for (let slider of sliders) {
	slider.addEventListener("mousedown", (e) => {
		sliderActivate(e, slider, slider.dataset.setting);
	})
}
function sliderActivate(e, slider, setting) {
	sliderOffsets = slider.getBoundingClientRect();
	let sliderHandle = slider.querySelector(".controls-slider-handle");
	sliderAdjust(e);
	document.addEventListener("mousemove", sliderAdjust);
	document.addEventListener("mouseup", sliderDeactivate);

	function sliderAdjust(e) {
		let value = (e.clientY-sliderOffsets.top)/(sliderOffsets.bottom - sliderOffsets.top);
		if (value < 0) {
			value = 0;
		} else if (value > 1) {
			value = 1;
		}
		sliderHandle.style.top = `${value*100}%`;
		settings[setting] = value;
	}

	function sliderDeactivate() {
		document.removeEventListener("mousemove", sliderAdjust);
		document.removeEventListener("mouseup", sliderDeactivate);
	}
}

// Button functions
function resetSettings() {
	settings = {
		imageHue: .5,
		backgroundBrightness: .5,
		backgroundColor: .5,
		micSensitivity: .5,
		imageDistortion: .5,
		imageScale: .5
	}
	for (let slider of sliders) {
		slider.querySelector(".controls-slider-handle").style.top = `50%`;
	}
}
let micState = true;
function toggleMute() {
	if (micState) {
		mic.stop();
		micState = false;
	} else {
		mic.start(startPitch);
		micState = true;
	}
}
function downloadScreenshot() {
	const date = new Date();
	saveCanvas(canvas, 'audioflo ' + date.toLocaleString(), 'jpg');
}

// Generate and animate background elements
let backgroundContainer = document.querySelector(".background");
function backgroundAnimation() {
	let backgroundElement = document.createElement("img");
	backgroundElement.src = `assets/background/background${Math.floor(Math.random()*9+1)}.svg`

	let duration = Math.random()*10+5;
	let pos = [Math.random()*80-20, Math.random()*50-20];
	let rot = Math.random()*360;
	backgroundElement.style.width = Math.random()*30+30 + "vw";
	backgroundElement.style.transition = `transform ${duration*2}s, opacity 3s`;
	backgroundElement.style.transform = `scale(${Math.random()+.7}) translate(${pos[0]}vw, ${pos[1]}vh) rotate(${rot}deg)`;
	backgroundElement.style.opacity = 0;

	backgroundContainer.appendChild(backgroundElement);

	setTimeout(() => {
		backgroundElement.style.opacity = 1;
		backgroundElement.style.transform = `scale(1) translate(${pos[0]+Math.random()*20-10}vw, ${pos[1]+Math.random()*20-10}vh) rotate(${rot+Math.random()*60-30}deg)`;

		setTimeout(() => {
			backgroundElement.style.opacity = 0;

			setTimeout(() => {
				backgroundElement.remove();
			}, 4000)

		}, duration*1000+1000)

	}, 50)

	setTimeout(() => {
		backgroundAnimation();
	}, Math.random()*4000+2000)
}
backgroundAnimation();

// Pause if user leaves page
document.addEventListener("visibilitychange", (event) => {
	if (document.visibilityState == "visible") {
		loop();
	} else {
		noLoop();
	}
  });