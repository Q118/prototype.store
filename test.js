const fs = require('fs');
const file = "./messageTest.json";

const data = fs.readFileSync(file, "utf8");

console.log(typeof JSON.parse(data))

console.log(JSON.parse(data).filename)

// console.log(data.filename)