const { QueueClient, StorageSharedKeyCredential } = require("@azure/storage-queue");

//in the new @azure/storage-queue SDK, instances of QueueClient would be used for queue operations.

//? do we want a class for the ServiceClient?

class AzureQueue {
    constructor(queueUrl, accountName, accountKey) {
        this.queueSvc = new QueueClient(
            queueUrl, // the URL holds the 'queueName'
            new StorageSharedKeyCredential(accountName, accountKey)
        );
    }


    async insertMessage(message) {
        try {
            await this.queueSvc.sendMessage(message);
        } catch (error) {
            throw new Error(error);
        }
    }

    async receiveMessages() {
        try {
            const result = await this.queueSvc.receiveMessages();
            // console.log(result.receivedMessageItems);
            return result.receivedMessageItems;
        } catch (error) {
            throw new Error(error);
        }
    }

    async deleteMessage(messageId, popReceipt) {
        try {
            await this.queueSvc.deleteMessage(messageId, popReceipt);
        } catch (error) {
            throw new Error(error);
        }
    }




}





module.exports = {
    AzureQueue
}