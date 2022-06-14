/**
 * @description This file will read queue messages and organize them and write them to columns in a table
 *
 */

const AzureBlob = require('./lib/azureBlob').AzureBlob;
const AzureQueue = require('./lib/azureQueue').AzureQueue;
const CallTracking = require('./models/CallTracking').CallTracking;
const _ = require('lodash');

//TODO add config and tenantLOgic to this file using below for now
const connectionString = "DefaultEndpointsProtocol=https;AccountName=accsrusdev;AccountKey=Plumb2Rm3XSJ3aF7sSc8Mm2XiPkZe0ILMIdSAPYhkfqpvGms7SYb/5hLICuewvfWVvjtDkZcWP7MojXpS8TZuA==;BlobEndpoint=https://accsrusdev.blob.core.windows.net/;QueueEndpoint=https://accsrusdev.queue.core.windows.net/;TableEndpoint=https://accsrusdev.table.core.windows.net/;FileEndpoint=https://accsrusdev.file.core.windows.net/;"

const azureQueue = new AzureQueue(connectionString, "dev-queue");

//! TODO ADD error-handling got all use-cases!!

async function readQueue() {

    const count = await azureQueue.getCount();
    console.log(`${count} messages in queue`);
    console.log("reading queue...");
    const result = await azureQueue.peekMessages(9);
    // console.log(result) // debug
    let msgArr = [];
    // let msgIdArr = [];
    for (const property in result) {
        let decryptMes = Buffer.from(result[property].messageText, 'base64').toString();

        let messageObj = {
            text: JSON.parse(decryptMes),
            id: result[property].messageId
        }
        msgArr.push(messageObj);
        // msgTxtArr.push(JSON.parse(decryptMes));
        // msgIdArr.push(result[property].messageId);
    }
    //TODO: here or in another scope, DEQUEUE the messages that have been added to array
    // dequeueMsg(msgIdArr);
    console.log("msgArrL")
    console.log(msgArr)
    return msgArr;
}
//!! its deleting! but all 9 them, so try to move the deletion into the sorted scope? pass along the idArray... or another function to handle the id getting yes do that and yra can call in main.
async function sortMessages(messageArray) {
    let relatedMsgArr = [];
    let idArray = [];
    relatedMsgArr.push(messageArray[0].text);
    idArray.push(messageArray[0].id);
    for (let x = 1; x < messageArray.length; x++) {
        if (relatedMsgArr[0].requestId === messageArray[x].text.requestId) {
            relatedMsgArr.push(messageArray[x].text);
            idArray.push(messageArray[x].id);
            console.log("this should print 2x")
        }
    }
    dequeueMsg(idArray); // remove processed messages from queue
    
    console.log("id array: ")

    console.log(idArray)

    console.log("related msg arr: ")
    console.log(relatedMsgArr)
    return relatedMsgArr; 
    // returns an array of 3 {}s with the same requestId
}

async function dequeueMsg(idArray) {
    try {
        for (let x = 0; x < idArray.length; x++) {
            let popReceipt = await azureQueue.getPopReceipt(idArray[x]);
            await azureQueue.deleteMessage(idArray[x], popReceipt);
            console.log(`deleted message ${idArray[x]}`)
        }
    } catch (error) {
        console.log(error)
    }
}

// TODO: add error-handling below if blob doesn't exist for any reason.
async function getBlobData(reqId, method) {
    try {
        const azureBlob = new AzureBlob(connectionString, "dev-blobs");
        console.log("reading blob data...");
        let startBlob = await azureBlob.readBlob(`${reqId}-start.json`);
        startBlob = JSON.parse(startBlob);
        let bodyBlob = method === "GET" ? "{}" : await azureBlob.readBlob(`${reqId}-body.json`);
        bodyBlob = JSON.parse(bodyBlob);
        let resultBlob = await azureBlob.readBlob(`${reqId}-result.json`);
        resultBlob = JSON.parse(resultBlob);
        let blobArray = [startBlob, bodyBlob, resultBlob];
        return blobArray;
    } catch (error) {
        console.log(error)
    }
}

// console log before this gets called console.log("gathering blob details...")
async function getBlobURL(reqId, reqMethod) {
    try {
        const blobArray = await getBlobData(reqId, reqMethod);
        console.log(blobArray);
        const blobURL = _.find(blobArray, { method: reqMethod }).url;
        console.log(blobURL);
        return blobURL;
    } catch (error) {
        console.log(error)
    }
}


const getIt = (arr, step) => {
    return _.find(arr, { step: step });
}

//! TODO refactor to try/catch block
async function messagesToRow(relArr) {
    try {
        const PartitionKey = relArr[0].requestId;
        // const url = await getBlobURL(PartitionKey, relArr[0].method);
        const method = getIt(relArr, 'start').method;
        let newRow = {
            PartitionKey,
            RowKey: "",
            serverTiming: getIt(relArr, 'result').serverTimings,
            status: getIt(relArr, 'result').statusCode,
            method,
            url: await getBlobURL(PartitionKey, method),
            rule: "will get from blob",
            requestDataType: "will get from blob",
            responseDataType: "will get from blob"
        }
        console.log(newRow); // debug
        return newRow;
    } catch (error) {
        console.log(error)
    }
}

async function handleNewEntity(dataRow) {
    let callTracking = new CallTracking();
    await callTracking.init();
    // console.log(callTracking.table.tableStruct); // debug
    await callTracking.merge(dataRow);
    console.log("data sent to table!")
}


async function main() {
    try {
        let readResult = await readQueue();

        let sortedResult = await sortMessages(readResult);

        console.log(sortedResult);

        let rowObject = await messagesToRow(sortedResult);

        await handleNewEntity(rowObject);

    } catch (error) {
        console.log(error);
    }
}

main();

