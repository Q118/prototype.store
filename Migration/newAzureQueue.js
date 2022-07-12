const { QueueClient, QueueServiceClient, StorageSharedKeyCredential } = require("@azure/storage-queue");

// use QueueClient to manipulate messages in a queue -- URL to the QUEUE
// use QueueServiceClient to manipulate queues in a storage account -- URL to the STORAGE ACCOUNT
//in the new @azure/storage-queue SDK, instances of QueueClient would be used for queue operations.


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
     * @returns {object} 
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


    async deleteMessage(messageId, popReceipt) {
        try {
            let deleteResponse = await this.queueSvc.deleteMessage(messageId, popReceipt);
            return deleteResponse;
        } catch (error) {
            throw new Error(error);
        }
    }


    async getCount() {
        try {
            let count = 0;
            for await (const item of QueueServiceClient.listQueues()) {
                console.log(`Queue${i}: ${item.name}`);
                count++;
            }
            let responseData = await this.queueSvc.getMessageCount();
            return responseData;
        } catch (error) {
            throw new Error(error);
        }
    }

    async getMessages() {
        try {
            let receivedMessageItem;
            const response = await this.queueSvc.receiveMessages();
            if (response.receivedMessageItems.length == 1) {
                receivedMessageItem = response.receivedMessageItems[0];
            }
            return receivedMessageItem;
        } catch (error) {
            throw new Error(error);
        }
    }

    async peekMessages() {
        try {
            let peekMessageResponse = await this.queueSvc.peekMessages();
            return peekMessageResponse.peekedMessageItems[0];
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

    static getCount(connectionString, queueName) {
        return new AzureQueue(connectionString, queueName).getCount();
    }

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