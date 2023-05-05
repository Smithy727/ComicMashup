let mainCanvas;
let canvases;
let currentCanvas;
let colorWheel;
let brushSizeSlider;
let brushStyleDropdown;
let clearButton;
let panelButtons;
let saveButton;
let savedImages = [];

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtpDH0lCKQM7g625GZfLOHhwbYkjW-c6E",
  authDomain: "comicmashup.firebaseapp.com",
  projectId: "comicmashup",
  storageBucket: "comicmashup.appspot.com",
  messagingSenderId: "261645427354",
  appId: "1:261645427354:web:29f07394cdfe8188f03523"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

function setup() {
  mainCanvas = createCanvas(800, 800);
  mainCanvas.parent("canvasContainer");
  background(255);

  canvases = [    createGraphics(800, 800),    createGraphics(800, 800),    createGraphics(800, 800),  ];
  currentCanvas = 0;
  canvases.forEach((canvas) => {
    canvas.background(255);
  });

  colorWheel = createColorPicker("#000000");
  brushSizeSlider = createSlider(1, 50, 10);
  brushSizeSlider.style("width", "150px");

  brushStyleDropdown = createSelect();
  brushStyleDropdown.option("normal");
  brushStyleDropdown.option("watercolor");

  clearButton = createButton("Clear");
  clearButton.mousePressed(clearCanvas);

  saveButton = createButton("Save");
  saveButton.mousePressed(savePanel);

  panelButtons = [];
  for (let i = 0; i < 3; i++) {
    const button = createButton(`Panel ${i + 1}`);
    button.mousePressed(() => switchCanvas(i));
    panelButtons.push(button);
  }

  const menu = select("#menu");
  menu.child(colorWheel);
  menu.child(brushSizeSlider);
  menu.child(brushStyleDropdown);
  menu.child(clearButton);
  menu.child(saveButton);
  panelButtons.forEach((button) => menu.child(button));
}

function draw() {
  background(255);
  image(canvases[currentCanvas], 0, 0);

  if (mouseIsPressed) {
    if (mouseButton === LEFT) {
      const brushStyle = brushStyleDropdown.value();
      if (brushStyle === "normal") {
        drawNormalBrush(canvases[currentCanvas]);
      } else if (brushStyle === "watercolor") {
        drawWatercolorBrush(canvases[currentCanvas]);
      }
    }
  }
}


function drawNormalBrush(canvas) {
  canvas.stroke(colorWheel.color());
  canvas.strokeWeight(brushSizeSlider.value());
  canvas.line(pmouseX, pmouseY, mouseX, mouseY);
}

function drawWatercolorBrush(canvas) {
  const brushSize = brushSizeSlider.value();
  const numLayers = 15;
  const layerSpread = 1.5;
  const baseColor = colorWheel.color();

  for (let i = 0; i < numLayers; i++) {
    const layerSize = brushSize * (1 + layerSpread * (i / numLayers));
    const layerAlpha = map(i, 0, numLayers - 1, 255, 0);
    const layerColor = color(
      red(baseColor),
      green(baseColor),
      blue(baseColor),
      layerAlpha
    );

    canvas.stroke(layerColor);
    canvas.strokeWeight(layerSize);
    canvas.line(pmouseX, pmouseY, mouseX, mouseY);
  }
}

const clearCanvas = () => {
  canvases[currentCanvas].background(255);
};

function switchCanvas(index) {
  currentCanvas = index;
}

function savePanel() {
  const savedCanvas = mainCanvas.canvas.toDataURL("image/png");
  savedImages.push({ src: savedCanvas });
  saveToFirebase(savedCanvas);
}

function saveToFirebase(savedCanvas) {
  var storageRef = firebase.storage().ref();
  var filename = "canvas_" + Date.now() + ".png";
  var canvasRef = storageRef.child(filename);
  fetch(savedCanvas)
    .then(res => res.blob())
    .then(blob => {
      canvasRef.put(blob).then(function(snapshot) {
        console.log('Uploaded a blob or file!');
        // Add image to gallery
        canvasRef.getDownloadURL().then(function(url) {
          var img = document.createElement('img');
          img.src = url;
          var galleryContainer = document.getElementById('gallery');
          if (galleryContainer) {
            galleryContainer.appendChild(img);
          } else {
            console.error("Element with ID 'gallery' not found");
          }
        });
      });
    });
}


var storageRef = firebase.storage().ref();
storageRef.listAll().then(function(result) {
  result.items.forEach(function(imageRef) {
    imageRef.getDownloadURL().then(function(url) {
      // Add image to gallery
      var img = document.createElement('img');
      img.src = url;
      document.getElementById('gallery').appendChild(img);
    });
  });
});


