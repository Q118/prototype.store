/**
 * Azure Blob Storage
 */

const azureStorage = require('azure-storage');
const retryOperations = new azureStorage.ExponentialRetryPolicyFilter();

class AzureBlob {
    constructor(connectionString, containerName) {
        this.blobSvc = azureStorage.createBlobService(connectionString).withFilter(retryOperations);
        this.containerName = containerName;

        this.writeBlob = this.writeBlob.bind(this);
        this.readBlob = this.readBlob.bind(this);
        this.deleteBlob = this.deleteBlob.bind(this);
        this.listBlobs = this.listBlobs.bind(this);
        this.listAllBlobs = this.listAllBlobs.bind(this);
        this.listBlobsInFolder = this.listBlobsInFolder.bind(this);
        this.listAllBlobsInFolder = this.listAllBlobsInFolder.bind(this);
        this.exists = this.exists.bind(this);
    }

    writeBlob(blobName, content) {
        return new Promise((resolve, reject) => {
            this.blobSvc.createBlockBlobFromText(this.containerName, blobName, content, function (error, result, response) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            });
        });
    }

    writeBlobFromStream(blobName, stream, metadata) {
        return new Promise((resolve, reject) => {
            stream.pipe(this.blobSvc.createWriteStreamToBlockBlob(this.containerName, blobName, {
                metadata: metadata
            }, (error, result, response) => {
                if (error) {
                    reject(error);
                }
                resolve(result);
            }));
        });
    }

    readBlob(blobName) {
        return new Promise((resolve, reject) => {
            this.blobSvc.getBlobToText(this.containerName, blobName, function (error, text, blockBlob, response) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(text);
            });
        });
    }

    getBlobMetadata(blobName) {
        return new Promise((resolve, reject) => {
            this.blobSvc.getBlobMetadata(this.containerName, blobName, (err, result, response) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }

    /**
     * Deletes the given blob name
     * @param {*} blobName 
     * @returns {Boolean} true if the blob was deleted
     */
    deleteBlob(blobName) {
        return new Promise((resolve, reject) => {
            this.blobSvc.deleteBlobIfExists(this.containerName, blobName, function (error, result, response) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            });
        });
    }

    listBlobs(continuationToken = null) {
        return new Promise((resolve, reject) => {
            this.blobSvc.listBlobsSegmented(this.containerName, continuationToken, function (error, result) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            });
        });
    }

    async listAllBlobs() {
        let all = [];
        let continuationToken = null;
        do {
            let result = await this.listBlobs(continuationToken);
            continuationToken = result.continuationToken;
            all.push(...result.entries);
        } while (continuationToken !== null);
        return all;
    }

    listBlobsInFolder(prefix, continuationToken = null) {
        return new Promise((resolve, reject) => {
            this.blobSvc.listBlobsSegmentedWithPrefix(this.containerName, prefix, continuationToken, function (error, result) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            });
        });
    }

    async listAllBlobsInFolder(folderName) {
        let all = [];
        let continuationToken = null;
        do {
            let result = await this.listBlobsInFolder(folderName, continuationToken);
            continuationToken = result.continuationToken;
            all.push(...result.entries);
        } while (continuationToken !== null);
        return all;
    }

    async createContainerIfNotExists(containerName) {
        return await new Promise((resolve, reject) => {
            this.blobSvc.createContainerIfNotExists(containerName, function (error, result, response) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
                return;
            });
        })
    }

    async exists(blobName) {
        return await new Promise((resolve, reject) => {
            this.blobSvc.doesBlobExist(this.containerName, blobName, function (error, result) {
                if (error) {
                    reject(result);
                    return;
                } else {
                    resolve(result);
                    return;
                }
            });
        });

    }

    static create(connectionString, containerName) {
        return new AzureBlob(connectionString, containerName);
    }

    static readBlob(connectionString, containerName, blobName) {
        return AzureBlob
            .create(connectionString, containerName)
            .readBlob(blobName);
    }

    static writeBlob(connectionString, containerName, blobName, content) {
        return AzureBlob
            .create(connectionString, containerName)
            .writeBlob(blobName, content);
    }

    static deleteBlob(connectionString, containerName, blobName) {
        return AzureBlob
            .create(connectionString, containerName)
            .deleteBlob(blobName);
    }

    static listAllBlobs(connectionString, containerName) {
        return AzureBlob
            .create(connectionString, containerName)
            .listAllBlobs();
    }

    static readBlobMetadata(connectionString, containerName, blobName) {
        return AzureBlob
            .create(connectionString, containerName)
            .getBlobMetadata(blobName);
    }

    static loadObj(connectionString, containerName, blobName) {
        return AzureBlob
            .create(connectionString, containerName)
            .readBlob(blobName)
            .then(text => {
                let obj = JSON.parse(text);
                return obj
            });
    }
}

module.exports = {
    AzureBlob,
};
