"use strict";

/**
 * Get the least used color in a grid.
 * Usually the least used color is highlighting something.
 *
 * @param {number[][]} grid The grid, where each inner array represents a row
 *   of squares and each value represents the square's color.
 */
module.exports = function getLeastUsedColor(grid) {
  const colors = [];

  for (const row of grid) {
    for (const color of row) {
      if (!colors[color]) {
        colors[color] = 0;
      }
      colors[color] += 1
    }
  }

  let smallestIndex = 0;
  for (const [i, x] of colors.entries()) {
    if (x < colors[smallestIndex]) smallestIndex = i;
  }

  return smallestIndex;
};
