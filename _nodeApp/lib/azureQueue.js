/**
 * Azure Queue
 */
const azureStorage = require('azure-storage');
const retryOperations = new azureStorage.ExponentialRetryPolicyFilter();


class AzureQueue {
    constructor(connectionString, queueName, isEncoded = false) {
        this.queueSvc = azureStorage.createQueueService(connectionString).withFilter(retryOperations);
        this.queueName = queueName;
        if (isEncoded) {
            this.queueSvc.messageEncoder = new azureStorage.QueueMessageEncoder.TextBase64QueueMessageEncoder();
        }
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
    insertMessage(message) {
        return new Promise((resolve, reject) => {
            this.queueSvc.createMessage(this.queueName, message, function (error, results, response) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(results);
            });
        });
    }

    clearMessages() {
        return new Promise((resolve, reject) => {
            this.queueSvc.clearMessages(this.queueName, function (error, response) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(response);
            });
        });
    }

    deleteMessage(messageId, popReceipt) {
        return new Promise((resolve, reject) => {
            this.queueSvc.deleteMessage(this.queueName, messageId, popReceipt, function (error, response) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(response);
            });
        });
    }

    getCount() {
        return new Promise((resolve, reject) => {
            this.queueSvc.getQueueMetadata(this.queueName, function (error, results, response) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(results.approximateMessageCount);
            });
        });
    }

    getMessages() {
        return new Promise((resolve, reject) => {
            this.queueSvc.getMessages(this.queueName, function (error, serverMessages) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(serverMessages);
            });
        });
    }


    peekMessages(count) {
        return new Promise((resolve, reject) => {
            this.queueSvc.peekMessages(this.queueName, { numOfMessages: count }, function (error, results, response) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(results);
            });
        });
    }


    /**
     * 
     * @param {string} connectionString 
     * @param {string} queueName 
     * @return {object} results of the check in an object with this form:
     * {name: "blahblah", exists: false}
     */
    static doesQueueExist(connectionString, queueName) {
        return new Promise((resolve, reject) => {
            let queueSvc = azureStorage.createQueueService(connectionString).withFilter(retryOperations);
            queueSvc.doesQueueExist(queueName, function (error, result) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            });
        });
    }

    static insertMessage(connectionString, queueName, message) {
        return new AzureQueue(connectionString, queueName).insertMessage(message);
    }

    static clearMessage(connectionString, queueName) {
        return new AzureQueue(connectionString, queueName).clearMessage();
    }

    static getCount(connectionString, queueName) {
        return new AzureQueue(connectionString, queueName).getCount();
    }

    static deleteMessage(connectionString, queueName, messageId, popReceipt) {
        return new AzureQueue(connectionString, queueName).deleteMessage(messageId, popReceipt);
    }

    /**
     * 
     * @param {*} connectionString 
     * @param {*} queueName 
     * @param {int} count Maximum is 32 set by Azure
     */
    static peekMessages(connectionString, queueName, count = 32) {
        if (count > 32) count = 32;
        return new AzureQueue(connectionString, queueName).peekMessages(count);
    }

}

module.exports = {
    AzureQueue,
}
