"use strict";

const vm = require("vm");
const fs = require("fs");
const getInterior = require("./helpers/get-interior");
const createObjectFromPoint = require("./helpers/create-object-from-point");
const leastUsedColor = require("./helpers/least-used-color");

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

  console.log(grid);
  for (const [y, row] of grid.entries()) {
    for (const [x, color] of row.entries()) {

      if (color !== backgroundColor) {

        // This square is not of background color. If it does not belong to an
        // object yet, form a new object from it by recursively grouping it with
        // all non background color squares that are connected to it, either
        // directly or through other squares of non background color.

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
   * allows specifying dynamic colors such as the most or least used.
   * values supported: "least-used"
   */
  if (selector["special-color"]) {
    if (selector["special-color"] !== "least-used") {
      throw new Error("Invalid special-color");
    }

    leastUsedColor = getLeastUsedColor(grid);
  }

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

  const crop = (selector) => {

  }

  const script = fs.readFileSync(pathToProgram, "utf8");

  // The context program files will run on
  const context = {
    paint,
    crop
  };

  vm.createContext(context);
  vm.runInContext(script, context);

  if (outputHtml) {
    const gridToCanvas = require("./grid-to-canvas");
    gridToCanvas(grid, "output");
  }

  return grid;
};
