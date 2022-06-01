// read from the queue, anything new? then read from the blob container that the message references and print out that data to the console 

// does it get deleted once read? If so, then are we then storing the data in our app?/....
//? like we delete it once we know what to do with it?
// or no we keep it in there to use as reference...
//! no deleting/dequeuing it
const express = require('express');
const fs = require('fs');
// const { title } = require('process');
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require("dotenv").config();
const AzureQueue = require('../azureQueue').AzureQueue;
const AzureBlob = require('../azureBlob').AzureBlob;
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
//so first get all the messages from the queu > array
// for each of those array messages, get the blob data from the blob container with that name and print the data to the UI (log to console for now)

//! THE LOGIC IS ALL HERE SHELBY! BEFORE U START TO IMPLEMENT ELSEWHERE, FIX THE ASYNC STUFF HAPPENING... RUN THIS FILE AND THEN NEED TO DO SOME TROUBLESHOOTING, *then* go try and implement.
// prob take emnpty array to global and do try/catch shiz

const readQueue = async () => {
    const azureQueue = new AzureQueue(connectionString, "apirequests");
    const count = await azureQueue.getCount();

    console.log(`${count} messages in queue`);
    console.log("reading queue...");

    const result = await azureQueue.peekMessages(count);
    return result;
}

const readBlobData = async (blobName) => {
    const azureBlob = new AzureBlob(connectionString, "apirequests");
    // console.log("reading blob-containers...");
    const result = await azureBlob.readBlob(blobName);
    return result;
}

readQueue().then(result => {
    let titleArray = [];
    for (const property in result) {
        console.log(result[property].messageText);
        titleArray.push(`${result[property].messageText}.json`);
    }
    titleArray.forEach((title) => {
        console.log(`reading ${title} blob-container...`);
        readBlobData(title).then(result => {
            console.log(result);
        }).catch(err => {
            console.log(err);
        });
    });
}).catch(err => {
    console.log(err);
});

// readBlobData().then(result => {
//     console.log(typeof result);
// }).catch(err => {
//     console.log(err);
// });