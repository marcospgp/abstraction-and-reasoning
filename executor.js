"use strict";

const vm = require("vm");
const fs = require("fs");

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

const { train, test } = require("./00d62c1b.json");
const grid = test[0].input;

/**
 * Create an object (array of coordinates) starting from a single square,
 * by grouping it with all squares of non background color that are connected
 * to it - either directly or through other non background color squares.
 */
const createObjectFromSquare = (y, x, grid, backgroundColor) => {
  // Recursive function
  // The parameter obj contains the points belonging to the object being created
  const f = obj => {
    // For each point in obj, check if there are any neighboring non background
    // squares to be added to the object.
    // If any are added, call itself recursively to keep expanding.
    // If none are added, consider the object complete and return it.

    let added = false;

    for (const [y, x] of obj) {
      const neighbors = [
        [y, x + 1],
        [y, x - 1],
        [y + 1, x],
        [y - 1, x],
        [y + 1, x + 1],
        [y + 1, x - 1],
        [y - 1, x + 1],
        [y - 1, x - 1],
      ];

      for (const [y2, x2] of neighbors) {
        const alreadyInObject = obj.find(p => p.y === y2 && p.x === x2);
        if (alreadyInObject !== undefined) continue;

        if (grid[y2][x2] !== backgroundColor) {
          obj.push([y2, x2]);
          added = true;
        }
      }
    }

    if (added) {
      return f(obj);
    }
    return obj;
  }

  return f([[y,x]]);
}

// Given a selector object, returns targeted coordinates of the grid
const select = selector => {
  // Background color is black by default
  const backgroundColor = 0;

  // an array of arrays containing objects -> coordinates in the format:
  // [ [[y, x], [y, x]], ... ]
  let objects = [];

  // Create initial objects array, which holds the coordinates of all objects
  // of non background color in the grid
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
          objects.push(createObjectFromSquare(y, x, grid, backgroundColor));
        }
      }
    }
  }

  // Creating initial objects by iterating square by square is imperfect, as
  // squares neighboring squares that haven't been checked yet will be seen as
  // a new object.
  // This means now we merge objects that neighbor each other:

  // If there were any merges, check again as there might be new neighbors

  console.log(`Found ${objects.length} objects`);

  // selector.part: only supports "interior" for now
  if (selector.part) {
    if (!["interior"].includes(selector.part)) {
      throw new Error("Invalid selector.part");
    }

    if (selector.part === "interior") {
      // Create one empty interior per object in selection
      const interiors = objects.map(x => []);

      // Iterate over squares of grid
      for (const [y, row] of grid.entries()) {
        for (const [x, color] of row.entries()) {

          // If a square is background color and is surrounded by the squares of
          // an object, it is an interior square
          if (color === backgroundColor) {
            for (const [i, coords] of objects.entries()) {

              // left, right, up, down
              const surrounded = [false, false, false, false];

              for (const [y2, x2] of coords) {
                if (x2 === x && y2 < y) {
                  surrounded[0] = true;
                }
                if (y2 === y && x2 > x) {
                  surrounded[1] = true;
                }
                if (x2 === x && y2 > y) {
                  surrounded[2] = true;
                }
                if (y2 === y && x2 < x) {
                  surrounded[3] = true;
                }

                // If square is surrounded, add to current object's interior
                // and break loop
                if (!surrounded.includes(false)) {
                  interiors[i].push([y, x]);
                  break;
                }
              }
            }
          }
        }
      }

      objects = interiors;
    }
  }

  return objects;
}

const color = (selector, color) => {
  checkColorParameter(color);

  const colorIndex = colors[color];

  const selectedObjects = select(selector);

  for (const coords of selectedObjects) {
    for (const [y, x] of coords) {
      grid[y][x] = colorIndex;
    }
  }
}

const script = fs.readFileSync("./program.js", "utf8");
vm.runInNewContext(script, { color });

const gridToCanvas = require("./grid-to-canvas");

gridToCanvas(grid, "output");
