"use strict";

const fs = require("fs");

/**
 * @param grid A 2D array representing an ARC grid (see a task json file for
 *             examples)
 * @param outputFilename Name to give the output html file
 */
module.exports = (grid, outputFilename) => {
  let html = `
    <head>
      <title>Grid Viewer</title>
      <style>
        body{ background-color: ivory; }
        canvas {
          padding: 0;
          margin: auto;
          display: block;
        }
      </style>
    </head>
    <body>
      <canvas id="canvas" width=600 height=600></canvas>

      <script>
        const grid = JSON.parse("${JSON.stringify(grid)}");
        const colors = [
          "#000000",
          "#0074D9",
          "#FF4136",
          "#2ECC40",
          "#FFDC00",
          "#AAAAAA",
          "#F012BE",
          "#FF851B",
          "#7FDBFF",
          "#870C25"
        ];

        const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");
        const canvasWidth = canvas.width;
        const cellSide = canvasWidth / grid[0].length;
        const canvasHeight = cellSide * grid.length;

        // Draw squares
        for (const [y, row] of grid.entries()) {
          for (const [x, color] of row.entries()) {
            ctx.fillStyle = colors[color];
            ctx.fillRect(x * cellSide, y * cellSide, cellSide, cellSide);
          }
        }

        // Draw grid lines (after squares so they don't get covered up)
        ctx.beginPath();
        for (const y of grid.keys()) {
          ctx.moveTo(0, y * cellSide);
          ctx.lineTo(canvasWidth, y * cellSide);
        }
        for (const x of grid[0].keys()) {
          ctx.moveTo(x * cellSide, 0);
          ctx.lineTo(x * cellSide, canvasHeight);
        }
        ctx.strokeStyle = "#555555";
        ctx.stroke();
      </script>
    </body>
  `;

  fs.writeFileSync(`${outputFilename}.html`, html);
}
