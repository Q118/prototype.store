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
        console.log(msgArr[0].text)
        return msgArr[0].text;
    } catch (error) {
        console.log(error)
    }
}

readQueue().then(result => {
    sortMessages(result).then(result => {
        console.log(result)
    }).catch(error => {
        console.log(error)
    })
}).catch(error => {
    console.log(error)
});

async function sortMessages(msgObj) {
    if (msgObj === undefined) return;
    // this will eventually be the main() and chain the functions based on case
    let result;
    switch (msgObj?.step) {
        case "start":
            result = await handleStartAdd(msgObj)
            // console.log("start")
            return result;
        case "body":
            result = await handleBodyAdd(msgObj)
            return result;
        case "result":
            result = await handleResultAdd(msgObj)
            return result;
        default: throw new Error(`Unknown step in ${msgObj}`);
    }
}

async function handleStartAdd(msgObj) {
    console.log("handling start...")
    try {
        const PartitionKey = msgObj?.requestId;
        let rowExists = await checkRowExists(msgObj);
        if (rowExists) {
            // then we update the row
            let objToAdd = {
                PartitionKey,
                RowKey: "",
                method: msgObj.method,
            }
            await handleEntity(objToAdd);
        } else {
            // then we create a new row
            //TODO: add a new row to the table
            //? but hold up... maybe we dont need an else bc merging will work whether it exists or not.
            // like below works the same!! I just tested it and it does... omg so i dont even have to check the existence!!!
            //! ywp dd it again from app.js and YES it works whether exists or not.
            let objToAdd = {
                PartitionKey,
                RowKey: "",
                method: msgObj.method,
            }
            await handleEntity(objToAdd);
        }
    } catch (error) {
        console.log(error)
    }
}

//! DO WE even need this function? because there is no data in the bodyQueue...
        // Yes bc we need it will get data from the BLOB.
async function handleBodyAdd(msgObj) {
    console.log("handling result...")
    try {
        const PartitionKey = msgObj?.requestId;
        let rowExists = await checkRowExists(msgObj);
        if (rowExists) {
            // then we update the row
            let objToAdd = {
                PartitionKey,
                RowKey: "",
                method: msgObj.method,
            }
            await handleEntity(objToAdd);
        } else {
            // then we create a new row
        }
    } catch (error) {
        console.log(error)
    }
}

async function handleResultAdd(msgObj) {
    console.log("handling result...")
    try {
        let rowExists = await checkRowExists(msgObj);
        if (rowExists) {
            // then we update the row
        } else {
            // then we create a new row
        }
    } catch (error) {
        console.log(error)
    }
}

async function checkRowExists(msgObj) {
    let rowExists = false;
    const callTracking = new CallTracking();
    await callTracking.init();
    rowExists = await callTracking.doesEntityExist(msgObj.requestId);
    return rowExists;
}
// #endregion

async function messagesToRow(relArr) {
    try {
        const PartitionKey = relArr[0]?.requestId;
        const method = getIt(relArr, 'start')?.method;
        let newRow = {
            PartitionKey,
            RowKey: "",
            serverTiming: getIt(relArr, 'result')?.serverTiming || "",
            status: getIt(relArr, 'result')?.statusCode || "",
            method,
            url: await getBlobURL(PartitionKey) || "",
            rule: await getBlobRules(PartitionKey, method) || "",
            requestDataType: await getReqDataType(PartitionKey, method) || "",
            responseDataType: await getResDataType(PartitionKey) || "",
            // having the two dataTypes, I believe is enough to suffice the developer investigating the calls. 
            // bc they can infer by the type, what kind of action is happening.
        }
        return newRow;
    } catch (error) {
        console.log(error)
    }
}

async function handleEntity(dataRow) {
    try {
        let callTracking = new CallTracking();
        await callTracking.init();
        // console.log(callTracking.table.tableStruct); // debug
        await callTracking.merge(dataRow);
        console.log("data sent to table! Data: ")
        console.log(dataRow);
    } catch (error) {
        console.log(error)
    }
};