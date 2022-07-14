/** this file for testing how to convert to certain types with js */


const valueE = BigInt("4351664643");
const valeD = "3543524"

// console.log(valueE)

// console.log(new Date(valeD))

const flag = Boolean();
const flag1 = Boolean(valeD);
const flag2 = new Boolean(valeD);
const flag3 = new Boolean();

// console.log(flag)
// console.log(flag1);
// console.log(flag2);
// console.log(flag3);


// show the difference between a Map and an Object through a code example
const map = new Map();
const obj = new Object();

map.set(1, "value");
obj["key"] = "value";

// console.log(map.get(1));
// console.log(obj["key"]);

// console.log(map.has("key"));
// console.log(obj.hasOwnProperty("key"));
// console.log(`\n`);

// console.log(map);
// console.log(obj);

// console.log(typeof BigInt(43351435454115235));

let entityPropName = "partitionKey";
let objPropName = undefined;

objPropName = entityPropName.charAt(0).toLowerCase() + entityPropName.slice(1);
console.log(objPropName);


