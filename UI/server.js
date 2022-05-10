const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * @summary View Engine set up  
 */
console.log('Initializing the EJS view engine');
// Define where the views are stored
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/master');
// ^This lets us have one, main structural page in /views/layouts/master.ejs
app.set('layout extractScripts', true)
app.set('layout extractStyles', true)

/**
 * @summary Authentication
 */
const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();
const { streamToBuffer } = require("./utils/stream");



/**
 * @summary create and then delete a container 
 * */
// #region
//    const containerName = `newcontainer${new Date().getTime()}`;
//    const containerClient = blobServiceClient.getContainerClient(containerName);
//    const createContainerResponse = await containerClient.create();
//    console.log(`Create container ${containerName} successfully`, createContainerResponse.requestId); 
//! Delete container
//await containerClient.delete();
//console.log("deleted container");
// #endregion




/**
 * @summary get contents of each blob in the container
 */
async function main() {
    const STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || "";
    // Note - Account connection string can only be used in node.
    const blobServiceClient = BlobServiceClient.fromConnectionString(STORAGE_CONNECTION_STRING);

    let i = 1;
    // lists all containers to console
    for await (const container of blobServiceClient.listContainers()) {
        console.log(`Container ${i++}: ${container.name}`);
    }

    const containerClient = blobServiceClient.getContainerClient("apirequests");
    // Iterate over all blobs in the container
    console.log("Blobs:");
    let blobNames = [];
    let blobs = [];

    //! throwing error from below 'The first argument must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object. Received undefined'
    // do not understand because there are no args beiing passed to the method
    for await (const blob of containerClient.listBlobsFlat()) {
        console.log(`- ${blob.name}`);
        blobNames.push(blob.name);
    }
    
    //containerClient.listBlobsFlat();
    //blobNames.push("api-requests.json");


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


    app.get('/blobs', (req, res) => {
        res.send(blobs);
    });

    /**
     * @summary Routes
     */
    app.get("/", (req, res) => {
        // render the main page
        res.render('view', {
            blobs,
            title: "Compliance Rules Workbench"
        });
    });

    app.listen(3000, () => {
        console.log('webApp is running on port 3000');
    });


}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});







