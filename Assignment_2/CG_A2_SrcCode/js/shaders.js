// Shader management
const shaders = {
    vsSource: `
      attribute vec3 aVertexPosition;
      attribute vec3 aVertexNormal;
      attribute vec4 aVertexColor;
      uniform mat4 uModelMatrix;
      uniform mat4 uViewMatrix;
      uniform mat4 uProjectionMatrix;
      uniform mat3 uNormalMatrix;
      varying lowp vec4 vColor;
      varying lowp vec3 vNormal;
      varying lowp vec3 vPosition;
      
      void main(void) {
        gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
        vColor = aVertexColor;
        vNormal = uNormalMatrix * aVertexNormal;
        vPosition = vec3(uModelMatrix * vec4(aVertexPosition, 1.0));
      }
    `,
  
    fsSource: `
      varying lowp vec4 vColor;
      varying lowp vec3 vNormal;
      varying lowp vec3 vPosition;
      uniform lowp vec3 uLightPosition;
      
      void main(void) {
        lowp vec3 lightDir = normalize(uLightPosition - vPosition);
        lowp float diffuse = max(dot(normalize(vNormal), lightDir), 0.2);
        gl_FragColor = vec4(vColor.rgb * (0.3 + 0.7 * diffuse), vColor.a);
      }
    `,
  
    initShaderProgram(gl) {
      const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, this.vsSource);
      const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, this.fsSource);
      
      const shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);
      
      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Shader program failed to link: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
      }
      
      return {
        program: shaderProgram,
        attribLocations: {
          vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
          vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
          vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
          projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
          viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
          modelMatrix: gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
          normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
          lightPosition: gl.getUniformLocation(shaderProgram, 'uLightPosition'),
        },
      };
    },
  
    loadShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      
      return shader;
    }
  };