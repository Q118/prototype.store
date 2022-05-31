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



const readQueue = async () => {
    const azureQueue = new AzureQueue(connectionString, "apirequests");

    const count = await azureQueue.getCount();
    console.log(`${count} messages in queue`);
    console.log("reading queue...");
    const result = await azureQueue.peekMessages(count);
    return result;
}

readQueue().then(result => {
    console.log(result);
}).catch(err => {
    console.log(err);
});