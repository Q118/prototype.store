/**
* @description This file will read queue messages, 
* organize them with associated blobs,
* and write them to columns in a table... asynchronously
* TODO set up timer to run this file every x minutes in Azure Webjobs
* ? will this be set up FOR EACH tenant OR for the whole app and logic to differentiate the tenants?
*/
const AzureBlob = require('./lib/azureBlob').AzureBlob;
const AzureQueue = require('./lib/azureQueue').AzureQueue;
const CallTracking = require('./models/CallTracking').CallTracking;

require('dotenv').config({ path: __dirname + '/.env' });

//TODO get the string dynamically, using below for now during development.. 
//waiting to talk to curt about design and question above before implementing further
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
// the blob holds the connectionString for tenant... but starting out... knowing where to go

const azureQueue = new AzureQueue(connectionString, "dev-queue");
const azureBlob = new AzureBlob(connectionString, "dev-blobs");



async function readQueue() {
    try {
        const result = await AzureQueue.peekMessages(connectionString, "dev-queue", 1);
        // change this to use getMessages() instead...

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
        throw new Error(error);
    }
}

async function handleMessages(msgObj) {
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
        throw new Error(error);
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
        throw new Error(error);
    }
}
// May not actually need to get req or res data type...
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
        throw new Error(error);;
    }
}

/** 
 * getBlobRules()
 * @returns {Promise<String>}
 * will return either one rule thats evaluated or an 
 * array of rules being evaluated in string form
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
        throw new Error(error);;
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
        throw new Error(error);;
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
        throw new Error(error);;
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
        throw new Error(error);;
    }
}

async function upsertApiRequest(dataRow) {
    if (dataRow === undefined) return;
    try {
        let callTracking = new CallTracking(); //ApiRequests
        await callTracking.init();
        // console.log(callTracking.table.tableStruct); // debug
        await callTracking.merge(dataRow);
        console.log("data sent to table! Data: ")
        console.log(dataRow);
    } catch (error) {
        throw new Error(error);
    }
};

async function deleteMessage(id) { // change to deleteMsg
    if (id === undefined) return;
    try {
        let popReceipt = await azureQueue.getPopReceipt(id);
        await azureQueue.deleteMessage(id, popReceipt);
        console.log(`deleted message ${id}`)
    } catch (error) {
        throw new Error(error);
    }
}



async function main() {
    let readResult;
    readResult = await readQueue();
    while (readResult !== undefined) {
        let objToAdd = await handleMessages(readResult);
        //TODO put below inside handleMessages.
        await upsertApiRequest(objToAdd);

        // if able to handle message, then delete it
        await deleteMessage(readResult?.id);
        readResult = await readQueue();
    }
}



main().then(() => {
    console.log("done!");
}).catch(error => {
    console.error(error)
    //throw new Error(error);;
});

