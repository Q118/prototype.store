/** This file to test
 * the methods 
 * of newQueue.js 
*/

const { AzureQueue } = require('./newQueue.js');


require('dotenv').config({ path: __dirname + '/.env' });
const accountName = process.env.ACCOUNT_NAME;
const accountKey = process.env.ACCOUNT_KEY;

const azureQueue = new AzureQueue('dev-queue', accountName, accountKey);

async function readQueue() {
    try {
        let result = await azureQueue.peekMessages();
        // console.log(result) // debug
        result = JSON.parse(Buffer.from(result, 'base64').toString());
        return result;
    } catch (error) {
        console.log(error)
    }
}

async function writeToQueue(message) {
    try {
        let result = await azureQueue.insertMessage(message);
        // console.log(result) // debug
        return result;
    } catch (error) {
        console.log(error)
    }
}


writeToQueue("I am a cute message").then(result => {
    console.log(result)
}).catch(err => {
    console.log(err)
})