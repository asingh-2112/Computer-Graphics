// Camera controls
const camera = {
  mode: 1, // 1 = Top View, 2 = 3D View
  viewMatrix: mat4.create(),
  projMatrix: mat4.create(),
  rotation: quat.create(),
  lastMouseX: 0,
  lastMouseY: 0,
  mouseDown: false,
  distance: 10,
  minDistance: 2,
  maxDistance: 20,

  init(canvas) {
    this.canvas = canvas;

    // Mouse event listeners for camera control
    canvas.addEventListener('mousedown', (e) => {
      if (this.mode === 2) { // Only rotate in 3D view
        this.mouseDown = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      }
    });

    canvas.addEventListener('mouseup', () => {
      this.mouseDown = false;
    });

    canvas.addEventListener('mousemove', (e) => {
      if (this.mode === 2 && this.mouseDown) {
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;

        // Create rotation quaternions for x and y axes
        const deltaQuat = quat.create();
        quat.rotateY(deltaQuat, deltaQuat, dx * 0.01);
        quat.rotateX(deltaQuat, deltaQuat, dy * 0.01);

        // Apply rotation
        quat.multiply(this.rotation, deltaQuat, this.rotation);

        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      }
    });

    // Mouse wheel for zooming in/out
    canvas.addEventListener('wheel', (e) => {
      if (this.mode === 2) {
        e.preventDefault();
        this.distance = Math.min(this.maxDistance,
          Math.max(this.minDistance,
            this.distance - e.deltaY * 0.05));
      }
    });
  },

  toggleMode() {
    this.mode = this.mode === 1 ? 2 : 1;
    if (this.mode === 2) {
      // Reset rotation when switching to 3D view
      quat.identity(this.rotation);
      this.distance = 10;
    }
  },

  update(canvas) {
    const aspect = canvas.width / canvas.height;

    if (this.mode === 1) {
      // Top View - Orthographic projection
      const orthoSize = 5;
      mat4.ortho(this.projMatrix,
        -orthoSize * aspect, orthoSize * aspect,
        -orthoSize, orthoSize,
        0.1, 100);

      // Fixed view from top
      mat4.lookAt(this.viewMatrix,
        [0, 10, 0],  // Eye position (above the scene)
        [0, 0, 0],   // Look at center
        [0, 0, -1]); // Up vector (adjusted for proper orientation)
    } else {
      // 3D View - Perspective projection
      mat4.perspective(this.projMatrix,
        Math.PI / 4, // 45 degree field of view
        aspect,
        0.1,
        100);

      // Calculate camera position based on rotation and distance
      const cameraPos = [0, 0, this.distance];
      const target = [0, 0, 0];
      const up = [0, 1, 0];

      // Apply rotation to camera position
      const rotMat = mat4.create();
      mat4.fromQuat(rotMat, this.rotation);
      const rotatedCam = vec3.transformMat4([], cameraPos, rotMat);

      mat4.lookAt(this.viewMatrix,
        rotatedCam,
        target,
        up);
    }
  },

  getViewProjectionMatrix() {
    const viewProjMatrix = mat4.create();
    mat4.multiply(viewProjMatrix, this.projMatrix, this.viewMatrix);
    return viewProjMatrix;
  },

  screenToWorld(screenX, screenY, screenZ = 0) {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((screenX - rect.left) / this.canvas.width) * 2 - 1;
    const y = -((screenY - rect.top) / this.canvas.height) * 2 + 1;
    const z = screenZ * 2 - 1;

    const viewProj = this.getViewProjectionMatrix();
    const invViewProj = mat4.create();
    mat4.invert(invViewProj, viewProj);

    const worldPos = vec4.fromValues(x, y, z, 1);
    vec4.transformMat4(worldPos, worldPos, invViewProj);
    vec4.scale(worldPos, worldPos, 1.0 / worldPos[3]);

    return [worldPos[0], worldPos[1], worldPos[2]];
  }
};