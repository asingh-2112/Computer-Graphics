// Main application
let selectedModel = null;
let gl, canvas, shaderProgram;

document.addEventListener('DOMContentLoaded', async () => {
  canvas = document.getElementById('glcanvas');
  gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
      alert('WebGL not supported');
      return;
  }

  // Initialize systems
  shaderProgram = shaders.initShaderProgram(gl);
  camera.init(canvas);
  path.init(gl);

  // Initialize axes
  axes.init(gl);

  // Load models
  await Promise.all(models.map(model => model.load(gl)));

  // Set up event listeners
  setupEventListeners(canvas);

  // Main render loop
  function render() {
      gl.clearColor(0.9, 0.9, 0.9, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);

      // Update camera
      camera.update(canvas);

      // Set shader program and matrices
      gl.useProgram(shaderProgram.program);
      gl.uniformMatrix4fv(shaderProgram.uniformLocations.projectionMatrix, false, camera.projMatrix);
      gl.uniformMatrix4fv(shaderProgram.uniformLocations.viewMatrix, false, camera.viewMatrix);
      gl.uniform3fv(shaderProgram.uniformLocations.lightPosition, [5, 5, 5]);

      // Draw axes (before other objects so they appear behind)
      axes.draw(gl, shaderProgram);

      // Draw path if points exist
      if (path.points.length > 0) {
          drawPath(gl, shaderProgram);
      }

      // Draw models
      drawModels(gl, shaderProgram);

      requestAnimationFrame(render);
  }

  // Start rendering
  render();
});

function setupEventListeners(canvas) {
  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (!selectedModel) return;

    const rotationSpeed = 0.1;
    const scaleSpeed = 0.1;

    switch (e.key.toLowerCase()) {
      case 'c':
        camera.toggleMode();
        break;
      case ' ':
        if (selectedModel && path.points.length === 3) {
          const coeffs = path.computeQuadraticCoeffs(path.points[0], path.points[1], path.points[2]);
          selectedModel.path = {
            coeffs: coeffs,
            t: 0.0,
            speed: 0.01
          };
          path.generateCurve(coeffs);
        }
        break;
      case 'x':
        quat.rotateX(selectedModel.rotation, selectedModel.rotation, rotationSpeed);
        break;
      case 'y':
        quat.rotateY(selectedModel.rotation, selectedModel.rotation, rotationSpeed);
        break;
      case 'z':
        quat.rotateZ(selectedModel.rotation, selectedModel.rotation, rotationSpeed);
        break;
      case 's':
        if (e.shiftKey) {
          // Scale down
          vec3.scale(selectedModel.scale, selectedModel.scale, 1 - scaleSpeed);
        } else {
          // Scale up
          vec3.scale(selectedModel.scale, selectedModel.scale, 1 + scaleSpeed);
        }
        break;
      case 'arrowup':
        if (selectedModel.path) selectedModel.path.speed += 0.005;
        break;
      case 'arrowdown':
        if (selectedModel.path) selectedModel.path.speed = Math.max(0.001, selectedModel.path.speed - 0.005);
        break;
      case 'delete':
      case 'backspace':
        if (selectedModel) {
          selectedModel.isSelected = false;
          selectedModel = null;
        }
        break;
    }
  });

  // Mouse controls
  canvas.addEventListener('mousedown', (e) => {
    if (camera.mode === 1) { // Only in Top View
      if (e.shiftKey) {
        // Add path point when Shift is held
        const worldPos = camera.screenToWorld(e.clientX, e.clientY);
        if (path.addPoint(worldPos)) {
          if (path.points.length === 3) {
            const coeffs = path.computeQuadraticCoeffs(path.points[0], path.points[1], path.points[2]);
            path.generateCurve(coeffs);
          }
        }
      } else {
        // Select model
        selectModel(gl, canvas, e.clientX, e.clientY);
      }
    }
  });
}

