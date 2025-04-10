const axes = {
    x: null,
    y: null,
    z: null,
    vertexBuffer: null,
    colorBuffer: null,
    indexBuffer: null,
    indexCount: 0,

    init(gl) {
        // Create geometry for all three axes
        const axisLength = 2.0;
        const cylinderRadius = 0.05;
        const coneRadius = 0.1;
        const coneHeight = 0.3;
        const segments = 16;

        // We'll store all vertices, colors and indices together
        const positions = [];
        const colors = [];
        const indices = [];
        let indexOffset = 0;

        // Create X-axis (red)
        this.createAxisGeometry(positions, colors, indices, 
                              axisLength, cylinderRadius, coneRadius, coneHeight, 
                              segments, indexOffset, [1, 0, 0, 1]);
        indexOffset = positions.length / 3;

        // Create Y-axis (green)
        this.createAxisGeometry(positions, colors, indices, 
                              axisLength, cylinderRadius, coneRadius, coneHeight, 
                              segments, indexOffset, [0, 1, 0, 1]);
        indexOffset = positions.length / 3;

        // Create Z-axis (blue)
        this.createAxisGeometry(positions, colors, indices, 
                              axisLength, cylinderRadius, coneRadius, coneHeight, 
                              segments, indexOffset, [0, 0, 1, 1]);

        // Create buffers
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        this.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        this.indexCount = indices.length;
    },

    createAxisGeometry(positions, colors, indices, 
                      length, cylinderRadius, coneRadius, coneHeight, 
                      segments, indexOffset, color) {
        const halfLength = length / 2;
        
        // Cylinder vertices (along Z-axis initially, we'll transform them)
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const x = cylinderRadius * Math.cos(theta);
            const y = cylinderRadius * Math.sin(theta);
            
            // Bottom vertex
            positions.push(x, y, -halfLength);
            colors.push(...color);
            
            // Top vertex
            positions.push(x, y, halfLength - coneHeight);
            colors.push(...color);
        }
        
        // Cylinder indices
        for (let i = 0; i < segments; i++) {
            const base = indexOffset + i * 2;
            indices.push(base, base + 1, base + 2);
            indices.push(base + 1, base + 3, base + 2);
        }
        
        // Cone vertices (tip at positive Z)
        const coneBaseOffset = indexOffset + (segments + 1) * 2;
        positions.push(0, 0, halfLength); // Tip
        colors.push(...color);
        
        // Cone base vertices
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const x = coneRadius * Math.cos(theta);
            const y = coneRadius * Math.sin(theta);
            
            positions.push(x, y, halfLength - coneHeight);
            colors.push(...color);
        }
        
        // Cone indices
        for (let i = 0; i < segments; i++) {
            indices.push(coneBaseOffset, 
                        coneBaseOffset + 1 + i, 
                        coneBaseOffset + 1 + ((i + 1) % segments));
        }
    },

    draw(gl, shaderProgram) {
        if (!this.vertexBuffer) return;

        // We'll draw all three axes with different model matrices
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(
            shaderProgram.attribLocations.vertexPosition,
            3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shaderProgram.attribLocations.vertexPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.vertexAttribPointer(
            shaderProgram.attribLocations.vertexColor,
            4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shaderProgram.attribLocations.vertexColor);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        // Calculate how many indices per axis (each axis has the same amount)
        const indicesPerAxis = this.indexCount / 3;

        // Draw X-axis (red) - rotated 90° around Y
        let modelMatrix = mat4.create();
        mat4.rotateY(modelMatrix, modelMatrix, Math.PI/2);
        gl.uniformMatrix4fv(shaderProgram.uniformLocations.modelMatrix, false, modelMatrix);
        gl.drawElements(gl.TRIANGLES, indicesPerAxis, gl.UNSIGNED_SHORT, 0);

        // Draw Y-axis (green) - rotated -90° around X
        modelMatrix = mat4.create();
        mat4.rotateX(modelMatrix, modelMatrix, -Math.PI/2);
        gl.uniformMatrix4fv(shaderProgram.uniformLocations.modelMatrix, false, modelMatrix);
        gl.drawElements(gl.TRIANGLES, indicesPerAxis, gl.UNSIGNED_SHORT, indicesPerAxis * 2);

        // Draw Z-axis (blue) - no rotation needed
        modelMatrix = mat4.create();
        gl.uniformMatrix4fv(shaderProgram.uniformLocations.modelMatrix, false, modelMatrix);
        gl.drawElements(gl.TRIANGLES, indicesPerAxis, gl.UNSIGNED_SHORT, indicesPerAxis * 4);
    }
};