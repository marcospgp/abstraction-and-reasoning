"use strict";

const vm = require("vm");
const fs = require("fs");
const getInterior = require("./helpers/get-interior");
const createObjectFromPoint = require("./helpers/create-object-from-point");
const getLeastUsedColor = require("./helpers/get-least-used-color");
const selectObjectsOfColor = require("./helpers/select-objects-of-color");
const getNumberOfNonBackgroundSquares = require("./helpers/get-number-of-non-background-squares");

const colors = {
  "black": 0,
  "blue": 1,
  "red": 2,
  "green": 3,
  "yellow": 4,
  "gray": 5,
  "pink": 6,
  "orange": 7,
  "light blue": 8,
  "dark red": 9
}

const checkColorParameter = (color) => {
  if (!Object.keys(colors).includes(color)) {
    throw new Error("Invalid color parameter");
  }
}

// Get all objects in the grid. An object is a connected blob of non background
// color squares.
// Returns a 2D array containing objects and the points belonging to them
// in the format:
// [ [[y, x], [y, x]], ... ]
const getAllObjects = (grid, backgroundColor = 0) => {
  const objects = [];

  for (const [y, row] of grid.entries()) {
    for (const [x, color] of row.entries()) {

      if (color !== backgroundColor) {

        // This square is not of background color. If it does not belong to an
        // object yet, form a new object from it by recursively grouping it with
        // all non background color squares that are connected to it.

        let alreadyAssigned = false;

        for (const coords of objects) {
          for (const [y2, x2] of coords) {
            if (y === y2 && x === x2) {
              alreadyAssigned = true;
              break;
            }
          }
          if (alreadyAssigned) break;
        }

        if (!alreadyAssigned) {
          objects.push(createObjectFromPoint(y, x, grid, backgroundColor));
        }
      }
    }
  }

  return objects;
}

// Given a selector object, returns the targeted objects on the grid
const select = (selector, grid) => {
  // Background color is black by default
  const backgroundColor = 0;

  // Create initial objects array, which holds the coordinates of all objects
  // of non background color in the grid
  let objects = getAllObjects(grid, backgroundColor)

  console.log(
    `Found ${objects.length} object${objects.length !== 1 ? "s" : ""} in the grid.`
  );

  // selector.part: only supports "interior" for now
  if (selector.part) {
    if (!["interior"].includes(selector.part)) {
      throw new Error("Invalid selector.part");
    }

    if (selector.part === "interior") {
      objects = objects.map(x => getInterior(x, grid, backgroundColor));
    }
  }

  /**
   * selector["special-color"]:
   * Allows specifying dynamic colors such as the most or least used in the
   * grid.
   * Values supported: "least-used"
   */
  if (selector["special-color"]) {
    if (selector["special-color"] !== "least-used") {
      throw new Error("Invalid special-color");
    }

    const leastUsedColor = getLeastUsedColor(grid);

    objects = selectObjectsOfColor(objects, grid, leastUsedColor);
  }

  console.log(
    `After running selector, ${objects.length} object${objects.length !== 1 ? "s" : ""} selected.`
  );

  return objects;
}

module.exports = (pathToProgram, grid, outputHtml = null) => {

  // Changes the color of targeted squares
  const paint = (selector, color) => {
    checkColorParameter(color);

    const colorIndex = colors[color];

    const selectedObjects = select(selector, grid);

    for (const coords of selectedObjects) {
      for (const [y, x] of coords) {
        grid[y][x] = colorIndex;
      }
    }
  }

  // Crops the grid to display only the selected objects.
  // Crop coordinates are the maximum and minimum X and Y of all the points in
  // the objects.
  const crop = (selector) => {
    const selectedObjects = select(selector, grid);

    let minY = null;
    let maxY = null;
    let minX = null;
    let maxX = null;

    for (const obj of selectedObjects) {
      for (const [y, x] of obj) {
        if (minY === null || y < minY) minY = y;
        if (maxY === null || y > maxY) maxY = y;
        if (minX === null || x < minX) minX = x;
        if (maxX === null || x > maxX) maxX = x;
      }
    }

    const newGrid = [];

    for (const [y, row] of grid.entries()) {
      if (y >= minY && y <= maxY) {
        const newRow = row.slice(minX, maxX + 1);
        newGrid.push(newRow);
      }
    }

    grid = newGrid;
  }

  // Scales the grid up or down
  const scaleGrid = (upOrDown, factor) => {
    if (upOrDown !== "up" && upOrDown !== "down") {
      throw new Error("Invalid upOrDown");
    }
    if (factor !== "$numberOfNonBackgroundSquaresInGrid") {
      throw new Error("Invalid scale factor");
    }

    if (factor === "$numberOfNonBackgroundSquaresInGrid") {
      factor = getNumberOfNonBackgroundSquares(grid);
    }

    if (upOrDown === "down") {
      throw new Error("Unsupported upOrDown = down");
    }

    const newGrid = [];

    if (upOrDown === "up") {

      for (const row of grid) {
        const newRow = [];
        for (const color of row) {
          for (let i = 0; i < factor; i++) {
            newRow.push(color);
          }
        }

        for (let i = 0; i < factor; i++) {
          newGrid.push(newRow);
        }
      }
    }

    grid = newGrid;
  }

  const script = fs.readFileSync(pathToProgram, "utf8");

  vm.runInNewContext(script, {
    paint,
    crop,
    scaleGrid
  });

  if (outputHtml) {
    const gridToCanvas = require("./grid-to-canvas");
    gridToCanvas(grid, "output");
  }

  return grid;
};
