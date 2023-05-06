let mainCanvas;
let currentCanvas;
let colorWheel;
let brushSizeSlider;
let brushStyleDropdown;
let clearButton;
let saveButton;
let undoButton;
let savedImages = [];
let canvasHistory = [];

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
const firebaseApp = firebase.initializeApp(firebaseConfig);

function setup() {
  mainCanvas = createCanvas(800, 800);
  mainCanvas.parent("canvasContainer");
  background(255);

  currentCanvas = createGraphics(800, 800);
  currentCanvas.background(255);
  undoButton = createButton("Undo");
  undoButton.mousePressed(undoLastBrushStroke);

  colorWheel = createColorPicker("#000000");
  brushSizeSlider = createSlider(1, 50, 10);
  brushSizeSlider.style("width", "150px");

  brushStyleDropdown = createSelect();
  brushStyleDropdown.option("normal");
  brushStyleDropdown.option("watercolor");

  clearButton = createButton("Clear");
  clearButton.mousePressed(clearCanvas);

  saveButton = createButton("Upload");
  saveButton.mousePressed(savePanel);

  const menu = select("#menu");
  menu.child(colorWheel);
  menu.child(brushSizeSlider);
  menu.child(brushStyleDropdown);
  menu.child(clearButton);
  menu.child(saveButton);
  menu.child(undoButton);

  window.onload = function() {
    displayImagesFromFirebase();
  };
  
}

// The rest of the code remains the same.

function displayImagesFromFirebase() {
  const storageRef = firebase.storage().ref();

  let imageUrls = [];
res.items.forEach((imageRef) => {
  imageRef.getDownloadURL().then((url) => {
    imageUrls.push(url);
    if (imageUrls.length === res.items.length) {
      // All image URLs have been loaded, so display them in order
      displayImagesInOrder(imageUrls);
    }
  });
});
function displayImagesInOrder(imageUrls) {
  for (let i = 0; i < imageUrls.length; i++) {
    const container = document.createElement("div");
    container.className = "panel-image-container";

    const img = document.createElement("img");
    img.src = imageUrls[i];
    img.alt = `Example ${i + 1}`;

    container.appendChild(img);

    const panelImageContainer = document.getElementById(`panel-image-container-${i}`);
    panelImageContainer.appendChild(container);
  }
}



  storageRef.listAll().then((res) => {
    res.items.forEach((imageRef, index) => {
      imageRef.getDownloadURL().then((url) => {
        // Create a container element for the image
        const container = document.createElement("div");
        container.className = "panel-image-container";

        // Create an image element
        const img = document.createElement("img");
        img.src = url;
        img.alt = `Example ${index + 1}`;

        // Append the image to the container element
        container.appendChild(img);

        // Append the container to the corresponding panel-image-container
        const panelImageContainer = document.getElementById(`panel-image-container-${index}`);
        panelImageContainer.appendChild(container);
      });
    });
  });
}


function draw() {
  mainCanvas.canvas.style.maxWidth = "100%";

  background(255);
  image(currentCanvas, 0, 0);

  if (mouseIsPressed) {
    if (mouseButton === LEFT) {
      if (!canvasHistory[currentCanvas]) {
        canvasHistory[currentCanvas] = [];
      }
      const brushStyle = brushStyleDropdown.value();
      if (brushStyle === "normal") {
        drawNormalBrush(currentCanvas);
      } else if (brushStyle === "watercolor") {
        drawWatercolorBrush(currentCanvas);
      }
    }
  }
}

function mousePressed() {
  if (mouseButton === LEFT) {
    if (!canvasHistory[currentCanvas]) {
      canvasHistory[currentCanvas] = [];
    }
    canvasHistory[currentCanvas].push(currentCanvas.get());
  }
}

function mouseReleased() {
  if (mouseButton === LEFT) {
    canvasHistory[currentCanvas].push(currentCanvas.get());
  }
}

function undoLastBrushStroke() {
  if (canvasHistory[currentCanvas] && canvasHistory[currentCanvas].length > 0) {
    canvasHistory[currentCanvas].pop();
    if (canvasHistory[currentCanvas].length > 0) {
      currentCanvas.image(canvasHistory[currentCanvas][canvasHistory[currentCanvas].length - 1], 0, 0);
    } else {
      clearCanvas();
    }
  }
}

const clearCanvas = () => {
  currentCanvas.clear();
  currentCanvas.background(255);
};

function drawNormalBrush() {
  currentCanvas.stroke(colorWheel.color());
  currentCanvas.strokeWeight(brushSizeSlider.value());
  currentCanvas.line(pmouseX, pmouseY, mouseX, mouseY);
}


function drawWatercolorBrush() {
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

    canvases[currentCanvas].stroke(layerColor);
    canvases[currentCanvas].strokeWeight(layerSize);
    canvases[currentCanvas].line(pmouseX, pmouseY, mouseX, mouseY);
  }
}





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
          location.reload(); // Reload the page after the image is saved
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
      document.getElementById('panel-image-container').appendChild(img);
    });
  });
});
