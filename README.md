# Interactive WebGL Shape Editor

## 📌 Overview

This project implements an **interactive WebGL application** where users can:

- Draw polygon shapes by clicking.
- Apply **ear clipping triangulation** to render shapes.
- Select and **transform** shapes (move, rotate, scale, recolor).
- Control cursor visibility and interaction.
- Adjust **Z-index** to change rendering order.
- Use **keyboard and mouse** for interaction.

---

## 🔧 Functionalities and Implementation

### 1. WebGL Setup & Initialization

- Retrieves WebGL context from an HTML `<canvas>` element.
- **Shaders**:
  - **Vertex Shader**: Transforms shape coordinates.
  - **Fragment Shader**: Manages color rendering using `uColor` uniform.
- Compiles and links the shader program used across the application.

---

### 2. Shape Drawing & Triangulation

- **Mouse Events**:
  - Clicking adds a vertex to the current polygon.
  - Once 3+ vertices are defined, the shape can be triangulated.

- **Ear Clipping Algorithm**:
  - Iteratively extracts triangles while preserving convexity.
  - Stores resulting triangles for efficient rendering.

---

### 3. Shape Selection & Manipulation

- **Click Detection** (`getClickedShapeIndex`):
  - Determines if a clicked point falls inside a shape triangle.
  - Updates `selectedShapeIndex` and the UI.

- **Transformations**:
  - `transformShape`: Applies translation, scaling, and rotation.
  - `calculateCentroid`: Finds a shape’s centroid for accurate transforms.
  - `hexToRgb`: Converts hex to RGB for WebGL.

- **Rendering** (`drawScene`):
  - Clears canvas using `gl.clear()`.
  - Sorts shapes by `zIndex`.
  - Draws all shapes using `gl.drawArrays(gl.TRIANGLES, ...)`.

---

### 4. Cursor & Interaction Controls

- **Toggle Cursor**: Hides or shows the cursor.
- **Disable Interaction**: Prevents shape selection.

---

### 5. Z-Index Adjustment

- Each shape has a `zIndex` to define render priority.
- Use keys:
  - `b`: Send backward.
  - `f`: Bring forward.

---

### 6. Scene Rendering Enhancements

- **Path Rendering**:
  - Uses `gl.LINESTRIP` to preview shape lines during drawing.

- **Star Indicator**:
  - A star is drawn at the last clicked position for visual feedback.

---

## 🖼️ Screenshots & Significance

1. **Drawing Shapes & Triangulation**:  
   Users define vertices and apply triangulation to generate triangles.

2. **Shape Transformation**:  
   Move, scale, rotate, and recolor selected shapes in real-time.

3. **Z-Index Control**:  
   Adjust layer order to manage which shapes render on top.

---

## 🎮 Controls (Keyboard & Mouse)

| Action                        | Control Key/Button              |
|------------------------------|---------------------------------|
| Move Shape                   | Arrow Keys                      |
| Scale Up / Down              | `+` / `-`                       |
| Rotate Clockwise / Counter   | `r` / `R`                       |
| Change Z-Index               | `b` (backward), `f` (forward)   |
| Cycle Through Colors         | `c`                             |
| Add Vertex / Select Shape    | Mouse Click                     |
| Toggle Cursor Visibility     | "Hide Cursor" Button            |
| Disable Cursor Interaction   | "Disable Cursor" Button         |

---

## ❓ Questions & Answers

### 1. How would you implement grouping and ungrouping of shapes for transformations?

**Answer:**  
To implement grouping, selected shapes can share a **common transformation matrix**. We maintain a `group` object that holds references to selected shapes and applies transformations to all of them together. Each shape's local coordinates remain unchanged; during rendering, we apply the **group matrix**.

For **ungrouping**, we detach shapes from the group and give each its own transformation matrix again. This can be efficiently achieved in WebGL by:

- Modifying vertex shaders to apply group-level matrices.
- Managing group metadata.
- Enhancing UI with a “Group” button and visual bounding boxes.

---

### 2. Why is the centroid important in transformations?

**Answer:**  
The **centroid** is essential as it defines the **pivot point** for transformations. Without it, operations like rotation and scaling may behave unexpectedly—e.g., rotating around the canvas origin instead of the shape itself.

For groups, using the **group centroid** ensures consistent transformations across shapes. By calculating the average of all vertices, we center transformations and maintain spatial integrity. Applying transformation matrices around the centroid leads to intuitive and correct graphical behavior.

---

## ✅ Conclusion

This WebGL application offers a hands-on approach to shape drawing, transformation, and rendering with fundamental graphics principles like triangulation, z-indexing, and centroid-based transformation—all wrapped in a highly interactive UI.

---
