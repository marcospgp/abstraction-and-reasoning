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

// Given a selector object, returns targeted coordinates of the grid
const select = selector => {
  // Background color is black by default
  const backgroundColor = 0;

  // an array of arrays containing coordinates of objects in the format [y, x]:
  // [ [[0, 1], [0, 2]], ... ]
  let objects = [];

  // Create initial objects array, holding coordinates of all objects of non
  // background color in the grid
  for (const [y, row] of grid.entries()) {
    for (const [x, color] of row.entries()) {

      // If this square is non background color
      if (color !== backgroundColor) {

        // If we have an object neighboring this square, add the square to it
        let assigned = false;
        for (const [i, coords] of objects.entries()) {
          for (const [y2, x2] of coords) {
            if (Math.abs(y - y2) <= 1 && Math.abs(x - x2) <= 1) {
              // Add this square to neighboring object
              objects[i].push([y, x]);
            }
          }
        }

        // Otherwise, create a new object
        if (!assigned) {
          objects.push([[y, x]])
        }
      }
    }
  }

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

  const coordinates = select(selector);

  for (const [y, x] of coordinates) {
    grid[y][x] = colorIndex;
  }
}

const script = fs.readFileSync("./program.js", "utf8");
vm.runInNewContext(script, { color });

const gridToCanvas = require("./grid-to-canvas");

gridToCanvas(grid, "output");
