/**
* @description This file will read queue messages, 
* organize them with associated blobs,
* and write them to columns in a table... asynchronously
* TODO set up timer to run this file every x minutes
*/
const AzureBlob = require('./lib/azureBlob').AzureBlob;
const AzureQueue = require('./lib/azureQueue').AzureQueue;
const CallTracking = require('./models/CallTracking').CallTracking;

const _ = require('lodash');
require('dotenv').config({ path: __dirname + '/.env' });

//TODO add config and tenantLOgic to this file, using below for now during dev
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

const azureQueue = new AzureQueue(connectionString, "dev-queue");
const azureBlob = new AzureBlob(connectionString, "dev-blobs");

//! i do wonder if I should have a global objToAdd {} and use the ... operator to add to it

/*
TODO: still need to consider more outliers.. i.e how to grab rule data from a /compile route
TODO: test out lesser used calls to ensure able to parse all of them
*/

async function readQueue() {
    try {
        const result = await AzureQueue.peekMessages(connectionString, "dev-queue", 1);
        // console.log(result) // debug
        let msgArr = [];
        for (const property in result) {
            let decryptMes = Buffer.from(result[property].messageText, 'base64').toString();
            let messageObj = {
                text: JSON.parse(decryptMes),
                id: result[property].messageId
            }
            msgArr.push(messageObj);
        }
        return msgArr[0]; // {text: {}, id: ""}
    } catch (error) {
        console.log(error)
    }
}

async function sortMessages(msgObj) {
    if (msgObj?.text === undefined) return;
    switch (msgObj?.text?.step) {
        case "start":
            return await handleStartAdd(msgObj);
        case "body":
            return await handleBodyAdd(msgObj);
        case "result":
            return await handleResultAdd(msgObj);
        default: throw new Error(`Unknown step in ${msgObj}`);
    }
}


/**
 * Data Fetching from Blobs
 */
async function getURL(reqId) {
    console.log("capturing blob url...")
    try {
        let startBlob = await azureBlob.readBlob(`${reqId}-start.json`);
        const blobURL = JSON.parse(startBlob).url || "";
        return blobURL;
    } catch (error) {
        console.log(error)
    }
}

async function getReqDataType(reqId) {
    console.log("capturing request data type...")
    try {
        let bodyBlob = await azureBlob.readBlob(`${reqId}-body.json`);
        if (bodyBlob === "{}") {
            return "n/a";
        }
        bodyBlob = JSON.parse(bodyBlob);
        let dataArr = bodyBlob?.data || "";
        let dataType = Array.isArray(dataArr) ? dataArr.map(data => data.type).join(", ") : dataArr;
        return dataType;
    } catch (error) {
        console.log(error)
    }
}

async function getResDataType(reqId) {
    console.log("capturing response data type...")
    try {
        let resultBlob = await azureBlob.readBlob(`${reqId}-result.json`);
        if (resultBlob === undefined) return "";
        resultBlob = JSON.parse(resultBlob).response;
        let dataArr = resultBlob?.data || "";
        let dataType = Array.isArray(dataArr) ? dataArr.map(data => data.type).join(", ") : dataArr.type;
        return dataType;
    } catch (error) {
        console.log(error)
    }
}

/** 
 * getBlobRules()
 * @returns {Promise<String>}
 * will return either one rule thats evaluated or an 
 * array of rules being evaluated.. all *as* string.
*/
async function getBlobRules(reqId) {
    console.log("capturing blob rule(s)...")
    try {
        let bodyBlob = await azureBlob.readBlob(`${reqId}-body.json`);
        if (bodyBlob === "{}") {
            return "n/a";
        }
        let resultBlob = await azureBlob.readBlob(`${reqId}-result.json`);
        resultBlob = JSON.parse(resultBlob).response;
        let resultData = resultBlob?.data?.attributes || resultBlob?.data;
        let blobRule = resultData?.rule?.input || resultData?.triggeredRules || "";
        if (typeof blobRule !== "string" && blobRule !== undefined) {
            let rules = [];
            blobRule.forEach(element => {
                rules.push(element.expression);
            });
            rules = rules.join(", ");
            return rules;
        }
        return blobRule;
    } catch (error) {
        console.log(error)
    }
}


/**
 * Object Builders
 */
async function handleStartAdd(msgObj) {
    console.log("handling start...")
    try {
        const PK = msgObj?.text?.requestId;
        let objToAdd = {
            PartitionKey: PK,
            RowKey: "",
            method: msgObj?.text?.method || "",
            url: await getURL(PK),
        }
        return objToAdd;
    } catch (error) {
        console.log(error)
    }
}

async function handleBodyAdd(msgObj) {
    console.log("handling body...")
    try {
        const PK = msgObj?.text?.requestId;
        let objToAdd = {
            PartitionKey: PK,
            RowKey: "",
            rule: await getBlobRules(PK) || "",
            requestDataType: await getReqDataType(PK) || "",
            responseDataType: await getResDataType(PK) || "",
        }
        return objToAdd;
    } catch (error) {
        console.log(error)
    }
}

async function handleResultAdd(msgObj) {
    console.log("handling result...")
    try {
        const PK = msgObj?.text?.requestId;
        const serverTiming = msgObj?.text?.serverTiming;
        const status = msgObj?.text?.statusCode;
        let objToAdd = {
            PartitionKey: PK,
            RowKey: "",
            status,
            serverTiming,
        }
        return objToAdd;
    } catch (error) {
        console.log(error)
    }
}

async function handleEntity(dataRow) {
    if (dataRow === undefined) return;
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

async function dequeueMsg(id) {
    if (id === undefined) return;
    try {
        let popReceipt = await azureQueue.getPopReceipt(id);
        await azureQueue.deleteMessage(id, popReceipt);
        console.log(`deleted message ${id}`)
    } catch (error) {
        console.log(error)
    }
}

async function main() {
    //? keep going until all messages are used up? or nah.. handle that another way... bc can just call this whole file x amount of times with webJobs...
    // if we do end up looping, could use the 'count' to keep track of how many messages are left in the queue.
    // while (1 === 1) {
    try {
        let readResult = await readQueue();
        let objToAdd = await sortMessages(readResult);
        await handleEntity(objToAdd);
        await dequeueMsg(readResult?.id); // then delete the message once above line runs successfully.
    } catch (error) {
        console.log(error)
    }
    // }
}



main().then(() => {
    console.log("done!");
}).catch(err => {
    console.log(err);
});

