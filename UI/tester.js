const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const main = async () => {
    const { BlobServiceClient } = require("@azure/storage-blob");
    require("dotenv").config();
    const { streamToBuffer } = require("./utils/stream");
    const STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING
    const blobServiceClient = BlobServiceClient.fromConnectionString(STORAGE_CONNECTION_STRING);

    let i = 1;
    // lists all containers to console
    let containerName = "";
    for await (const container of blobServiceClient.listContainers()) {
        console.log(`Container ${i++}: ${container.name}`);
        containerName = container.name;
    }
    console.log(containerName)

    const containerClient = blobServiceClient.getContainerClient(containerName);

    let j = 1;
    for await (const blob of containerClient.listBlobsFlat("string")) {
        console.log(`Blob ${j++}: ${blob.name}`);
    }
}

app.listen(3000, () => {
    console.log('webApp is running on port 3000');
});

main().catch((error) => {
    console.error(error);
    process.exit(1);
});