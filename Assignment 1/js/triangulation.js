// triangulation.js

// Ear clipping triangulation and helper functions

function earClippingTriangulation(polygon) {
    let triangles = [];
    let vertices = [...polygon];
  
    while (vertices.length >= 3) {
      let earFound = false;
      for (let i = 0; i < vertices.length; i++) {
        let prev = vertices[(i - 1 + vertices.length) % vertices.length];
        let curr = vertices[i];
        let next = vertices[(i + 1) % vertices.length];
        if (isEar(prev, curr, next, vertices)) {
          triangles.push([prev, curr, next]);
          vertices.splice(i, 1);
          earFound = true;
          break;
        }
      }
      if (!earFound) {
        // If no ear is found, break out to avoid an infinite loop.
        break;
      }
    }
    return triangles;
  }
  
  function isEar(prev, curr, next, vertices) {
    for (let i = 0; i < vertices.length; i++) {
      const p = vertices[i];
      if (p === prev || p === curr || p === next) continue;
      if (isPointInTriangle(p, prev, curr, next)) {
        return false;
      }
    }
    return true;
  }
  
  function isPointInTriangle(p, a, b, c) {
    let area = 0.5 * (-b.y * c.x + a.y * (-b.x + c.x) + a.x * (b.y - c.y) + b.x * c.y);
    let sign = area < 0 ? -1 : 1;
    let s = (a.y * c.x - a.x * c.y + (c.y - a.y) * p.x + (a.x - c.x) * p.y) * sign;
    let t = (a.x * b.y - a.y * b.x + (a.y - b.y) * p.x + (b.x - a.x) * p.y) * sign;
    return s >= 0 && t >= 0 && (s + t) <= 2 * area * sign;
  }
  