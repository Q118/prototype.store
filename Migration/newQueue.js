const { QueueClient, QueueServiceClient, StorageSharedKeyCredential } = require("@azure/storage-queue");

// use QueueClient to manipulate messages in a queue -- URL to the QUEUE
// use QueueServiceClient to manipulate queues in a storage account -- URL to the STORAGE ACCOUNT

//in the new @azure/storage-queue SDK, instances of QueueClient would be used for queue operations.

//! maybe just use the logic in anotherWay.js instead :-)

//? do we want a class for the ServiceClient also?

class AzureQueue {
    constructor(queueName, accountName, accountKey) {
        let queueUrl = `https://${accountName}.queue.core.windows.net/${queueName}`;
        this.queueSvc = new QueueClient( // creates an instance of the QueueClient class
            queueUrl,
            new StorageSharedKeyCredential(accountName, accountKey)
        );
        // this.queueServiceClient = new QueueServiceClient() //! unclear yet if this will be needed
        //? message Encoder:  new SDK does not have messageEncoder, handle it in the local implementation.
    }

    /**
     * Inserts the given message into the queue
     * @param {string} message 
     * @returns {object} which is just the response from Azure Storages
     *   queue insertion like this
     * {
     *   "messageId": "01c2390f-e633-414b-b40e-8e8139a6c566",
     *   "insertionTime": "Thu, 15 Aug 2019 18:58:40 GMT",
     *   "expirationTime": "Thu, 22 Aug 2019 18:58:40 GMT",
     *   "popReceipt": "AgAAAAMAAAAAAAAAdlmEc5tT1QE=",
     *   "timeNextVisible": "Thu, 15 Aug 2019 18:58:40 GMT"
     * }
     */
    async insertMessage(message) {
        try {
            let result = await this.queueSvc.sendMessage(message);
            return result;
        } catch (error) {
            throw new Error(error);
        }
    }

    async clearMessages() {
        try {
            let responseData = await this.queueSvc.clearMessages();
            return responseData;
        } catch (error) {
            throw new Error(error);
        }
    }

    async deleteMessage(messageId, popReceipt) {
        try {
            let responseData = await this.queueSvc.deleteMessage(messageId, popReceipt);
            return responseData;
        } catch (error) {
            throw new Error(error);
        }
    }

    // async getCount() {
    //? do we really need this method in this class? bc was only needed for peeking which we now can do without a count with new SDK
    //     try {
    //         let count = 0;
    //          for await (const item of queueServiceClient.listQueues()) {
    //            console.log(`Queue${i}: ${item.name}`);
    //            count++;
    //          }
    //         let responseData = await this.queueSvc.getMessageCount();
    //         return responseData;
    //     } catch (error) {
    //         throw new Error(error);
    //     }
    // }

    // getPopReceipt(messageId)?

    async peekMessages() {
        try {
            let peekMessagesResponse = await this.queueSvc.peekMessages();
            //By default, a *single* message is retrieved from the queue with above operation.
            return peekMessagesResponse.peekedMessageItems[0].messageText;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * Static Methods
     */

    static async doesQueueExist(queueName, accountName, accountKey) {
        try {
            let queueUrl = `https://${accountName}.queue.core.windows.net/${queueName}`;
            let queueSvc = new QueueClient(
                queueUrl,
                new StorageSharedKeyCredential(accountName, accountKey)
            );
            let existence = await queueSvc.exists();
            return existence;
        } catch (error) {
            throw new Error(error);
        }
    }

    static insertMessage(queueUrl, accountName, accountKey, message) {
        return new AzureQueue(queueUrl, accountName, accountKey).insertMessage(message);
    }

    static clearMessages(queueUrl, accountName, accountKey) {
        return new AzureQueue(queueUrl, accountName, accountKey).clearMessages();
    }

    // static getCount(connectionString, queueName) {
    //     return new AzureQueue(connectionString, queueName).getCount();
    // }

    static deleteMessage(queueUrl, accountName, accountKey, messageId, popReceipt) {
        return new AzureQueue(queueUrl, accountName, accountKey).deleteMessage(messageId, popReceipt);
    }

    static peekMessages(queueUrl, accountName, accountKey) {
        return new AzureQueue(queueUrl, accountName, accountKey).peekMessages();
    }

}





module.exports = {
    AzureQueue,
    // AzureServiceQueue
}