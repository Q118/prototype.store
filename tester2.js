const fs = require('fs')
const file = ('./access.log')
var fileReadStream = fs.createReadStream(file);

const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();

const { streamToBuffer } = require("./v2/utils/stream");
const Readable = require('stream').Readable;

async function main(title, body) {
    console.log('Azure Blob storage v12 - JavaScript quickstart sample');

    const AZURE_STORAGE_CONNECTION_STRING =
        process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (!AZURE_STORAGE_CONNECTION_STRING) {
        throw Error("Azure Storage Connection string not found");
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(
        AZURE_STORAGE_CONNECTION_STRING
    );

    const containerName = "apirequests";

    console.log("\nFetching container...");
    console.log("\t", containerName);

    // Get a reference to a container
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Create the container
    // const createContainerResponse = await containerClient.create();
    // console.log(
    //     "Container was created successfully. requestId: ",
    //     createContainerResponse.requestId
    // );
    const blobName = title;

    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    console.log("\nUploading to Azure storage as blob:\n\t", blobName);

    // Upload data to the blob
    // const data = "Hello, World!";
    const uploadBlobResponse = await blockBlobClient.uploadStream(body, body.length, { blobHTTPHeaders: { blobContentType: "application/json" } }); 

    console.log(
        "Blob was uploaded successfully. requestId: ",
        uploadBlobResponse.requestId
    );


}

main() // put this inside the event omitter
    .then(() => console.log('Done'))
    .catch((ex) => console.log(ex.message));