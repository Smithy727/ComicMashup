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

  document.addEventListener("DOMContentLoaded", displayImagesFromFirebase);
  const randomImageHeader = select("#randomImageContainer h2");
  randomImageHeader.mouseClicked(setRandomImage);
  
  
}

async function displayImagesFromFirebase() {
  const storageRef = firebase.storage().ref();

  const res = await storageRef.listAll();
  const metadataPromises = res.items.map(async (imageRef) => {
    const metadata = await imageRef.getMetadata();
    console.log(metadata.timeCreated); // log the timestamp for debugging
    const downloadUrl = await imageRef.getDownloadURL();
    return {
      metadata,
      downloadUrl,
    };
  });

  const imageData = await Promise.all(metadataPromises);
  imageData.sort((a, b) => {
    const aTime = parseInt(a.metadata.customMetadata.timestamp);
    const bTime = parseInt(b.metadata.customMetadata.timestamp);
    return aTime - bTime; // sort in chronological order (oldest first)
  });

  imageData.forEach(({ downloadUrl }, index) => {
    const container = document.createElement("div");
    container.className = "panel-image-container";
    container.id = `panel-image-container-${index}`;

    const img = document.createElement("img");
    img.src = downloadUrl;
    img.alt = `Example ${index + 1}`;

    container.appendChild(img);

    const panelImageGrid = document.querySelector("#panel-image-grid .panel-image-grid");
    panelImageGrid.appendChild(container);
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
  var timestamp = Date.now().toString();
  var filename = "canvas_" + timestamp + ".png";
  var canvasRef = storageRef.child(filename);
  fetch(savedCanvas)
    .then(res => res.blob())
    .then(blob => {
      // Add a timestamp to the metadata
      const metadata = {
        customMetadata: {
          timestamp: timestamp
        }
      };
      canvasRef.put(blob, metadata).then(function(snapshot) {
        console.log('Uploaded a blob or file!');
        // Add image to gallery
        canvasRef.getDownloadURL().then(function(url) {
          var img = document.createElement('img');
          img.src = url;
          var galleryContainer = document.getElementById('panel-image-grid');
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
function setRandomImage() {
  const images = [
    "images/CatInAForest.jpg",
    "images/Pikachu.jpg",
    "images/StickMan.jpg",
    "images/WinterLogCabin.jpg",
    "images/AScaryForest.jpg",
    "images/HouseOnFire.jpg",
    "images/superHero3.jpg",
    "images/superHero2.jpg",
    "images/superHero.jpg",
    "images/robot2.jpg",
    "images/robot1.jpg",
    "images/robot2.jpg",
    "images/random4.jpg",
    "images/random3.jpg",
    "images/random2.jpg",
    "images/random1.jpg",
    "images/pikachu2.png",
    "images/man.png",
    "images/happy.jpg",
    "images/animals.png",
    "images/comicbooktheme2.png",
    "images/comicbooktheme.png"
  ];

  const randomImage = images[Math.floor(Math.random() * images.length)];
  const imgElement = document.querySelector("#randomImageContainer img");
  imgElement.src = randomImage;
}

// Set a random image when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  setRandomImage();
  displayImagesFromFirebase();
});





