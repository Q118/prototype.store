const express = require('express');
const path = require('path');
const app = express();
const methodOverride = require('method-override');
// Setting up express to use json and set it to req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const fs = require('fs');

/**
 * @summary authenticate with the storage service using a connection string
 */
const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();
const { streamToBuffer } = require("./utils/stream");

async function main() {
    const STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || "";
    // Note - Account connection string can only be used in node.
    const blobServiceClient = BlobServiceClient.fromConnectionString(STORAGE_CONNECTION_STRING);

    let i = 1;
    // lists all containers to console
    for await (const container of blobServiceClient.listContainers()) {
        console.log(`Container ${i++}: ${container.name}`);
    }

    /**
     * @summary create and then delete a container 
     * */
    //    const containerName = `newcontainer${new Date().getTime()}`;
    //    const containerClient = blobServiceClient.getContainerClient(containerName);
    //    const createContainerResponse = await containerClient.create();
    //    console.log(`Create container ${containerName} successfully`, createContainerResponse.requestId); 
    //! Delete container
    //await containerClient.delete();
    //console.log("deleted container");



    /**
     * @summary get contents of each blob in the container
     */
    const containerClient = blobServiceClient.getContainerClient("apirequests");
    // Iterate over all blobs in the container
    console.log("Blobs:");
    let blobNames = [];
    let blobs = [];
    for await (const blob of containerClient.listBlobsFlat()) {
        console.log(`- ${blob.name}`);
        blobNames.push(blob.name
            );
    }



    // grab the contents of inside each blob
    for (let i = 0; i < blobNames.length; i++) {
        const blobClient = containerClient.getBlobClient(blobNames[i]);
        const downloadBlockBlobResponse = await blobClient.download();
        const downloaded = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
        let newObj = { name: blobNames[i], data: downloaded.toString() };
        blobs.push(newObj);
    };
    console.log(blobs.length);
    console.log(blobs[0].data);
    console.log(blobs[0].name);


    app.get('/hello', (req, res) => {
        // res.send(JSON.parse(JSON.stringify(blobs[0].data, undefined, 2)));
        // res.send(JSON.parse(JSON.stringify(blobs)));
        res.send(blobs);

        // TODO: send the whole blob array and parse from
    });

}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});








//client side code
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(3000, () => {
    console.log('webApp is running on port 3000');
});