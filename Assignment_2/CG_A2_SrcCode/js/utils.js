// Utility functions
function createBuffer(gl, data, type = gl.ARRAY_BUFFER) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, new Float32Array(data), gl.STATIC_DRAW);
    return buffer;
  }
  
  function createIndexBuffer(gl, data) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
    return buffer;
  }
  
  function getScreenToWorldCoords(canvas, x, y, z = 0) {
    const rect = canvas.getBoundingClientRect();
    return [
      (x - rect.left - canvas.width/2) / 100,
      (canvas.height/2 - (y - rect.top)) / 100,
      z
    ];
  }