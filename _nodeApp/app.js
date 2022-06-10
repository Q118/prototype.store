/**
 * @description This file will read queue messages and organize them and write them to columns in a table
 *
 */

// const AzureBlob = require('./lib/azureBlob').AzureBlob;
const AzureQueue = require('./lib/azureQueue').AzureQueue;
const AzureTable = require('./lib/azureTable').AzureTable;

//! OKAY! we are getting the decrypted messageText in an array of objects! yay
// TOdo next work on sorting those into table
//! like one row per reqID.. and a column for each property in the objects


const connectionString = "DefaultEndpointsProtocol=https;AccountName=accsrusdev;AccountKey=Plumb2Rm3XSJ3aF7sSc8Mm2XiPkZe0ILMIdSAPYhkfqpvGms7SYb/5hLICuewvfWVvjtDkZcWP7MojXpS8TZuA==;BlobEndpoint=https://accsrusdev.blob.core.windows.net/;QueueEndpoint=https://accsrusdev.queue.core.windows.net/;TableEndpoint=https://accsrusdev.table.core.windows.net/;FileEndpoint=https://accsrusdev.file.core.windows.net/;"

// first read 3 messages that have the same requestId
async function readQueue() {
    const azureQueue = new AzureQueue(connectionString, "dev-queue");
    const count = await azureQueue.getCount();
    console.log(`${count} messages in queue`);
    console.log("reading queue...");
    const result = await azureQueue.peekMessages(32);
    let messageArray = [];
    for (const property in result) {
        let encryptMes = Buffer.from(result[property].messageText, 'base64').toString();
        messageArray.push(JSON.parse(encryptMes));
    }
    return messageArray;
}

// async function sortMessages(messageArray) {

// }


readQueue().then(result => {
    console.log(result);
    // sortMessages(result);
}).catch(err => {
    console.log(err);
});



//