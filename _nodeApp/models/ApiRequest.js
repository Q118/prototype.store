/**
 * API Requests
 */
const _ = require('lodash');

// const config = require('../config');
const { AzureTable } = require('../lib/azureTable');
const { AzureBlob } = require('../lib/azureBlob');

class ApiRequest {
    constructor(storageConnectionString) {

        this.storageConnectionString = storageConnectionString;

        this.init = this.init.bind(this);
        this.create = this.create.bind(this);
        this.save = this.save.bind(this);
        this.merge = this.merge.bind(this);
        this.remove = this.remove.bind(this);
        this.selectDataBlob = this.selectDataBlob.bind(this);
        //this.selectByUsername = this.selectByUsername.bind(this);
        this.selectAll = this.selectAll.bind(this);
    }

    async init(storageConnectionString) {
        if (storageConnectionString) {
            this.storageConnectionString = storageConnectionString;
        }
        this.table = new AzureTable(this.storageConnectionString, 'devAPItable');
        await this.table.init();

        this.blob = new AzureBlob(this.storageConnectionString, 'dev-blobs');

        await this.table.tableStruct
            .addString('ServerTiming')
            .addString('url')
            .addString('Status')
            .addString('Rule')
            .addString('RequestDataType')
            .addString('ResponseDataType')
            .addString('Method')
        return this;
    }


    async create(item) {
        return this.save(item);
    }


    async saveDataBlob(obj) {
        let name = _.get(obj, 'PartitionKey');
        name = name + '.json';
        if (!name) {
            name = uniqueId();
        }
        let content = _.get(obj, 'data', '');
        this.blob.writeBlob(name, content);
        return name;
    }



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


    async selectDataBlob(obj) {
        let name = _.get(obj, 'PartitionKey');
        name = name + '.json';
        if (!name) return undefined;
        let content = undefined;
        try {
            content = await this.blob.readBlob(name);
        } catch (error) {
            console.error(error);
        }
        return content;
    }


    async selectById(id) {
        let item = await this.table.retrieveObjById(id);
        return item;
    }

    async doesEntityExist(partitionKey) {
        let item = await this.table.retrieveObjById(partitionKey);
        if (item) {
            return true;
        }
        return false;
    }

    async selectAll() {
        let items = await this.table.execQueryAllObj();
        return items;
    }

    /*
    static genGuid() {
        return AzureTable.uuid();
    }
    */

    async selectByCode(code) {
        let query = AzureTable.createQuery()
            .top(1)
            .where('Code eq ?', code);
        let rows = await this.table.execQueryAllObj(query);
        if (rows && rows.length && rows.length === 1) {
            let row = rows[0];
            return row;
        }
        return undefined;
    }


    static async create() {
        let obj = new ApiRequest();
        await obj.init();
        return obj;
    }
}

module.exports = {
    ApiRequest,
};
