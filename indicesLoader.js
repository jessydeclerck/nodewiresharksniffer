const fs = require("fs");
const _ = require("lodash");
const path = require("path");
let indices;
let invertedIndices;

module.exports = {
    loadIndices : () => {
        let indicesFile = fs.readFileSync(path.join(__dirname, 'indices.json'));
        indices = JSON.parse(indicesFile);
        invertedIndices = _.invert(indices);
    },
    getInvertedIndices : () => {
        return invertedIndices;
    },
    getIndices : () => {
        return indices;
    }
}