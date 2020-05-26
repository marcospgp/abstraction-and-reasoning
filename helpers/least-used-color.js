"use strict";

/**
 * Get an object's interior, which is formed by the squares of background color
 * completely surrounded by the object's squares
 *
 * @param {number[][]} obj The points forming the object in question, in the
 *                         format [y, x] (y being row number, x being column
 *                         number)
 * @param {number[][]} grid The grid, where each inner array represents a row
 *                          of squares and each value represents the square's
 *                          color
 * @param {number} [backgroundColor=0] The background color, defaulting to
 *                                     black.
 */
module.exports = function getInterior(obj, grid, backgroundColor = 0) {
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
