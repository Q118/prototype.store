const { ContainerClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

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
        this.readBlob = this.readBlob.bind(this);
        this.deleteBlob = this.deleteBlob.bind(this);
        // this.listBlobs = this.listBlobs.bind(this);
        this.listAllBlobs = this.listAllBlobs.bind(this);
        // this.listBlobsInFolder = this.listBlobsInFolder.bind(this);
        // this.listAllBlobsInFolder = this.listAllBlobsInFolder.bind(this);
        // this.exists = this.exists.bind(this);

        //? do we add in here an containerClient.create()?  -- do it in a static method
    }

    /**
     * 
     * @param {ReadableStream} blobContent 
     * @returns Response data for the Blob Upload operation.
     */
    async writeBlob(blobName, blobContent) {
        try {
            let blockBlobUploadRes = await this.blobSvc.getBlockBlobClient(blobName).upload(blobContent, blobContent.length);
            return blockBlobUploadRes;
        } catch (error) {
            throw new Error(error);
        }
    }

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

    async deleteBlob(blobName) {
        try {
            let responseData = await this.blobSvc.getBlockBlobClient(blobName).delete();
            return responseData;
        } catch (error) {
            throw new Error(error);
        }
    }

    // in old SDK, there was no built-in way to handle pagination when listing blobs in a container. Users had to use continuationToken to get the next page of result then retrieve the items.
    //In the new SDK we return a PagedAsyncIterableIterator that handles the details of pagination internally, simplifying the work of iteration.
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

    async exists() {
        try {
            let existence = await this.blobSvc.exists();
            return existence;
        } catch (error) {
            return false;
        }
    }

    async createContainerIfNotExists() {
        try {
            let responseData = await this.blobSvc.createIfNotExists();
            return responseData;
        } catch (error) {
            throw new Error(error);
        }
    }



}

module.exports = {
    AzureBlob,
}