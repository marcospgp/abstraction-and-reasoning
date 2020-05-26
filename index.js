"use strict";

const executor = require("./executor");

const { train, test } = require("./ac0a08a4.json");
const grid = test[0].input;

executor("./program.js", grid, "output");
