// eventHandlers.js

// Set up event listeners for canvas clicks, UI controls, and keyboard input.
function initEventHandlers() {
    canvas.addEventListener("click", (event) => {
      if (!cursorInteractionEnabled) return;
  
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / canvas.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / canvas.height) * 2 + 1;
  
      let clickedShapeIndex = getClickedShapeIndex(x, y);
      if (clickedShapeIndex !== -1) {
        if (selectedShapeIndex === clickedShapeIndex) {
          selectedShapeIndex = -1;
          shapeIdDisplay.textContent = "Selected Shape: None";
        } else {
          selectedShapeIndex = clickedShapeIndex;
          shapeIdDisplay.textContent = `Selected Shape: ${selectedShapeIndex}`;
        }
        starVisible = false;
      } else {
        pathPoints.push({ x, y });
        starVisible = true;
        starX = x;
        starY = y;
      }
      drawScene();
    });
  
    clearCanvasButton.addEventListener("click", () => {
      completedShapes = [];
      pathPoints = [];
      selectedShapeIndex = -1;
      allShapesSelected = false;
      starVisible = false;
      shapeIdDisplay.textContent = "Selected Shape: None";
      drawScene();
    });
  
    colorPicker.addEventListener("input", (event) => {
      if (selectedShapeIndex !== -1) {
        let color = hexToRgb(event.target.value);
        completedShapes[selectedShapeIndex].color = [color.r / 255, color.g / 255, color.b / 255, 1.0];
        drawScene();
      }
    });
  
    toggleCursorButton.addEventListener("click", () => {
      cursorVisible = !cursorVisible;
      canvas.style.cursor = cursorVisible ? "default" : "none";
      toggleCursorButton.textContent = cursorVisible ? "Hide Cursor" : "Show Cursor";
    });
  
    toggleCursorInteractionButton.addEventListener("click", () => {
      cursorInteractionEnabled = !cursorInteractionEnabled;
      toggleCursorInteractionButton.textContent = cursorInteractionEnabled ? "Disable Cursor" : "Enable Cursor";
    });
  
    document.addEventListener("keydown", (event) => {
      if (event.key === "a" || event.key === "A") {
        allShapesSelected = !allShapesSelected;
        selectedShapeIndex = -1;
        shapeIdDisplay.textContent = allShapesSelected ? "All Shapes Selected" : "Selected Shape: None";
        drawScene();
      }
  
      if (event.key >= "0" && event.key <= "9") {
        let shapeId = parseInt(event.key);
        if (shapeId < completedShapes.length) {
          selectedShapeIndex = shapeId;
          allShapesSelected = false;
          shapeIdDisplay.textContent = `Selected Shape: ${selectedShapeIndex}`;
          drawScene();
        }
      }
  
      // When the "F" key is pressed, either finalize a new shape from path points or adjust z-index.
      if (event.key === "f" || event.key === "F") {
        if (pathPoints.length >= 3) {
          let newColor = getRandomColor();
          const triangles = earClippingTriangulation(pathPoints);
          if (triangles.length > 0) {
            let zIndex = completedShapes.length > 0
              ? Math.max(...completedShapes.map(s => s.zIndex)) + 1
              : 0;
            completedShapes.push({ triangles, color: newColor, zIndex });
            pathPoints = [];
            starVisible = false;
          } else {
            console.error("Triangulation failed: No triangles generated.");
          }
        }
      }
  
      if (selectedShapeIndex !== -1 || allShapesSelected) {
        let shapesToTransform = allShapesSelected ? completedShapes : [completedShapes[selectedShapeIndex]];
        shapesToTransform.forEach(shape => {
          if (event.key === "ArrowUp") transformShape(shape, 0, 0.05, 1, 0);
          if (event.key === "ArrowDown") transformShape(shape, 0, -0.05, 1, 0);
          if (event.key === "ArrowLeft") transformShape(shape, -0.05, 0, 1, 0);
          if (event.key === "ArrowRight") transformShape(shape, 0.05, 0, 1, 0);
          if (event.key === "+") transformShape(shape, 0, 0, 1.1, 0);
          if (event.key === "-") transformShape(shape, 0, 0, 0.9, 0);
          if (event.key === "r") transformShape(shape, 0, 0, 1, 10);
          if (event.key === "R") transformShape(shape, 0, 0, 1, -10);
        });
      }
  
      if (selectedShapeIndex !== -1) {
        let shape = completedShapes[selectedShapeIndex];
        if (event.key === "b" || event.key === "B") {
          let currentZIndex = shape.zIndex;
          let nextShapeIndex = completedShapes.findIndex(s => s.zIndex === currentZIndex - 1);
          if (nextShapeIndex !== -1) {
            shape.zIndex = currentZIndex - 1;
            completedShapes[nextShapeIndex].zIndex = currentZIndex;
            selectedShapeIndex = nextShapeIndex;
          }
        }
        if (event.key === "f" || event.key === "F") {
          let currentZIndex = shape.zIndex;
          let prevShapeIndex = completedShapes.findIndex(s => s.zIndex === currentZIndex + 1);
          if (prevShapeIndex !== -1) {
            shape.zIndex = currentZIndex + 1;
            completedShapes[prevShapeIndex].zIndex = currentZIndex;
            selectedShapeIndex = prevShapeIndex;
          }
        }
      }
      drawScene();
    });
  }
  