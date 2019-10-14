const fs = require("fs");

let indicesFile = fs.readFileSync('indices.json');
let indices = JSON.parse(indicesFile);
console.log(indices);