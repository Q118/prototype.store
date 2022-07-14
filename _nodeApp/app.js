/**
* @description This file will read queue messages, 
* organize them with associated blobs,
* and write them to columns in a table asynchronously
* TODO set up timer to run this file every x minutes in Azure Webjobs
* ? will this be set up FOR EACH tenant OR for the whole app and logic to differentiate the tenants?
*/

/** Lib */
//! const AzureBlob = require('./lib/azureBlob').AzureBlob;
const AzureBlob = require('../Migration/newAzureBlob').AzureBlob;


// const AzureQueue = require('./lib/azureQueue').AzureQueue;
//! tried the new one and tested working here
const AzureQueue = require('../Migration/newAzureQueue').AzureQueue;


/** Models */
const ApiRequest = require('./models/ApiRequest').ApiRequest;
//! trying the new table by using it in ^^


require('dotenv').config({ path: __dirname + '/.env' });

//TODO get the string dynamically, using below for now during development.. 
// const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const accountName = process.env.ACCOUNT_NAME;
const accountKey = process.env.ACCOUNT_KEY;

//TODO: Explore using timestamp of server rather than azure supplied


//! const azureQueue = new AzureQueue(connectionString, "dev-queue");
const azureQueue = new AzureQueue("dev-queue", accountName, accountKey);


//!const azureBlob = new AzureBlob(connectionString, "dev-blobs");
const azureBlob = new AzureBlob(accountName, accountKey, "dev-blobs");


async function readQueue() {
    try {
        //!const result = await azureQueue.getMessages(connectionString, "dev-queue");
        const result = await azureQueue.getMessages();
        // console.log(result); // debug
        if (result === undefined) return;
        let decryptMes = Buffer.from(result.messageText, 'base64').toString();
        let messageObj = {
            text: JSON.parse(decryptMes),
            id: result.messageId,
            popReceipt: result.popReceipt
        }
        return messageObj; // {text: {}, id: "", popReceipt: ""}
    } catch (error) {
        throw new Error(error);
    }
}

async function handleMessages(msgObj) {
    if (msgObj?.text === undefined) return;
    let objToAddToTable;
    switch (msgObj?.text?.step) {
        case "start": objToAddToTable = await handleStartAdd(msgObj); break;
        case "body": objToAddToTable = await handleBodyAdd(msgObj); break;
        case "result": objToAddToTable = await handleResultAdd(msgObj); break;
        default: throw new Error(`Unknown step in ${msgObj}`);
    }
    await upsertApiRequest(objToAddToTable);
}


/**
 * Data Fetching from Blobs
 */
async function getDataFromStartBlob(reqId) {
    console.log("capturing start-blob data...")
    let blobData = {};
    let url = "", params = "", IP = "", machineName = "";
    try {
        let startBlob = await azureBlob.readBlob(`${reqId}-start.json`);
        const URLfromBlob = JSON.parse(startBlob).url || "";

        if (`${URLfromBlob}`.includes('?')) {
            // parse out the params if they exist
            url = URLfromBlob.split("?")[0];
            let paramArray = URLfromBlob.split("?")[1].split("&").filter(x => x.length > 0)
            params = paramArray.join(", ");
        } else { url = URLfromBlob; params = "n/a"; }

        IP = JSON.parse(startBlob).IP || "";
        machineName = JSON.parse(startBlob).machineName || "";
        blobData = { url, params, IP, machineName };
        return blobData;
    } catch (error) {
        throw new Error(error);
    }
}



/**
 * Object Builders
 */
async function handleStartAdd(msgObj) {
    console.log("handling start...")
    try {
        const PK = msgObj?.text?.requestId || "";
        const startBlob = await getDataFromStartBlob(PK);
        if (startBlob === undefined) return;
        // get data from start blob then parse into properties
        let objToAdd = {
            partitionKey: PK,
            rowKey: "",
            ...msgObj?.text?.method && { method: msgObj.text.method },
            ...startBlob?.url && { url: startBlob.url },
            ...startBlob?.params && { params: startBlob.params },
            ...startBlob?.IP && { iP: startBlob.IP },
            ...startBlob?.machineName && { machineName: startBlob.machineName },
        } // cred: https://stackoverflow.com/a/47892178/13073026
        return objToAdd;
    } catch (error) {
        throw new Error(error);;
    }
}

async function handleBodyAdd(msgObj) {
    console.log("handling body...")
    // we need this function bc if the body-message is read first, will need to set up the initial row 
    try {
        const PK = msgObj?.text?.requestId || "";
        let objToAdd = {
            partitionKey: PK,
            rowKey: "",
        }
        return objToAdd;
    } catch (error) {
        throw new Error(error);
    }
}

async function handleResultAdd(msgObj) {
    console.log("handling result...")
    try {
        const PK = msgObj?.text?.requestId || "";
        const status = msgObj?.text?.statusCode || "";
        const serverTiming = msgObj?.text?.serverTiming || "";
        let objToAdd = {
            partitionKey: PK,
            rowKey: "",
            status,
            serverTiming,
        }
        return objToAdd;
    } catch (error) {
        throw new Error(error);;
    }
}

/**
 * @param {Object} dataRow - object to add to table
 * 
 */ 
async function upsertApiRequest(dataRow) {
    if (dataRow === undefined) return;
    try {
        let apiRequest = new ApiRequest(accountName, accountKey);
        await apiRequest.init();
        // console.log(apiRequest.table.tableStruct); // debug
        await apiRequest.merge(dataRow);
        console.log("data sent to table! Data: ")
        console.log(dataRow);
    } catch (error) {
        throw new Error(error);
    }
};

async function deleteMessage(id, popReceipt) {
    if (id === undefined || popReceipt === undefined) return;
    try {
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
        await handleMessages(readResult);
        // if able to handle message successfully, then delete it
        await deleteMessage(readResult?.id, readResult?.popReceipt);
        readResult = await readQueue();
    }
}



main().then(() => {
    console.log("done!");
}).catch(error => {
    console.error(error)
});

