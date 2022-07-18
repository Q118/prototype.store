const { ContainerClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

const { Readable } = require('stream');

/**
 * Global Utility Function
 * @param {ReadableStream} readableStream 
 */
async function streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on("error", reject);
    });
}

class AzureBlob {
    constructor(accountName, accountKey, containerName) {
        let containerUrl = `https://${accountName}.blob.core.windows.net/${containerName}`;
        this.blobSvc = new ContainerClient(
            containerUrl,
            new StorageSharedKeyCredential(accountName, accountKey)
        );
        this.containerName = containerName;
        this.writeBlob = this.writeBlob.bind(this);
        this.writeBlobFromStream = this.writeBlobFromStream.bind(this);
        this.readBlob = this.readBlob.bind(this);
        this.deleteBlob = this.deleteBlob.bind(this);
        this.listAllBlobs = this.listAllBlobs.bind(this);
        // this.listBlobs = this.listBlobs.bind(this); this.listBlobsInFolder = this.listBlobsInFolder.bind(this);
        /* we do not need either of these methods since they were used just as helpers to listAllBlobs/listAllBlobsInFoler and now we can do it all in one go and same goes for blobsInfolder. */
        this.listAllBlobsInFolder = this.listAllBlobsInFolder.bind(this);
        this.exists = this.exists.bind(this);
    }

    /**
     * 
     * @param {ReadableStream} blobContent 
     * @returns Response data for the Blob Upload operation.
     * ! upload() is a non-parallel uploading method, docs suggest use uploadFile, uploadStream or uploadBrowserData for better performance with concurrency uploading.
     */
    async writeBlob(blobName, blobContent) {
        try {
            let blockBlobUploadRes = await this.blobSvc.getBlockBlobClient(blobName).upload(blobContent, blobContent.length);
            return blockBlobUploadRes;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * @param {string} blobName
     * @param {*} blobContent 
     * ! use this over writeBlob whenever possible.
     */

    async writeBlobFromStream(blobContent, blobName) {
        try {
            let streamFromBlob = Readable.from(blobContent.toString());
            let bufferSize = streamFromBlob.length;
            let blockBlobUploadRes = await this.blobSvc.getBlockBlobClient(blobName).uploadStream(streamFromBlob, bufferSize);
            return blockBlobUploadRes;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * 
     * @param {string} blobName 
     * @returns {string} Response data for the Blob Download operation as a string.
     */
    async readBlob(blobName) {
        try {
            let responseData = await this.blobSvc.getBlockBlobClient(blobName).download();
            let downloaded = await streamToBuffer(responseData.readableStreamBody);
            return downloaded.toString();
        } catch (error) {
            throw new Error(error);
        }
    }

    async getBlobMetaData(blobName) {
        try {
            let responseData = await this.blobSvc.getBlockBlobClient(blobName).getProperties();
            return responseData;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * Deletes the given blob name
     * @param {*} blobName 
     * @returns {Boolean} true if the blob was deleted
     */
    async deleteBlob(blobName) {
        try {
            let responseData = await this.blobSvc.getBlockBlobClient(blobName).deleteIfExists();
            return responseData;
        } catch (error) {
            throw new Error(error);
        }
    }

    /** in old SDK, there was no built-in way to handle pagination when listing blobs in a container. Users had to use continuationToken to get the next page of result then retrieve the items.
    * In the new SDK we return a PagedAsyncIterableIterator that handles the details of pagination internally, simplifying the work of iteration.
    */
    async listAllBlobs() {
        try {
            let blobItems = [];
            const iterator = this.blobSvc.listBlobsFlat();
            let blobItem = await iterator.next();
            while (!blobItem.done) {
                blobItems.push(blobItem.value);
                blobItem = await iterator.next();
            }
            return blobItems;
        } catch (error) {
            throw new Error(error);
        }
    }


    /**
     * 
     * @param {*} folderName - specifies the prefix of the blob names to be listed.
     * @returns {Array.<string>} blobNames - returns an array of blob names that match the given prefix.
     */
    async listAllBlobsInFolder(folderName) {
        try {
            const items = this.blobSvc.listBlobsByHierarchy("/", { prefix: `${folderName}` });
            let blobNames = [];
            for await (const item of items) {
                if (item.kind === "prefix") {
                    console.log(`\tBlobPrefix: ${item.name}`);
                } else {
                    blobNames.push(item.name);
                    console.log(`\tBlobItem: name - ${item.name}, last modified - ${item.properties.lastModified}`);
                }
            }
            return blobNames;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * Creates a new container under the specified account. If the container with
     * the same name already exists, it is not changed.
     * @returns {boolean} Indicates whether the container is successfully created. Is false when the container is not changed as it already exists.
     */
     async createContainerIfNotExists() {
        try {
            let responseData = await this.blobSvc.createIfNotExists();
            return responseData;
        } catch (error) {
            throw new Error(error);
        }
    }


    async exists() {
        try {
            let existence = await this.blobSvc.exists();
            return existence;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * static methods
     */
    static create(accountName, accountKey, containerName) {
        return new AzureBlob(accountName, accountKey, containerName);
    }

    static readBlob(accountName, accountKey, containerName, blobName) {
        return AzureBlob
            .create(accountName, accountKey, containerName)
            .readBlob(blobName);
    }

    static writeBlob(accountName, accountKey, containerName, blobName, blobContent) {
        return AzureBlob
            .create(accountName, accountKey, containerName)
            .writeBlob(blobName, blobContent);
    }

    static deleteBlob(accountName, accountKey, containerName, blobName) {
        return AzureBlob
            .create(accountName, accountKey, containerName)
            .deleteBlob(blobName);
    }

    static listAllBlobs(accountName, accountKey, containerName) {
        return AzureBlob
            .create(accountName, accountKey, containerName)
            .listAllBlobs();
    }

    static readBlobMetaData(accountName, accountKey, containerName, blobName) {
        return AzureBlob
            .create(accountName, accountKey, containerName)
            .getBlobMetaData(blobName);
    }

    static async loadObj(accountName, accountKey, containerName, blobName) {
        return AzureBlob
            .create(accountName, accountKey, containerName)
            .readBlob(blobName)
            .then(text => {
                let obj = JSON.parse(text)
                return obj;
            });
    }
}

module.exports = {
    AzureBlob,
}