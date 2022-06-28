const { ContainerClient, StorageSharedKeyCredential, BlockBlobClient } = require("@azure/storage-blob");

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

        // this.blockBlob = new BlockBlobClient(
        //     `${containerUrl}/${blobName}`,
        //     new StorageSharedKeyCredential(accountName, accountKey)
        // );

        this.containerName = containerName;
        this.writeBlob = this.writeBlob.bind(this);
        this.readBlob = this.readBlob.bind(this);
        // this.deleteBlob = this.deleteBlob.bind(this);
        // this.listBlobs = this.listBlobs.bind(this);
        // this.listAllBlobs = this.listAllBlobs.bind(this);
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
            // await this.blobSvc.create();
            let blockBlob = await this.blobSvc.getBlockBlobClient(blobName);
            let responseData = await blockBlob.upload(blobContent, blobContent.length);
            return responseData;
        } catch (error) {
            throw new Error(error);
        }
    }
    // * const blockBlobClient = containerClient.getBlockBlobClient("<blob name>");
    // * const uploadBlobResponse = await blockBlobClient.upload(content, content.length);
    async readBlob(blobName) {
        try {
            let responseData = await this.blobSvc.getBlockBlobClient(blobName).download();


            const downloaded = await streamToBuffer(responseData.readableStreamBody);

            return downloaded.toString();
        } catch (error) {
            throw new Error(error);

        }
    }






}

module.exports = {
    AzureBlob,
}