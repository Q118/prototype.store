const fs = require('fs')

const file = ('./access.log')
var fileReadStream = fs.createReadStream(file);
const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();
const { streamToBuffer } = require("./v2/utils/stream");


//! use a stream so its efficient. stream in the data from the log file into azure, creating a new blob for each {} and the title of each blob file to be the GUID.

fileReadStream.on('data', (chunk) => {


    //seperate out part by /n/n
    let lines = chunk.toString().split('\n\n');

    // console.log(lines.length);
    // console.log(lines[0]);

    //!!! RETURN HERE !!! its getting closer but need more grok of azure storage and of HOW TO USE BUFFERS correctly
    // loop through each line in lines. for each line, create a new blob with the GUID as the title and the body to hold the whole line. insert these into azure storage
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // if the line is empty, skip it
        if (line.length < 5) {
            continue;
        }

        let guid = line.split('\n')[0];
        let body = line.split('\n')[1];
        //console.log(guid);
        //console.log(body);
        // create a new blob with the GUID as the title and the body to hold the whole line. insert these into azure storage
        const blobServiceClient = new BlobServiceClient(process.env.AZURE_STORAGE_CONNECTION_STRING);
        
        const containerClient = blobServiceClient.getContainerClient("apirequests");
        
        const blockBlobClient = containerClient.getBlockBlobClient(guid);

        console.log(typeof body);
        const buffer = Buffer.from(body);



        blockBlobClient.uploadStream(buffer, buffer.length, { blobHTTPHeaders: { blobContentType: "application/json" } }); 
        // console.log('uploaded');
    }


});


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