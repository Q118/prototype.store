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
const azureBlob = new AzureBlob(connectionString, "dev-blobs");
//! TODO ADD error-handling got all use-cases!!

// TODO: add a check to see if queue is empty, if it is then done, if not, then keep running main until it is empty

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
        relatedMsgArr.push(messageArray[0]); // pushes in {text: {}, id: ""}
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

// TODO: add error-handling for if blob doesn't exist for any reason.
// doing this now, trying it by seeing the console errors when queue is empty...

async function getBlobURL(reqId, reqMethod) {
    console.log("capturing blob url...")
    try {
        let startBlob = await azureBlob.readBlob(`${reqId}-start.json`);
        startBlob = JSON.parse(startBlob);
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

}
async function getResDataType(reqId, reqMethod) { }


const getIt = (arr, step) => _.find(arr, { step: step });

async function messagesToRow(relArr) {
    try {
        const PartitionKey = relArr[0]?.requestId;
        const method = getIt(relArr, 'start')?.method;
        let newRow = {
            PartitionKey,
            RowKey: "",
            serverTiming: getIt(relArr, 'result')?.serverTimings || "",
            status: getIt(relArr, 'result')?.statusCode || "",
            method,
            url: await getBlobURL(PartitionKey, method) || "",
            rule: await getBlobRules(PartitionKey, method) || "",
            requestDataType: "WIP",
            responseDataType: "WIP"
            // have the two dataTYpes, I believe is enough to suffice the developer investigating the calls. 
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


async function main() {
    //TODO: ADD---- while count is > 0, do all this stuff
    // once it is zero, then done and exit the loop
    const count = await azureQueue.getCount();
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
        // ! commenting out above so can work in dev, come back and uncomment later.
        return;
    } catch (error) {
        console.log(error);
    }
}

main().then(() => {
    console.log("done!");
}).catch(err => {
    console.log(err);
});

