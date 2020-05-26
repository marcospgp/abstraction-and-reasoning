"use strict";

/**
 * @param {number[][][]} objects A 3D array containing objects, where each
 *   object contains a set of points in the format [y, x]. y is the row, x is
 *   the column.
 * @param {number[][]} grid The grid in question, same format as in .json tasks.
 * @param {number} color Color index, same format as in .json tasks.
 */
module.exports = function selectObjectsOfColor(objects, grid, color) {
  const filteredObjects = [];

  for (const obj of objects) {
    let allowObject = true;
    for (const point of obj) {
      const [y, x] = point;

      if (grid[y][x] !== color) {
        allowObject = false;
        break;
      }
    }

    if (allowObject) {
      filteredObjects.push(obj)
    }
  }

  return filteredObjects;
};
