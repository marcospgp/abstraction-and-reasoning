"use strict";

const vm = require("vm");
const fs = require("fs");
const getInterior = require("./helpers/get-interior");
const createObjectFromPoint = require("./helpers/create-object-from-point");

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
          objects.push(createObjectFromPoint(y, x, grid, backgroundColor));
        }
      }
    }
  }

  console.log(`Found ${objects.length} objects`);

  // selector.part: only supports "interior" for now
  if (selector.part) {
    if (!["interior"].includes(selector.part)) {
      throw new Error("Invalid selector.part");
    }

    if (selector.part === "interior") {
      objects = objects.map(x => getInterior(x, grid, backgroundColor));
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
