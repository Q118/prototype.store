/**
 * @description This file will read queue messages and organize them and write them to columns in a table
 *
 */

const AzureBlob = require('./lib/azureBlob').AzureBlob;
const AzureQueue = require('./lib/azureQueue').AzureQueue;
const CallTracking = require('./models/CallTracking').CallTracking;
const _ = require('lodash');
require('dotenv').config({ path: __dirname + '/.env' });
//! YOU NEED TO DO IT LIKE THIS EVERYWHERE for debugging esp



//TODO add config and tenantLOgic to this file using below for now
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

const azureQueue = new AzureQueue(connectionString, "dev-queue");
const azureBlob = new AzureBlob(connectionString, "dev-blobs");



async function readQueue() {
    try {
        const result = await AzureQueue.peekMessages(connectionString, "dev-queue", 1);
        //  console.log(result) // debug
        let msgArr = [];
        for (const property in result) {
            let decryptMes = Buffer.from(result[property].messageText, 'base64').toString();
            let messageObj = {
                text: JSON.parse(decryptMes),
                id: result[property].messageId
            }
            msgArr.push(messageObj);
        }
        return msgArr[0].text;
    } catch (error) {
        console.log(error)
    }
}

// readQueue().then(result => {
//     sortMessages(result).then(result => {
//         console.log(result)
//     }).catch(error => {
//         console.log(error)
//     })
// }).catch(error => {
//     console.log(error)
// });

async function sortMessages(msgObj) {
    // this will eventually be the main() and chain the functions based on case
    switch (msgObj?.step) {
        case "start":
            let result = await handleStartAdd(msgObj)
            // console.log("start")
            return result;
        case "body":
            await handleBodyAdd(msgObj)
            return;
        case "result":
            await handleResultAdd(msgObj)
            return;
        default: throw new Error(`Unknown type ${msgObj}`);
    }
}

async function handleStartAdd(msgObj) {
    console.log("handling start...")
    // check first if there is already an entity in the table with the PartitionKey === msgObj.id
    // if there is, then update the entity
    // if there is not, then create a new entity
    let rowExists = false;
    // console.log(msgObj)
    try {
        const callTracking = new CallTracking();
        await callTracking.init();
        rowExists = await callTracking.doesEntityExist(msgObj.requestId);
        return rowExists;
    } catch (error) {
        console.log(error)
    }
}

handleStartAdd({
    requestId: 'de36956f-236b-452d-8345-f0d1145e243e',
    step: 'start',
    method: 'POST'
}).then(result => {console.log(result)}).catch(error => {console.log(error)})

// async function main() {
//     try {
//         let readResult = await readQueue();

//         let sortedResult = await sortMessages(readResult);

//         console.log(sortedResult)
//         // console.log(sortedResult); //debug
//         // let rowObject = await messagesToRow(sortedResult.map(message => message?.text));
//         // await handleNewEntity(rowObject);
//         // delete messages once successfully recorded on table:
//         // await dequeueMsg(sortedResult.map(msg => msg.id));
//         // ! comment out above during dev to not delete.
//         // count = await azureQueue.getCount(); // retrieve new count for the loop.
//     } catch (error) {
//         console.log(error);
//     }
// }





//  main().then(() => {
//      console.log("done!");
//  }).catch(err => {
//      console.log(err);
//  });

