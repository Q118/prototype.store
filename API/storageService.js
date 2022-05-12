/**
 * @summary This file holds the logic to send the data to the storage account
 * ! use a stream so its efficient. 
 * stream in the data from the log file into azure, creating a new blob for each {} 
 * and the title of each blob file to be the GUID.
 */

const fs = require('fs')
const file = ('./access.log')
const fileReadStream = fs.createReadStream(file);
const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();
// const { streamToBuffer } = require("./v2/utils/stream");
// const Readable = require('stream').Readable;


async function main(title, body) {
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
    const blobName = title + ".json";
    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    console.log("\nUploading to Azure storage as blob:\n\t", blobName);
    const uploadBlobResponse = await blockBlobClient.upload(body, body.length, { blobHTTPHeaders: { blobContentType: "application/json" } });
    console.log(
        "Blob was uploaded successfully. requestId: ",
        uploadBlobResponse.requestId
    );
}

fileReadStream.on('data', (chunk) => {
    let lines = chunk.toString().split('\n\n');
    // loop through each line in lines. for each line, create a new blob with the GUID as the title and the body to hold the whole {}. insert these into azure storage
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].length < 1) { // skip the empty one
            continue;
        }
        let bodyStr = lines[i].slice(0, -1) //remove trailing ',' 
        
        let lineObj = JSON.parse(bodyStr);
        
        //console.log(`${bodyStr} \n@\n\n`)
        
        
        let guidTitle = lineObj.GUID;
        // const s = new Readable();
        // s._read = () => { };
        // s.push(bodyStr);
        // s.push(null);
        main(guidTitle, bodyStr)
            .then(() => console.log('Done'))
            .catch((ex) => console.log(ex.message));
    }
});


