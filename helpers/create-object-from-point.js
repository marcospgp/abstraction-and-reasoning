"use strict";

/**
 * Create an object (array of coordinates) starting from a single square,
 * by grouping it with all squares of non background color that are connected
 * to it - either directly or through other non background color squares.
 */
module.exports = function createObjectFromPoint(y, x, grid, backgroundColor = 0) {
  // Recursive function that creates the object (the parameter obj stores the
  // points belonging to the object being created through the iterations)
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
        const notInObject = obj.find(
          p => p[0] === y2 && p[1] === x2
        ) === undefined;

        if (notInObject && grid[y2][x2] !== backgroundColor) {
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
};
