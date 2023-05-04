

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

  
  setup = function () {
    mainCanvas = createCanvas(800, 800);
    mainCanvas.parent("canvasContainer");
    background(255);
  
    canvases = [
      createGraphics(800, 800),
      createGraphics(800, 800),
      createGraphics(800, 800),
    ];
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
  };
  
  draw = function () {
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
  };
  
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
  // Save the canvas image and add it to the saved images array
  function savePanel() {
    const savedCanvas = mainCanvas.canvas.toDataURL("image/png");
    savedImages.push({ src: savedCanvas });
    
  }
  