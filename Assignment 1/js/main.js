// main.js

// Global variable declarations and initialization.
const canvas = document.getElementById("webgl-canvas");
const gl = canvas.getContext("webgl");
if (!gl) {
  alert("WebGL not supported!");
}

const shapeIdDisplay = document.getElementById("shape-id-display");
const clearCanvasButton = document.getElementById("clear-canvas-button");
const colorPicker = document.getElementById("color-picker");
const toggleCursorButton = document.getElementById("toggle-cursor");
const toggleCursorInteractionButton = document.getElementById("toggle-cursor-interaction");

let pathPoints = [];
let completedShapes = [];
let selectedShapeIndex = -1;
let allShapesSelected = false;
let starVisible = false;
let starX = 0, starY = 0;
let cursorVisible = true;
let cursorInteractionEnabled = true;

// Resize the canvas and update the viewport.
function resizeCanvas() {
  canvas.width = 800; // Fixed width
  canvas.height = 600; // Fixed height
  gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

gl.clearColor(0, 0, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

// Initialize shaders and get attribute/uniform locations.
const shaderProgram = initShaderProgram();
const coord = gl.getAttribLocation(shaderProgram, "coordinates");
const colorUniform = gl.getUniformLocation(shaderProgram, "uColor");
gl.enableVertexAttribArray(coord);

// Expose some globals to the other modules.
window.canvas = canvas;
window.gl = gl;
window.shaderProgram = shaderProgram;
window.coord = coord;
window.colorUniform = colorUniform;
window.pathPoints = pathPoints;
window.completedShapes = completedShapes;
window.selectedShapeIndex = selectedShapeIndex;
window.allShapesSelected = allShapesSelected;
window.starVisible = starVisible;
window.starX = starX;
window.starY = starY;
window.cursorInteractionEnabled = cursorInteractionEnabled;
window.shapeIdDisplay = shapeIdDisplay;
window.clearCanvasButton = clearCanvasButton;
window.colorPicker = colorPicker;
window.toggleCursorButton = toggleCursorButton;
window.toggleCursorInteractionButton = toggleCursorInteractionButton;

// A helper to check if a given (x, y) point is inside any shape.
function getClickedShapeIndex(x, y) {
  for (let i = 0; i < completedShapes.length; i++) {
    for (const triangle of completedShapes[i].triangles) {
      if (isPointInTriangle({ x, y }, triangle[0], triangle[1], triangle[2])) {
        return i;
      }
    }
  }
  return -1;
}
window.getClickedShapeIndex = getClickedShapeIndex;

// Redraw the entire scene.
function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Sort shapes by their z-index.
  completedShapes.sort((a, b) => a.zIndex - b.zIndex);
  completedShapes.forEach((shape, index) => {
    let color = (index === selectedShapeIndex || allShapesSelected)
      ? [1.0, 1.0, 1.0, 1.0]
      : shape.color;
    drawTriangles(shape.triangles, color);
  });

  drawSmoothLines(pathPoints);
  if (starVisible) {
    drawStar(starX, starY);
  }

  // Display the object count as text (using the stubbed drawText function).
  gl.useProgram(shaderProgram);
  gl.uniform4fv(colorUniform, [1.0, 1.0, 1.0, 1.0]);
  const text = `Objects: ${completedShapes.length}`;
  drawText(text, -0.9, -0.9);
}
window.drawScene = drawScene;

// Initialize event listeners.
initEventHandlers();

// Draw the initial scene.
drawScene();
