const http = require("http");
const fs = require("fs");

/**
 * @summary use `QueueServiceClient` to create a queue and send/receive/delete messages
 */


const { QueueServiceClient, StorageSharedKeyCredential } = require("@azure/storage-queue");

require("dotenv").config();

async function main(x) {
    // const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
    const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const queueServiceClient = QueueServiceClient.fromConnectionString(connString);

    console.log(`Queues`);
    for await (const queue of queueServiceClient.listQueues()) {
        console.log(`- ${queue.name}`);
    }

    // Create a new queue.
    const queueName = `apirequests${new Date().getTime()}`;
    const queueClient = queueServiceClient.getQueueClient(queueName);
    const createQueueResponse = await queueClient.create();
    console.log(
        `Created queue ${queueClient.name} successfully, service assigned request ID: ${createQueueResponse.requestId}`
    );

    // Send a message into the queue using the sendMessage method.
    const enqueueQueueResponse = await queueClient.sendMessage(x);
    console.log(
        `Sent message successfully, service assigned message ID: ${enqueueQueueResponse.messageId}, service assigned request ID: ${enqueueQueueResponse.requestId}`
    );
}

// main().then(() => {
//     console.log("Done");
// }).catch((ex) => console.log(ex.message));

/**
 * 
 * @param {obj} message 
 */
// const logToFile = async (message) => {
//     fs.appendFile("log.txt", message + ",\n", (err) => {
//         if (err) {
//             console.log(err);
//         }
//     });
// };

let requestStart;
let body = [];

const server = http.createServer((request, response) => {
    requestStart = Date.now();
    let requestErrorMessage = null;
    const getChunk = (chunk) => {
        console.log("at getChunk: " + chunk);
        if (chunk) {
            body.push(chunk);
        }
        return body;
    }
    const assembleBody = () => {
        if (body?.length > 0) {
            body = Buffer.concat(body).toString();
        }
        console.log("body at assemble: " + body); // debug
    };
    const getError = error => {
        requestErrorMessage = error.message;
    };
    request.on("data", getChunk); // fired when the server received new chunks of data from the client
    request.on("end", assembleBody); // called when all data has been sent
    request.on("error", getError);
    const logClose = () => {
        removeHandlers();
        log(request, response, "Client aborted.");
    };
    const logError = error => {
        removeHandlers();
        log(request, response, error.message);
    };
    const logFinish = () => {
        removeHandlers();
        log(request, response, requestErrorMessage);
    };
    response.on("close", logClose);
    response.on("error", logError);
    response.on("finish", logFinish);
    //The IncomingMessage class implements the ReadableStream interface. 
    // >> uses the events of that interface to signal when body data from the client arrives.
    const removeHandlers = () => {
        request.off("data", getChunk);
        request.off("end", assembleBody);
        request.off("error", getError);
        response.off("close", logClose);
        response.off("error", logError);
        response.off("finish", logFinish);
    };
    // ServerResponse's finish event is fired the sever finished sending it’s response. This doesn’t mean the client received everything, but it’s an indicator that the api work is done.
    myProcess(request, response);
});

const log = async (request, response, errorMessage) => {
    const { rawHeaders, httpVersion, method, socket, url } = request;
    const { remoteAddress, remoteFamily } = socket;
    const { statusCode, statusMessage } = response;
    const headers = response.getHeaders();

    let message = JSON.stringify({
        timestamp: Date.now(),
        processingTime: Date.now() - requestStart,
        rawHeaders,
        body,
        errorMessage,
        httpVersion,
        method,
        remoteAddress,
        remoteFamily,
        url,
        response: {
            statusCode,
            statusMessage,
            headers
        }
    })

    main(message).then(() => {
        console.log("Done");
    }).catch((ex) => console.log(ex.message));


};

const myProcess = (request, response) => {
    //passing the processing of our request asynchronously to a separate function to simulate an other module that takes care of it. because of the setTimeout, synchronous logging wouldn’t get the desired result, but the finish event takes care of this by firing after response.end() is called.
    setTimeout(() => {
        response.end();
    }, 100);
};

server.listen(8888, () => {
    console.log("Node server is running on port 8888");
});









// mocked client side for development
// #region
const express = require('express');
const path = require('path');
const app = express();
const methodOverride = require('method-override');

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
// #endregion

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.listen(3000, () => {
    console.log('webApp is running on port 3000');
});