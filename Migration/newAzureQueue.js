const { QueueClient, QueueServiceClient, StorageSharedKeyCredential } = require("@azure/storage-queue");

// use QueueClient to manipulate messages in a queue -- URL to the QUEUE
// use QueueServiceClient to manipulate queues in a storage account -- URL to the STORAGE ACCOUNT

//in the new @azure/storage-queue SDK, instances of QueueClient would be used for queue operations.


//? do we want a class for the ServiceClient also?

class AzureQueue {
    constructor(queueName, accountName, accountKey) {
        let queueUrl = `https://${accountName}.queue.core.windows.net/${queueName}`;
        this.queueSvc = new QueueClient( // creates an instance of the QueueClient class
            queueUrl,
            new StorageSharedKeyCredential(accountName, accountKey)
        );
        // this.queueServiceClient = new QueueServiceClient() 
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

    /**
     * You de-queue/delete a message in two steps. Call GetMessage at which point the message becomes invisible to any other code reading messages 
     * from this queue for a default period of 30 seconds. To finish removing the message from the queue, you call DeleteMessage
     * This two-step process ensures that if your code fails to process a message due to hardware or software failure, another instance of your code can get the same message and try again.
     */
    async deleteMessage() {
        try {
            const dequeueResponse = await this.queueSvc.receiveMessages();
            let deleteMessageResponse;
            if (dequeueResponse.receivedMessageItems.length == 1) {
                const dequeueMessageItem = dequeueResponse.receivedMessageItems[0];
                console.log(`Processing & deleting message with ID: ${dequeueMessageItem.messageId}`);
                deleteMessageResponse = await this.queueSvc.deleteMessage(
                    dequeueMessageItem.messageId,
                    dequeueMessageItem.popReceipt
                );
                console.log(
                    `Deleted message successfully, service assigned request ID: ${deleteMessageResponse.requestId}`
                );
            }
            return deleteMessageResponse;
        } catch (error) {
            throw new Error(error);
        }
    } //! this works for deleting the message on top... but for specifying which message to delete, we may need to refactor slightly... or handle that locally.

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

    async peekMessageText() {
        try {
            let peekMessagesResponse = await this.queueSvc.peekMessages();
            //By default, a *single* message is retrieved from the queue with above operation.
            return peekMessagesResponse.peekedMessageItems[0].messageText;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * 
     * @returns {Promise<object>} 
     *   returned object like:
     * {
     * insertedOn: 2022-06-27T19:17:58.000Z,        
     * expiresOn: 2022-07-04T19:17:58.000Z,        
     * popReceipt: 'AgAAAAMAAAAAAAAAERIsZXCK2AE=', 
     * nextVisibleOn: 2022-06-27T21:53:54.000Z,    
     * dequeueCount: 1,
     * messageText: 'eyJyZXF1ZXN0SWQiOiJlNTdlMDQ0...'
     * }
     */
    async peekMessageData() {
        try {
            let messageResponse = await this.queueSvc.receiveMessages();
            return messageResponse.receivedMessageItems[0];
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
}