const express = require('express')
const fs = require('fs');
// const { title } = require('process');
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require("dotenv").config();
const AzureQueue = require('../azureQueue').AzureQueue;
const AzureBlob = require('../azureBlob').AzureBlob;

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

const insertMessage = async (message) => {
    const azureQueue = new AzureQueue(connectionString, "apirequests");
    console.log("sending message to queue...");
    const result = await azureQueue.insertMessage(message);
    return result;
};

const insertBlob = async (blobName, content) => {
    const azureBlob = new AzureBlob(connectionString, "apirequests");
    console.log("sending details to blob-container...");
    const result = await azureBlob.writeBlob(blobName, content);
    return result;
};


//let data = fs.readFileSync('../../messageTest.json', 'utf8');
//let messageData = JSON.parse(data).filename

let blobData = fs.readFileSync('../../40ca60ec-417b-4124-8dfe-1adbe854a0b3.json', 'utf8');
console.log(typeof blobData)
// let blobTitle = JSON.parse(blobData).GUID;
let titleData = `${JSON.parse(blobData).GUID}`;
//let messageData = '{"filename":"' + titleData + '"}';
//let messageData = `{\"filename\":\"${titleData}\"}`;


// so we are sending the data to a queue and then to the blob container storing the data and the queue points to the title for reference

//TODO map over the data with forEach to send them all to azure

// insertBlob(blobTitle, blobData).then(result => {
//     console.log(result);
// }).catch(err => {
//     console.log(err);
// });


insertMessage(titleData).then(result => {
    console.log(result);
    insertBlob(titleData, blobData).then(result => {
        console.log(result);
    }).catch(err => {
        console.log(err);
    });
}).catch(err => {
    console.log(err);
});


// so later on, when the consumer reads this data, it will read the queue first to know which blobs to grab from and then it will grab them and parse into display in triage page...