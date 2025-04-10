// model.js - Updated to include 3 models
function getRandomColor() {
    const r = Math.random() * 0.5 + 0.5;
    const g = Math.random() * 0.5 + 0.5;
    const b = Math.random() * 0.5 + 0.5;
    return [r, g, b, 1.0];
}

class Model {
    constructor(position, file, name) {
        this.position = position;
        this.rotation = quat.create();
        this.scale = [1, 1, 1];
        this.color = getRandomColor();
        this.highlightColor = [1, 1, 0, 1];
        this.file = file;
        this.name = name;
        this.vertexBuffer = null;
        this.normalBuffer = null;
        this.indexBuffer = null;
        this.colorBuffer = null;
        this.indexCount = 0;
        this.isSelected = false;
        this.path = null;
        this.vertexCount = 0;
    }

    async load(gl) {
        try {
            const response = await fetch(this.file);
            const objText = await response.text();
            const obj = new OBJ.Mesh(objText);
    
            this.vertexBuffer = createBuffer(gl, obj.vertices);
            this.vertexCount = obj.vertices.length / 3;
            
            // Create color buffer
            const colors = [];
            for (let i = 0; i < this.vertexCount; i++) {
                colors.push(...this.color);
            }
            this.colorBuffer = createBuffer(gl, colors);
            
            this.normalBuffer = createBuffer(gl, obj.vertexNormals);
            this.indexBuffer = createIndexBuffer(gl, obj.indices);
            this.indexCount = obj.indices.length;
        } catch (error) {
            console.error(`Error loading model ${this.name}:`, error);
            this.createFallbackModel(gl);
        }
    }

    cycleColor() {
        const colors = [
            [1, 0, 0, 1],    // Red
            [0, 1, 0, 1],    // Green
            [0, 0, 1, 1],    // Blue
            [1, 1, 0, 1],    // Yellow
            [1, 0, 1, 1],    // Magenta
            [0, 1, 1, 1]     // Cyan
        ];
        
        const currentIndex = colors.findIndex(c => 
            c[0] === this.color[0] && 
            c[1] === this.color[1] && 
            c[2] === this.color[2]
        );
        
        this.color = colors[(currentIndex + 1) % colors.length];
        
        if (this.colorBuffer) {
            const colorsArray = [];
            for (let i = 0; i < this.vertexCount; i++) {
                colorsArray.push(...this.color);
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorsArray), gl.STATIC_DRAW);
        }
    }

    createFallbackModel(gl) {
        // Different fallback shapes for each model
        let vertices, indices, normals;
        
        if (this.name === "model1") {
            // Cube
            vertices = [
                -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5,
                -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5
            ];
            indices = [
                0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7,
                0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5,
                2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7
            ];
        } else if (this.name === "model2") {
            // Pyramid
            vertices = [
                // Base
                -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,
                // Apex
                0, 0.5, 0
            ];
            indices = [
                // Base
                0, 1, 2, 0, 2, 3,
                // Sides
                0, 1, 4, 1, 2, 4, 2, 3, 4, 3, 0, 4
            ];
        } else {
            // Sphere approximation
            const segments = 12;
            const rings = 6;
            vertices = [];
            indices = [];
            
            for (let lat = 0; lat <= rings; lat++) {
                const theta = lat * Math.PI / rings;
                const sinTheta = Math.sin(theta);
                const cosTheta = Math.cos(theta);
                
                for (let long = 0; long <= segments; long++) {
                    const phi = long * 2 * Math.PI / segments;
                    const sinPhi = Math.sin(phi);
                    const cosPhi = Math.cos(phi);
                    
                    const x = cosPhi * sinTheta;
                    const y = cosTheta;
                    const z = sinPhi * sinTheta;
                    
                    vertices.push(x * 0.5, y * 0.5, z * 0.5);
                }
            }
            
            for (let lat = 0; lat < rings; lat++) {
                for (let long = 0; long < segments; long++) {
                    const first = (lat * (segments + 1)) + long;
                    const second = first + segments + 1;
                    
                    indices.push(first, second, first + 1);
                    indices.push(second, second + 1, first + 1);
                }
            }
        }
        
        // Calculate normals
        normals = new Array(vertices.length).fill(0);
        for (let i = 0; i < indices.length; i += 3) {
            const v1 = indices[i] * 3;
            const v2 = indices[i + 1] * 3;
            const v3 = indices[i + 2] * 3;
            
            const p1 = [vertices[v1], vertices[v1 + 1], vertices[v1 + 2]];
            const p2 = [vertices[v2], vertices[v2 + 1], vertices[v2 + 2]];
            const p3 = [vertices[v3], vertices[v3 + 1], vertices[v3 + 2]];
            
            const u = vec3.subtract([], p2, p1);
            const v = vec3.subtract([], p3, p1);
            const normal = vec3.cross([], u, v);
            vec3.normalize(normal, normal);
            
            for (let j = 0; j < 3; j++) {
                normals[v1 + j] += normal[j];
                normals[v2 + j] += normal[j];
                normals[v3 + j] += normal[j];
            }
        }
        
        // Normalize normals
        for (let i = 0; i < normals.length; i += 3) {
            const normal = [normals[i], normals[i + 1], normals[i + 2]];
            vec3.normalize(normal, normal);
            normals[i] = normal[0];
            normals[i + 1] = normal[1];
            normals[i + 2] = normal[2];
        }
        
        this.vertexBuffer = createBuffer(gl, vertices);
        this.normalBuffer = createBuffer(gl, normals);
        this.indexBuffer = createIndexBuffer(gl, indices);
        this.indexCount = indices.length;
        
        // Create color buffer
        const colors = [];
        for (let i = 0; i < vertices.length / 3; i++) {
            colors.push(...this.color);
        }
        this.colorBuffer = createBuffer(gl, colors);
    }

    getModelMatrix() {
        const m = mat4.create();
        mat4.translate(m, m, this.position);
        mat4.scale(m, m, this.scale);
        const rotationMatrix = mat4.create();
        mat4.fromQuat(rotationMatrix, this.rotation);
        mat4.multiply(m, m, rotationMatrix);
        return m;
    }

    getNormalMatrix(modelMatrix) {
        const normalMatrix = mat3.create();
        mat3.fromMat4(normalMatrix, modelMatrix);
        mat3.invert(normalMatrix, normalMatrix);
        mat3.transpose(normalMatrix, normalMatrix);
        return normalMatrix;
    }
}

// Initialize 3 models with different positions
const models = [
    new Model([0.0, 0.0, 0.0], "objects/hollow_cube.obj", "model1"),
    new Model([0.0, 0.0, 0.0], "objects/ring.obj", "model2"),
    new Model([0.0, 0.0, 0.0], "objects/rabbit.obj", "model3")
];