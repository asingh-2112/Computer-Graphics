// Path management
const path = {
    points: [],
    curveVertices: [],
    curveBuffer: null,
    pointBuffers: [],
  
    init(gl) {
      this.curveBuffer = gl.createBuffer();
      for (let i = 0; i < 3; i++) {
        this.pointBuffers.push(gl.createBuffer());
      }
    },
  
    addPoint(point) {
      if (this.points.length < 3) {
        this.points.push(point);
        return true;
      }
      return false;
    },
  
    clear() {
      this.points = [];
    },
  
    computeQuadraticCoeffs(p0, p1, p2, t1 = 0.5) {
      const c = p0;
      const a = [];
      const b = [];
      for (let i = 0; i < 3; i++) {
        a[i] = (p1[i] - p0[i] - (p2[i] - p0[i]) * t1) / (t1 * (t1 - 1));
        b[i] = p2[i] - p0[i] - a[i];
      }
      return { a, b, c };
    },
  
    evaluateQuadratic(coeffs, t) {
      const p = [];
      for (let i = 0; i < 3; i++) {
        p[i] = coeffs.a[i] * t * t + coeffs.b[i] * t + coeffs.c[i];
      }
      return p;
    },
  
    generateCurve(coeffs, segments = 20) {
      this.curveVertices = [];
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const point = this.evaluateQuadratic(coeffs, t);
        this.curveVertices.push(...point);
      }
    },
  
    updateBuffers(gl) {
      // Update point buffers
      this.points.forEach((point, i) => {
        // Create a small sphere around each point
        const sphereVerts = this.createSphereVertices(point, 0.1, 8);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pointBuffers[i]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereVerts), gl.STATIC_DRAW);
      });
  
      // Update curve buffer
      if (this.curveVertices.length > 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.curveBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.curveVertices), gl.STATIC_DRAW);
      }
    },
  
    createSphereVertices(center, radius, segments) {
      const vertices = [];
      for (let i = 0; i <= segments; i++) {
        const latAngle = Math.PI * (-0.5 + (i / segments));
        for (let j = 0; j <= segments; j++) {
          const lonAngle = 2 * Math.PI * (j / segments);
          vertices.push(
            center[0] + radius * Math.cos(lonAngle) * Math.cos(latAngle),
            center[1] + radius * Math.sin(lonAngle) * Math.cos(latAngle),
            center[2] + radius * Math.sin(latAngle)
          );
        }
      }
      return vertices;
    }
  };