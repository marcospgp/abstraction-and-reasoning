"use strict";

const executor = require("./executor");

const { train, test } = require("./handled-tasks/4258a5f9/4258a5f9.json");
const grid = test[0].input;

executor("./handled-tasks/4258a5f9/program.js", grid, "output");
