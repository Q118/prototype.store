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


async function readQueue() {
    const azureQueue = new AzureQueue(connectionString, "dev-queue");
    const count = await azureQueue.getCount();
    console.log(`${count} messages in queue`);
    console.log("reading queue...");
    const result = await azureQueue.peekMessages(9);
    let messageArray = [];
    for (const property in result) {
        let decryptMes = Buffer.from(result[property].messageText, 'base64').toString();
        messageArray.push(JSON.parse(decryptMes));
    }
    //TODO: here or in another scope, DEQUEUE the messages that have been added to array
    // dequeueMsg(messageArray);
    return messageArray;
}

async function sortMessages(messageArray) {
    let relatedMsgArr = [];
    relatedMsgArr.push(messageArray[0]);

    for (let x = 1; x < messageArray.length; x++) {
        if (relatedMsgArr[0].requestId === messageArray[x].requestId) {
            relatedMsgArr.push(messageArray[x]);
        }
    }
    return relatedMsgArr; // returns an array of 3 objects with the same requestId
}

// async function dequeueMsg(messageArray) {
//     const azureQueue = new AzureQueue(connectionString, "dev-queue");
//     for (let x = 0; x < messageArray.length; x++) {
//         await azureQueue.deleteMessage(messageArray[x].messageId);
//     }
// }

// TODO: add error-handling below if blob doesn't exist for any reason.
async function getBlobDetails(reqId, method) {
    try {
        const azureBlob = new AzureBlob(connectionString, "dev-blobs");
        console.log("reading blob data...");
        let startBlob = await azureBlob.readBlob(`${reqId}-start.json`);
        let bodyBlob = method === "GET" ? {} : await azureBlob.readBlob(`${reqId}-body.json`);
        let resultBlob = await azureBlob.readBlob(`${reqId}-result.json`);
        let blobArray = [startBlob, bodyBlob, resultBlob];
        return blobArray;
    } catch (error) {
        console.log(error)
    }
}

getBlobDetails("51f191d4-52a6-408e-897d-f85909bf345d", "GET").then(result => {
    console.log(result)
}).catch(err => {
    console.log(err)
})

const getIt = (arr, step) => {
    return _.find(arr, { step: step });
}

//! TODO PICK UP HERE! get the details from blob containers for rule, url, etc... you got it! love
async function messagesToRow(relArr) {
    let newRow = {
        PartitionKey: relArr[0].requestId,
        RowKey: "",
        serverTiming: getIt(relArr, 'result').serverTimings,
        url: "will get from blob",
        status: getIt(relArr, 'result').statusCode,
        method: getIt(relArr, 'start').method,
        rule: "will get from blob",
        requestDataType: "will get from blob",
        responseDataType: "will get from blob"
    }
    console.log(newRow); // debug
    return newRow;
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

// main();

