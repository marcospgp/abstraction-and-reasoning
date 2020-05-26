"use strict";

const glob = require("glob");
const path = require("path");
const executor = require("./executor");

const jsonFiles = glob.sync("./handled-tasks/**/*.json");

const errors = [];

for (const file of jsonFiles) {
  const folder = path.dirname(file);

  const { train, test } = require(file);

  for (const [i, testGrid] of test.entries()) {

    const grid = testGrid.input;

    const output = executor(path.join(folder, "program.js"), grid);

    if (JSON.stringify(output) !== JSON.stringify(testGrid.output)) {
      errors.push(`Failed test grid #${i + 1} of task "${file}"`);
    } else {
      console.log(`Successfully solved test grid #${i + 1} of task "${file}"`)
    }
  }
}

if (errors.length > 0) {
  console.error(JSON.stringify(errors, null, 2));
  throw new Error("Some tests failed. More details above.");
}
