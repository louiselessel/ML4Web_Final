// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Pix2pix Edges2Pikachu example with p5.js using callback functions
This uses a pre-trained model on Pikachu images
For more models see: https://github.com/ml5js/ml5-data-and-training/tree/master/models/pix2pix
=== */

// The pre-trained model is trained on 256x256 images
// So the input images can only be 256x256 or 512x512, or multiple of 256
const SIZE = 256;
let inputImg, inputCanvas, outputContainer, statusMsg, pix2pix, clearBtn, transferBtn, modelReady = false, isTransfering = false;


let c_background ;
let c_wall ;
let c_door ;
let c_window ;
let c_windowSill ;
let c_windowHead ;
let c_shutter;
let c_balcony;
let c_trim ;
let c_cornice ;
let c_column ;
let c_entrance ;

let _c;
let offScreen;


let c_possibilities;
let objects;

let rectbool;

let _x, _y, _width, _height;


function setup() {
  //frameRate(30);
  //rectMode(CENTER);
  rectbool = false;
  offScreen = -256;

  objects = [];

  c_background = color(0,6,217);
  c_wall = color(13,61,251);
  c_door = color(165,0,0);
  c_window = color(0, 117, 255);
  c_windowSill = color(104, 248,152);
  c_windowHead = color(29,255,221);
  c_shutter = color(238,237,40);
  c_balcony = color(184,255,56);
  c_trim = color(255,146,4);
  c_cornice = color(255,68,1);
  c_column = color(246,0,1);
  c_entrance = color(0,201,255);
  _c = c_door;

  c_possibilities = [c_door, c_window, c_windowSill, c_windowHead, c_balcony, c_shutter, c_cornice, c_column, c_entrance];
  console.log(c_possibilities);

  c_backgrounds = [c_wall, c_trim];

  // Create a canvas
  inputCanvas = createCanvas(SIZE, SIZE);
  inputCanvas.class('border-box').parent('canvasContainer');

  // Display initial input image
  inputImg = loadImage('images/input.png', drawImage);

  // Selcect output div container
  outputContainer = select('#output');
  statusMsg = select('#status');

  // Select 'transfer' button html element
  transferBtn = select('#transferBtn');

  // Select 'clear' button html element
  clearBtn = select('#clearBtn');

  // Attach a mousePressed event to the 'clear' button
  clearBtn.mousePressed(function() {
    clearCanvas();
  });

  // Set stroke to black
  //stroke(0);
  noStroke();
  pixelDensity(1);

  // Create a pix2pix method with a pre-trained model
  pix2pix = ml5.pix2pix('models/facades_BtoA_sm.pict', modelLoaded);
}





function mouseClicked() {
  console.log("clicked");
  let obj = new facadeObject(_x, _y, _width, _height, _c);
  objects.push(obj);
  //console.log(obj);
  console.log(objects.length);
  rectbool = false;
  _c = random(c_possibilities);
}

function mouseDragged() {
  if (mouseIsPressed && !rectbool) {
    rectbool = true;
    console.log("drag");
    _x = mouseX;
    _y = mouseY;
  }
  _width = mouseX-_x;
  _height = mouseY-_y;
    //console.log("setting width height");
  }

// Draw on the canvas when mouse is pressed
function draw() {
  background(c_background);

  fill(_c);
  rect(0,0,20,20);

  if(mouseIsPressed) {
    fill(_c);
    rect(_x,_y,_width,_height);
  }


  for (var i = 0;  i < objects.length; i++) {
    objects[i].move();
    objects[i].display();

    //remove when off screen
    if (objects[i].x > width*2+5) {
      objects.splice(i, 1);
      console.log("removed one");
      console.log(objects.length);
    }
  }

  if(frameCount % 30 < 1) {
    if (!mouseIsPressed) {
      if (modelReady && !isTransfering) {
        transfer();
      }
    }
  }
  
}

// object class
class facadeObject {

  constructor(_x, _y, _width, _height, _color) {
    this.x = _x;
    this.y = _y; //random(height);
    this.width = _width;//random(10, 40);
    this.height = _height;//random(10, 40);
    this.speed = 0.1;
    this.c = _color;
    //console.log(this.c);
  }

  move() {
    this.x += this.speed;
  }

  display() {
    //fill(255,0,0);
    fill(this.c);
    //fill(c_entrance);
    rect(this.x, this.y, this.width, this.height);
  }
}


function keyPressed() {
  offScreen = 0;

  if (keyCode === LEFT_ARROW) {
    console.log("left button transfer");
    transfer();
  }
  if (keyCode === RIGHT_ARROW) {
    let obj = new facadeObject(offScreen, 10, width, height-10, c_wall);
    objects.push(obj);
  }
  if (keyCode === UP_ARROW) {
    let obj = new facadeObject(offScreen, random(10,height/2), width, 10, c_trim);
    objects.push(obj);
  }
}

// Whenever mouse is released, transfer the current image if the model is loaded and it's not in the process of another transformation
function mouseReleased() {
  if (modelReady && !isTransfering) {
    //transfer()
  }
}

// A function to be called when the models have loaded
function modelLoaded() {
  // Show 'Model Loaded!' message
  statusMsg.html('Model Loaded!');

  // Set modelReady to true
  modelReady = true;

  // Call transfer function after the model is loaded
  transfer();

  // Attach a mousePressed event to the transfer button
  transferBtn.mousePressed(function() {
    transfer();
  });
}

// Draw the input image to the canvas
function drawImage() {
  image(inputImg, 0, 0);
}

// Clear the canvas
function clearCanvas() {
  background(c_background);
  objects.splice(0,objects.length);
}

function transfer() {
  console.log("transfering");
  // Set isTransfering to true
  isTransfering = true;

  // Update status message
  statusMsg.html('Applying Style Transfer...!');

  // Select canvas DOM element
  const canvasElement = select('canvas').elt;

  // Apply pix2pix transformation
  pix2pix.transfer(canvasElement, function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result && result.src) {
      // Set isTransfering back to false
      isTransfering = false;
      // Clear output container
      outputContainer.html('');
      // Create an image based result
      createImg(result.src).class('outputImg').parent('output');
      // Show 'Done!' message
      statusMsg.html('Model is done loading.');
      //transfer();
    }
  });
}