function selectModel(gl, canvas, mouseX, mouseY) {
  // Clear previous selection
  models.forEach(model => model.isSelected = false);
  selectedModel = null;

  // Create a framebuffer for picking
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  // Create a texture to store the ID information
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

  // Create a renderbuffer for depth testing
  const depthBuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, canvas.width, canvas.height);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

  // Check framebuffer status
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    console.error('Framebuffer is incomplete');
    return;
  }

  // Render models with unique colors for picking
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Use a simple shader for picking
  const pickingProgram = createPickingShaderProgram(gl);
  gl.useProgram(pickingProgram.program);

  // Set up matrices (same as regular rendering)
  gl.uniformMatrix4fv(pickingProgram.uniformLocations.projectionMatrix, false, camera.projMatrix);
  gl.uniformMatrix4fv(pickingProgram.uniformLocations.viewMatrix, false, camera.viewMatrix);

  // Draw models with unique colors
  models.forEach((model, index) => {
    const modelMatrix = model.getModelMatrix();
    gl.uniformMatrix4fv(pickingProgram.uniformLocations.modelMatrix, false, modelMatrix);

    // Convert index to color (1-based)
    const id = index + 1;
    const r = ((id >> 0) & 0xFF) / 255;
    const g = ((id >> 8) & 0xFF) / 255;
    const b = ((id >> 16) & 0xFF) / 255;
    gl.uniform4f(pickingProgram.uniformLocations.objectId, r, g, b, 1.0);

    // Draw the model
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
    gl.vertexAttribPointer(pickingProgram.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(pickingProgram.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.drawElements(gl.TRIANGLES, model.indexCount, gl.UNSIGNED_SHORT, 0);
  });

  // Read the pixel under the mouse
  const pixelX = mouseX * canvas.width / canvas.clientWidth;
  const pixelY = canvas.height - (mouseY * canvas.height / canvas.clientHeight) - 1;
  const pixel = new Uint8Array(4);
  gl.readPixels(pixelX, pixelY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

  // Clean up
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.deleteTexture(texture);
  gl.deleteRenderbuffer(depthBuffer);
  gl.deleteFramebuffer(framebuffer);

  const id = pixel[0] + (pixel[1] << 8) + (pixel[2] << 16);
    if (id > 0 && id <= models.length) {
        // Clear previous selection
        models.forEach(model => model.isSelected = false);
        
        // Get clicked model
        selectedModel = models[id - 1];
        selectedModel.isSelected = true;
        
        // Change the model's color
        selectedModel.cycleColor();
    }

}

function createPickingShaderProgram(gl) {
  const vsSource = `
        attribute vec3 aVertexPosition;
        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;
        
        void main(void) {
            gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
        }
    `;

  const fsSource = `
        precision highp float;
        uniform vec4 uObjectId;
        
        void main(void) {
            gl_FragColor = uObjectId;
        }
    `;

  const vertexShader = shaders.loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = shaders.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  return {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
      modelMatrix: gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
      objectId: gl.getUniformLocation(shaderProgram, 'uObjectId'),
    },
  };
}

function drawAxes(gl, shaderProgram) {
  if (!axesSystem.vertexBuffer) return;

  const modelMatrix = mat4.create();
  const normalMatrix = mat3.create();

  gl.uniformMatrix4fv(shaderProgram.uniformLocations.modelMatrix, false, modelMatrix);
  gl.uniformMatrix3fv(shaderProgram.uniformLocations.normalMatrix, false, normalMatrix);
  gl.uniform4fv(shaderProgram.uniformLocations.vertexColor, [1, 1, 1, 1]);

  gl.bindBuffer(gl.ARRAY_BUFFER, axesSystem.vertexBuffer);
  gl.vertexAttribPointer(shaderProgram.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(shaderProgram.attribLocations.vertexPosition);

  gl.bindBuffer(gl.ARRAY_BUFFER, axesSystem.colorBuffer);
  gl.vertexAttribPointer(shaderProgram.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(shaderProgram.attribLocations.vertexColor);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, axesSystem.indexBuffer);
  gl.drawElements(gl.LINES, axesSystem.indexCount, gl.UNSIGNED_SHORT, 0);
}

function drawPath(gl, shaderProgram) {
  // Draw path points
  path.points.forEach((point, i) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, path.pointBuffers[i]);
    gl.vertexAttribPointer(shaderProgram.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderProgram.attribLocations.vertexPosition);

    const color = [0, 0, 0, 1]; // Black points
    gl.uniform4fv(shaderProgram.uniformLocations.vertexColor, color);

    // Simple point rendering - would need to create proper geometry for better visualization
    gl.drawArrays(gl.POINTS, 0, 1);
  });

  // Draw curve
  if (path.curveVertices.length > 0) {
    gl.bindBuffer(gl.ARRAY_BUFFER, path.curveBuffer);
    gl.vertexAttribPointer(shaderProgram.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderProgram.attribLocations.vertexPosition);

    const color = [0, 0.5, 1, 1]; // Blue curve
    gl.uniform4fv(shaderProgram.uniformLocations.vertexColor, color);

    gl.drawArrays(gl.LINE_STRIP, 0, path.curveVertices.length / 3);
  }
}

function drawModels(gl, shaderProgram) {
  models.forEach(model => {
    // Update model position if moving along path
    if (model.path) {
      model.path.t += model.path.speed;
      if (model.path.t >= 1.0) {
        model.position = path.evaluateQuadratic(model.path.coeffs, 1.0);
        model.path = null;
        if (selectedModel === model) {
          selectedModel = null;
        }
        path.clear();
      } else {
        model.position = path.evaluateQuadratic(model.path.coeffs, model.path.t);
      }
    }
    // Bind color buffer
    // Bind color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
    gl.vertexAttribPointer(
        shaderProgram.attribLocations.vertexColor,
        4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderProgram.attribLocations.vertexColor);

    // Draw model
    const modelMatrix = model.getModelMatrix();
    const normalMatrix = model.getNormalMatrix(modelMatrix);

    gl.uniformMatrix4fv(shaderProgram.uniformLocations.modelMatrix, false, modelMatrix);
    gl.uniformMatrix3fv(shaderProgram.uniformLocations.normalMatrix, false, normalMatrix);

    // Use highlight color if selected
    const color = model.isSelected ? model.highlightColor : model.color;
    gl.uniform4fv(shaderProgram.uniformLocations.vertexColor, color);

    // Bind buffers and draw
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
    gl.vertexAttribPointer(shaderProgram.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderProgram.attribLocations.vertexPosition);

    if (model.normalBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
      gl.vertexAttribPointer(shaderProgram.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(shaderProgram.attribLocations.vertexNormal);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.drawElements(gl.TRIANGLES, model.indexCount, gl.UNSIGNED_SHORT, 0);
  });
}