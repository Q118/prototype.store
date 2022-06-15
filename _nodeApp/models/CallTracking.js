/**
 * CallTracking
 * 
 * CallTracking of the API
 *
 */
const _ = require('lodash');

// const config = require('../config');
const { AzureTable } = require('../lib/azureTable');

class CallTracking {
    constructor(storageConnectionString = "DefaultEndpointsProtocol=https;AccountName=accsrusdev;AccountKey=Plumb2Rm3XSJ3aF7sSc8Mm2XiPkZe0ILMIdSAPYhkfqpvGms7SYb/5hLICuewvfWVvjtDkZcWP7MojXpS8TZuA==;BlobEndpoint=https://accsrusdev.blob.core.windows.net/;QueueEndpoint=https://accsrusdev.queue.core.windows.net/;TableEndpoint=https://accsrusdev.table.core.windows.net/;FileEndpoint=https://accsrusdev.file.core.windows.net/;") {

        this.storageConnectionString = storageConnectionString;

        this.init = this.init.bind(this);
        // this.create = this.create.bind(this);
        this.save = this.save.bind(this);
        this.merge = this.merge.bind(this);
        this.remove = this.remove.bind(this);
        //this.selectByUsername = this.selectByUsername.bind(this);
        this.selectAll = this.selectAll.bind(this);
    }

    async init(storageConnectionString) {
        if (storageConnectionString) {
            this.storageConnectionString = storageConnectionString;
        }
        this.table = new AzureTable(this.storageConnectionString, 'devAPItable');
        await this.table.init();

        await this.table.tableStruct
            .addString('ServerTiming')
            .addString('url')
            .addString('Status')
            .addString('Rule')
            .addString('RequestDataType')
            .addString('ResponseDataType')
            .addString('Method')      
    }

    /*
    async create(item) {
        this.save(item);
    }
    */

    save(obj) {
        return this.merge(obj);
    }
    
    merge(obj) {
        const saveObj = _.cloneDeep(obj);
        return this.table.insertOrMergeObj(saveObj);
    }

    remove(obj) {
        return this.table.deleteEntityByKey(obj.PartitionKey, obj.RowKey);
    }



    async selectById(id) {
        let item = await this.table.retrieveObjById(id);
        CallTracking.addTenantIdToObj(item);
        return item;
    }

    async doesEntityExist(partitionKey) {
        let item = await this.table.checkExistById(partitionKey);
        return item;
    }

    async selectAll() {
        let items = await this.table.execQueryAllObj();
        items.forEach(item => CallTracking.addTenantIdToObj(item));
        return items;
    }

    /*
    static genGuid() {
        return AzureTable.uuid();
    }
    */

    static addTenantIdToObj(obj) {
        obj.tenantId = obj.PartitionKey;
        return obj;
    }

    static async create() {
        let obj = new CallTracking();
        await obj.init();
        return obj;
    }
}

module.exports = {
    CallTracking,
};
