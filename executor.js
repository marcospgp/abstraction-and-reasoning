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
      // Get neighbors in a □ shape, to avoid missing any diagonally connected
      // squares
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
        const alreadyInObject = obj.find(p => p[0] === y2 && p[1] === x2);
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

// Get an object's interior, composed of squares of background color completely
// surrounded by the object's squares
const getInterior = (obj, grid, backgroundColor = 0) => {
  // Recursive function that expands from a point, encompassing neighbor squares
  // of background color (without crossing points belonging to the object
  // itself).
  // If we hit the limits of the grid, return null.
  // Otherwise, return the collected points as they represent the interior.
  const expand = points => {
    let addedPoint = false;

    for (const [y, x] of points) {
      // Get neighbors in a + shape, to avoid crossing object boundaries
      let neighbors = [
        [y, x + 1],
        [y, x - 1],
        [y + 1, x],
        [y - 1, x]
      ];

      // Remove any neighbors already encompassed
      neighbors = neighbors.filter(([ny, nx]) =>
        points.find(([py, px]) =>
          ny === py && nx === px
        ) === undefined
      );

      // Remove any neighbors belonging to the object
      neighbors = neighbors.filter(([ny, nx]) =>
        obj.find(([oy, ox]) =>
          ny === oy && nx === ox
        ) === undefined
      );

      if (neighbors.length === 0) continue;

      // If any remaining neighbor is outside the grid return null,
      // because that means we're not the interior
      for (const [ny, nx] of neighbors) {
        if (
          ny < 0 ||
          ny > grid.length - 1 ||
          nx < 0 ||
          nx > grid[0].length - 1
        ) {
          return null;
        }
      }

      // Encompass remaining neighbors of background color
      // this way, if there are any other objects in the interior of this object
      // (aka squares of non background color) they are just ignored.
      for (const [ny, nx] of neighbors) {
        if (grid[ny][nx] === backgroundColor) {
          points.push([ny, nx]);
          addedPoint = true;
        }
      }
    }

    if (!addedPoint) return points;
    return expand(points);
  }

  // We will expand from every unique neighbor around every point of the object.
  // We do not expand from the points of the object themselves because
  // then we could be expanding both inwards and outwards (if the object only
  // has a thickness of 1 square), which would prevent us from finding the
  // interior in those expansions.

  // Get unique neighbors of all squares of the object, ignoring squares
  // belonging to the object itself
  let neighbors = obj.reduce((prev, cur) => {
    const [y, x] = cur;

    const neighbors = [
      [y, x + 1],
      [y, x - 1],
      [y + 1, x],
      [y - 1, x]
    ];

    const result = [...prev];

    for (const n of neighbors) {
      if (
        // square is not yet selected
        result.find(([y, x]) => y === n[0] && x === n[1]) === undefined &&
        // square does not belong to object
        obj.find(([y, x]) => y === n[0] && x === n[1]) === undefined
      ) {
        result.push(n);
      }
    }

    return result;
  }, []);

  let expansions = neighbors.map(point => expand([point]));

  expansions = expansions.filter(x => x !== null);

  // Merge all interiors without repetitions to get complete interior
  const interior = expansions.reduce((prev, cur) => {
    let result = [...prev];

    for (const point of cur) {
      if (!prev.find(p => p[0] === cur[0] && p[1] === cur[1])) {
        result.push(point);
      }
    }
    return result;
  }, []);

  return interior;
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
