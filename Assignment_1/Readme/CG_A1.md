
File: `index.html`

- DOCTYPE and HTML Structure: Defines the document type and the main structure of the HTML document.
  
- Head Section: Contains meta tags, the title of the document, and CSS styles for layout and design.
  
- Body Section: Includes the following main components:
  - `div#shape-id-display`: Displays the currently selected shape.
  - `button#clear-canvas-button`: A button to clear the canvas.
  - `input#color-picker`: A color input for changing the color of the selected shape.
  - `div#controls`: Contains buttons to hide/show the cursor and enable/disable cursor interaction.
  - `canvas#webgl-canvas`: The WebGL rendering area.

- JavaScript Section: Contains the logic for:
  - Initializing WebGL and handling canvas resizing.
  - Managing shape drawing, selection, and manipulation.
  - Implementing the ear clipping triangulation algorithm.
  - Handling user interactions through mouse clicks and keyboard events.

## How to Compile and Run

This project does not require any compilation. To run the application, follow these steps:

1. Clone or Download the Repository: If the code is hosted on a platform like GitHub, clone or download it to your local machine.

   git clone <https://github.com/asingh-2112/Computer-Graphics/tree/main/Assignment%201>
Open the HTML File: Open the index.html file in a modern web browser. You can do this by double-clicking the file or dragging it into the browser window.

Interact with the Application:

Click on the canvas to draw shapes.
Select a shape by clicking on it.
Use the color picker to change the color of the selected shape.
Use the keyboard (Arrow keys, +, -, r, R, b, f, A, 0-9) for various shape manipulations.
Keyboard / Mouse Controls
 • Arrow Keys: Move selected shape.
 • + /-: Scale shape up/down.
 • r / R: Rotate clockwise/counterclockwise.
 • b / f: Change shape rendering order.
 • c: Cycle through colors.
 • Mouse Click: Selects or adds points to a shape.
 • Hide Cursor Button: Toggles cursor visibility.
 • Disable Cursor Button: Prevents interaction
Dependencies
This project utilizes WebGL for rendering graphics. It is compatible with most modern web browsers that support WebGL.