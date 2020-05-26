"use strict";

const executor = require("./executor");

const { train, test } = require("./0b148d64.json");
const grid = test[0].input;

executor("./program.js", grid, "output");
