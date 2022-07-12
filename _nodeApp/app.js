/**
* @description This file will read queue messages, 
* organize them with associated blobs,
* and write them to columns in a table asynchronously
* TODO set up timer to run this file every x minutes in Azure Webjobs
* ? will this be set up FOR EACH tenant OR for the whole app and logic to differentiate the tenants?
*/

/** Lib */
const AzureBlob = require('./lib/azureBlob').AzureBlob;
const AzureQueue = require('./lib/azureQueue').AzureQueue;
/** Models */
const ApiRequest = require('./models/ApiRequest').ApiRequest;

require('dotenv').config({ path: __dirname + '/.env' });

//TODO get the string dynamically, using below for now during development.. 
//waiting to talk to curt about design and question above before implementing further..the blob holds the connectionString for tenant... but starting out... knowing where to go
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;




//TODO: Explore using timestamp of server rather than azure supplied


const azureQueue = new AzureQueue(connectionString, "dev-queue");
const azureBlob = new AzureBlob(connectionString, "dev-blobs");



async function readQueue() {
    try {
        const result = await AzureQueue.peekMessages(connectionString, "dev-queue", 1);
        //! change this to use getMessages() instead...

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


// async function getURL(reqId) {
//     console.log("capturing blob url...")
//     try {
//         let startBlob = await azureBlob.readBlob(`${reqId}-start.json`);
//         const URLfromBlob = JSON.parse(startBlob).url || "";

//         if (`${URLfromBlob}`.includes('?')) {
//             // remove params, if any - & we'll get them later
//             let parsedURL = URLfromBlob.split("?")[0];
//             return parsedURL;
//         }
//         return URLfromBlob;

//     } catch (error) {
//         throw new Error(error);
//     }
// }

// async function getParams(reqId) {
//     console.log("capturing parameters...")
//     try {
//         let startBlob = await azureBlob.readBlob(`${reqId}-start.json`);
//         const URLfromBlob = JSON.parse(startBlob).url || "";
//         if (`${URLfromBlob}`.includes('?')) {
//             let paramArray = URLfromBlob.split("?")[1].split("&").filter(x => x.length > 0)
//             let paramsString = paramArray.join(", ");
//             return paramsString;
//         }
//         return "n/a";
//     } catch (error) {
//         throw new Error(error);
//     }
// }

// Not needed for now..
/*
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
        throw new Error(error);
    }
}
*/
/** 
 * getBlobRules()
 * @returns {Promise<String>}
 * will return either one rule thats evaluated or an 
 * array of rules being evaluated in string form
*/
/*
async function getBlobRules(reqId) {
    console.log("capturing blob rule(s)...")
    try {
        let bodyBlob = await azureBlob.readBlob(`${reqId}-body.json`);
        if (bodyBlob === "{}") {
            return "n/a";
        }
        let resultBlob = await azureBlob.readBlob(`${reqId}-result.json`);
        resultBlob = JSON.parse(resultBlob).response;
        let resultData = resultBlob?.data?.attributes || resultBlob?.data || "";
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
*/

/**
 * Object Builders
 */
async function handleStartAdd(msgObj) {
    console.log("handling start...")
    try {
        const PK = msgObj?.text?.requestId || "";
        const startBlob = await getDataFromStartBlob(PK); 
        // get data from start blob then parse into properties
        const iP = startBlob?.IP || "";
        const url = startBlob?.url || "";
        const params = startBlob?.params || "";
        const method = msgObj?.text?.method || "";
        const machineName = startBlob?.machineName || "";
        let objToAdd = {
            PartitionKey: PK,
            RowKey: "",
            method,
            //?...method: msgObj?.text?.method || "",
            url,
            params,
            iP,
            machineName
        }
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
            PartitionKey: PK,
            RowKey: "",
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
        let apiRequest = new ApiRequest(connectionString);
        await apiRequest.init();
        // console.log(apiRequest.table.tableStruct); // debug
        await apiRequest.merge(dataRow);
        console.log("data sent to table! Data: ")
        console.log(dataRow);
    } catch (error) {
        throw new Error(error);
    }
};

async function deleteMessage(id) {
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
        await handleMessages(readResult);
        // if able to handle message successfully, then delete it
        await deleteMessage(readResult?.id);
        readResult = await readQueue();
    }
}



main().then(() => {
    console.log("done!");
}).catch(error => {
    console.error(error)
});

