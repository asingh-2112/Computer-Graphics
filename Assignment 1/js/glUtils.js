// glUtils.js

// Vertex and fragment shader source code
const vertexShaderSource = `
  attribute vec2 coordinates;
  void main(void) {
      gl_Position = vec4(coordinates, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform vec4 uColor;
  void main(void) {
      gl_FragColor = uColor;
  }
`;

// Create a shader, compile it, and check for errors.
function createShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

// Initialize the shader program.
function initShaderProgram() {
  const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error("Shader program failed to link:", gl.getProgramInfoLog(shaderProgram));
    return null;
  }
  gl.useProgram(shaderProgram);
  return shaderProgram;
}

// Draw a smooth line through the given points.
function drawSmoothLines(points) {
  if (points.length < 2) return;
  const vertices = points.flatMap(point => [point.x, point.y]);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  gl.useProgram(shaderProgram);
  gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
  gl.uniform4f(colorUniform, 1.0, 1.0, 1.0, 1.0);
  gl.drawArrays(gl.LINE_STRIP, 0, vertices.length / 2);
}

// Draw each triangle with the provided color.
function drawTriangles(triangles, color) {
  triangles.forEach(triangle => {
    const vertices = triangle.flatMap(point => [point.x, point.y]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.useProgram(shaderProgram);
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(colorUniform, color);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
  });
}

// Draw a small yellow star at (x, y)
function drawStar(x, y) {
  const starVertices = new Float32Array([
    0.0,  0.03,  0.015, 0.01,  0.03, 0.01,
    0.0175, -0.0035,  0.025, -0.025,  0.0, -0.01,
    -0.025, -0.025,  -0.0175, -0.0035,  -0.03,  0.01,
    -0.015, 0.01,  0.0,  0.03
  ]).map((v, i) => v + (i % 2 === 0 ? x : y));

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, starVertices, gl.STATIC_DRAW);

  gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
  gl.uniform4fv(colorUniform, [1.0, 1.0, 0.0, 1.0]); // Yellow color
  gl.drawArrays(gl.TRIANGLE_FAN, 0, starVertices.length / 2);
}

// Stub for text drawing – implementation depends on your chosen method.
function drawText(text, x, y) {
  console.log("Draw text:", text, "at", x, y);
}
