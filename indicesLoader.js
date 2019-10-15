const fs = require("fs");
const _ = require("lodash");
let indices;
let invertedIndices;

module.exports = {
    loadIndices : () => {
        let indicesFile = fs.readFileSync('indices.json');
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