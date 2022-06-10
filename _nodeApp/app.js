
/**
 * @description This file will read queue messages and organize them and write them to columns in a table
 *
 */


// const AzureBlob = require('./lib/azureBlob').AzureBlob;
const AzureQueue = require('./lib/azureQueue').AzureQueue;
const AzureTable = require('./lib/azureTable').AzureTable;

const { Decoder } = require('azure-storage').QueueMessageEncoder.TextXmlQueueMessageEncoder;

const connectionString = "DefaultEndpointsProtocol=https;AccountName=accsrusdev;AccountKey=Plumb2Rm3XSJ3aF7sSc8Mm2XiPkZe0ILMIdSAPYhkfqpvGms7SYb/5hLICuewvfWVvjtDkZcWP7MojXpS8TZuA==;BlobEndpoint=https://accsrusdev.blob.core.windows.net/;QueueEndpoint=https://accsrusdev.queue.core.windows.net/;TableEndpoint=https://accsrusdev.table.core.windows.net/;FileEndpoint=https://accsrusdev.file.core.windows.net/;"

// first read 3 messages that have the same requestId
const readQueue = async () => {
    const azureQueue = new AzureQueue(connectionString, "dev-queue");
    const count = await azureQueue.getCount();

    console.log(`${count} messages in queue`);
    console.log("reading queue...");

    const result = await azureQueue.peekMessages(3);
    for (const property in result) {
        let encryptMes = Buffer.from(result[property].messageText, 'base64').toString();
        titleArray.push(encryptMes);
    }
    return queueArray;
}

readQueue().then(result => {
    console.log(result);
}).catch(err => {
    console.log(err);
});



//