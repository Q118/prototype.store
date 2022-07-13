// const { AzureBlob } = require('./newAzureBlob.js');
// const fs = require('fs');
const { Readable } = require('stream');

const { ContainerClient, StorageSharedKeyCredential } = require("@azure/storage-blob");
let sampleJSON = {
    "name": "John",
    "age": 30,
    "cars": [
        "Ford",
        "BMW",
        "Fiat"
    ]
}
const readable = Readable.from(JSON.stringify(sampleJSON));
// console.log(readable)
// let sampleStream = fs.createReadStream(sampleJSON);

readable.on("data", (chunk) => {
    console.log(chunk) // will be called once with `"input string"`
})

const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const containerName = "dev-blobs";
const containerClient = new ContainerClient(
    `https://${account}.blob.core.windows.net/${containerName}`,
    sharedKeyCredential
);


console.log("Listing blobs by hierarchy, specifying a prefix:");
async function listAllBlobsInFolder() {
    const items = containerClient.listBlobsByHierarchy("/", { prefix: "04b97" });
    let blobNames = [];
    for await (const item of items) {
        // console.log(item)
        if (item.kind === "prefix") {
            console.log(`\tBlobPrefix: ${item.name}`);
        } else {
            // console.log(`\tBlobItem: name - ${item.name}, last modified - ${item.properties.lastModified}`);
            blobNames.push(item.name)
        }
    }
    return blobNames;
}

listAllBlobsInFolder().then(blobItems => {
    console.log(blobItems)
})