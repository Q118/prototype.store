/** This file to test
 * the methods 
 * of newQueue.js & newBlob.js
*/

const { AzureQueue } = require('./newAzureQueue.js');
const { AzureBlob } = require('./newAzureBlob.js');

require('dotenv').config({ path: __dirname + '/.env' });
const accountName = process.env.ACCOUNT_NAME;
const accountKey = process.env.ACCOUNT_KEY;

const azureQueue = new AzureQueue('dev-queue', accountName, accountKey);
const azureBlob = new AzureBlob(accountName, accountKey, 'dev2');

async function deleteBlob() {
    try {
        let result = await azureBlob.deleteBlob('test2.json');
        console.log("blob deleted successfully")
        return result;
    } catch (error) {
        console.log(error)
    }
}
deleteBlob().then(result => {
    console.log(result)
}).catch(err => {
    console.log(err)
})



async function writeToBlob() {
    try {
        let result = await azureBlob.writeBlob('test2.json', '{"test": "foo2"}');
        // console.log(result) // debug
        return result;
    } catch (error) {
        console.log(error)
    }
}
// writeToBlob().then(result => {
//     console.log(result)
// }).catch(err => {
//     console.log(err)
// })

async function readBlob() {
    try {
        let result = await azureBlob.readBlob('test2.json');
        // console.log(result) // debug
        return result;
    } catch (error) {
        console.log(error)
    }
}
// readBlob().then(result => {
//     console.log(result)
// }).catch(err => {
//     console.log(err)
// })


async function readQueue() {
    try {
        let result = await azureQueue.peekMessageText();
        // console.log(result) // debug
        result = JSON.parse(Buffer.from(result, 'base64').toString());
        
        // let result = await azureQueue.peekMessageId();
        
        return result;
    } catch (error) {
        console.log(error)
    }
}

async function getData() {
    try {
        let result = await azureQueue.peekMessageData();
        // console.log(result) // debug
        return result;
    } catch (error) {
        console.log(error)
    }
} //? use in combo with delete to dequeue the message appropriately

async function writeToQueue(message) {
    try {
        let result = await azureQueue.insertMessage(message);
        // console.log(result) // debug
        return result;
    } catch (error) {
        console.log(error)
    }
}


async function deleteMessage() {
    try {
        let result = await azureQueue.deleteMessage();
        // console.log(result) // debug
        return result;
    } catch (error) {
        console.log(error)
    }
}
// deleteMessage().then(result => {
//     console.log(result)
// }).catch(err => {
//     console.log(err)
// })


// we check below
// getData().then(result => {
//     console.log(result)
// }).catch(err => {
//     console.log(err)
// })

// writeToQueue("I am a cute message").then(result => {
//     console.log(result)
// }).catch(err => {
//     console.log(err)
// })