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



async function readQueue(count) {
    try {
        const result = await AzureQueue.peekMessages(connectionString, "dev-queue", count);
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
        return msgArr;
    } catch (error) {
        console.log(error)
    }
}

async function sortMessages(messageArray) {
    try {
        let relatedMsgArr = [];
        relatedMsgArr.push(messageArray[0]);
        // pushes in {text: {}, id: ""}
        for (let x = 1; x < messageArray.length; x++) {
            if (relatedMsgArr[0].text.requestId === messageArray[x].text.requestId) {
                relatedMsgArr.push(messageArray[x]);
            }
        }
        return relatedMsgArr;
        // returns an array of 3 {}s with the same text.requestId
    } catch (error) {
        console.log(error)
    }
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

async function getBlobURL(reqId) {
    console.log("capturing blob url...")
    try {
        let startBlob = await azureBlob.readBlob(`${reqId}-start.json`);
        startBlob = JSON.parse(startBlob) || "";
        const blobURL = startBlob.url || "";
        return blobURL;
    } catch (error) {
        console.log(error)
    }
}

async function getBlobRules(reqId, reqMethod) {
    console.log("capturing blob rule(s)...")
    try {
        if (reqMethod === "GET") {
            let blobRule = "n/a"
            return blobRule;
        }
        let resultBlob = await azureBlob.readBlob(`${reqId}-result.json`);
        resultBlob = JSON.parse(resultBlob);
        let resultData = resultBlob?.response?.data?.attributes;
        let blobRule = resultData?.rule?.input || resultData?.triggeredRules || "n/a";
        if (typeof blobRule !== "string" && blobRule !== undefined) {
            let rules = [];
            blobRule.forEach(element => {
                rules.push(element.expression);
            });
            rules = rules.join(", ");
            return rules;
        }
        return blobRule;
        // will return either one rule thats evaluated or an array of rules being evaluated
    } catch (error) {
        console.log(error)
    }
}

async function getReqDataType(reqId, reqMethod) {
    console.log("capturing request data type...")
    try {
        if (reqMethod === "GET") {
            let dataType = "n/a"
            return dataType;
        }
        let bodyBlob = await azureBlob.readBlob(`${reqId}-body.json`);
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
        resultBlob = JSON.parse(resultBlob).response;
        let dataArr = resultBlob?.data || "";
        let dataType = Array.isArray(dataArr) ? dataArr.map(data => data.type).join(", ") : dataArr.type;
        return dataType;
    } catch (error) {
        console.log(error)
    }
}

const getIt = (arr, step) => _.find(arr, { step: step });

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

async function handleNewEntity(dataRow) {
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


/**
 * 
 * @param {{}} obj 
 * @param {*} data 
 * @returns 
 */
 async function evalObj(obj, data) {
    switch (obj.type) {
        case "serverTiming":
            return data;
        default: throw new Error(`Unknown type ${obj.type}`);
    }
}

async function main() {
    let count = await azureQueue.getCount();
    //TODO case statement.. read my message... based on type call a different function
    while (count > 0) {
        console.log(`${count} messages in queue`);
        if (count < 3) { return; }
        try {
            let readResult = await readQueue(count);
            let sortedResult = await sortMessages(readResult);
            // console.log(sortedResult); //debug
            let rowObject = await messagesToRow(sortedResult.map(message => message?.text));
            await handleNewEntity(rowObject);
            // delete messages once successfully recorded on table:
            await dequeueMsg(sortedResult.map(msg => msg.id));
            // ! comment out above during dev to not delete.
            count = await azureQueue.getCount(); // retrieve new count for the loop.
        } catch (error) {
            console.log(error);
        }
    }
}


main().then(() => {
    console.log("done!");
}).catch(err => {
    console.log(err);
});

