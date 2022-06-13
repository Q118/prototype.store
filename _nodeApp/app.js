/**
 * @description This file will read queue messages and organize them and write them to columns in a table
 *
 */

// const AzureBlob = require('./lib/azureBlob').AzureBlob;
const AzureQueue = require('./lib/azureQueue').AzureQueue;
// const { AzureTable, AzureTableStruct } = require('./lib/azureTable');

const  CallTracking  = require('./models/CallTracking').CallTracking;


//! like one row per reqID.. and a column for each property in the objects

//TODO add config and tenantLOgic to this file using below for now
const connectionString = "DefaultEndpointsProtocol=https;AccountName=accsrusdev;AccountKey=Plumb2Rm3XSJ3aF7sSc8Mm2XiPkZe0ILMIdSAPYhkfqpvGms7SYb/5hLICuewvfWVvjtDkZcWP7MojXpS8TZuA==;BlobEndpoint=https://accsrusdev.blob.core.windows.net/;QueueEndpoint=https://accsrusdev.queue.core.windows.net/;TableEndpoint=https://accsrusdev.table.core.windows.net/;FileEndpoint=https://accsrusdev.file.core.windows.net/;"


async function readQueue() {
    const azureQueue = new AzureQueue(connectionString, "dev-queue");
    const count = await azureQueue.getCount();
    console.log(`${count} messages in queue`);
    console.log("reading queue...");

    const result = await azureQueue.peekMessages(10);

    let messageArray = [];
    for (const property in result) {
        let decryptMes = Buffer.from(result[property].messageText, 'base64').toString();
        messageArray.push(JSON.parse(decryptMes));
    }
    //TODO: here or in another scope, DEQUEUE the messages that have been added to array
    return messageArray;
}

async function sortMessages(messageArray) {
    let relatedMsgArr = [];
    relatedMsgArr.push(messageArray[0]);

    for (let x = 0; x < messageArray.length; x++) {
        if (relatedMsgArr[0].requestId === messageArray[x].requestId) {
            relatedMsgArr.push(messageArray[x]);
        }
    }
    return relatedMsgArr; // returns an array of 3 objects with the same requestId
}


const newRow = {
    PartitionKey: 'is',
    RowKey: 'x',
    ServerTiming: 'this',
    URL: 'x',
    Status: 'x',
    Rule: 'x',
    RequestDataType: 'working?',
    ResponseDataType: 'x',
    Method: 'x',
}


async function handleNewRow() {
    let callTracking = new CallTracking();

    await callTracking.init();

   let resp = await callTracking.merge(newRow)

    return resp;
}


handleNewRow().then(result => {
    console.log(result);
}).catch(err => {
    console.log(err);
});


// readQueue().then(result => {
//     // console.log(result);
//     sortMessages(result).then(result => {
//         console.log(result);
//     }).catch(err => {
//         console.log(err);
//     })
// }).catch(err => {
//     console.log(err);
// });
