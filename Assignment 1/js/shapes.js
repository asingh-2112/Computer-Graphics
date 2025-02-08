// shapes.js

// Functions to transform shapes and help with color/centroid calculations

function transformShape(shape, dx, dy, scale, rotation) {
    // Calculate the centroid of all points in the shape
    let points = shape.triangles.flat();
    let centroid = calculateCentroid(points);
  
    shape.triangles = shape.triangles.map(triangle =>
      triangle.map(point => {
        // Translate point relative to centroid
        let x = point.x - centroid.x;
        let y = point.y - centroid.y;
        // Rotate the point
        let rad = (rotation * Math.PI) / 180;
        let rotatedX = x * Math.cos(rad) - y * Math.sin(rad);
        let rotatedY = x * Math.sin(rad) + y * Math.cos(rad);
        // Scale and translate back plus any additional offset
        return {
          x: (rotatedX * scale + centroid.x) + dx,
          y: (rotatedY * scale + centroid.y) + dy
        };
      })
    );
  }
  
  function calculateCentroid(points) {
    let x = 0, y = 0;
    points.forEach(p => { x += p.x; y += p.y; });
    return { x: x / points.length, y: y / points.length };
  }
  
  function getRandomColor() {
    return [Math.random(), Math.random(), Math.random(), 1.0];
  }
  
  function hexToRgb(hex) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }
  
  function generateRandomShape() {
    const numPoints = Math.floor(Math.random() * 5) + 3; // 3 to 7 points
    const points = [];
    for (let i = 0; i < numPoints; i++) {
      points.push({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 });
    }
    const triangles = earClippingTriangulation(points);
    return { triangles, color: getRandomColor(), zIndex: completedShapes.length };
  }
  