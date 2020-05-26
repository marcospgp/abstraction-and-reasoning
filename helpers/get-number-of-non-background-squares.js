"use strict";

module.exports = (grid, backgroundColor = 0) => {
  let count = 0;

  for (const row of grid) {
    for (const color of row) {
      if (color !== backgroundColor) count += 1;
    }
  }

  return count;
}
