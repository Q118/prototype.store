/**
 * API Requests
 */
const _ = require('lodash');

// const config = require('../config');

const { AzureTable } = require('../../Migration/newAzureTable');
const { AzureBlob } = require('../../Migration/newAzureBlob');

class ApiRequest {
    constructor(accountName, accountKey) {

        this.accountName = accountName;
        this.accountKey = accountKey;

        //TODO: change this name once done with development  --- "api-requests"
        this.tableName = "devAPItable";

        this.init = this.init.bind(this);
        this.create = this.create.bind(this);
        this.save = this.save.bind(this);
        this.merge = this.merge.bind(this);
        this.remove = this.remove.bind(this);
        this.selectDataBlob = this.selectDataBlob.bind(this);
        this.selectAll = this.selectAll.bind(this);



    }

    async init() {
        // if (storageConnectionString) {
        //     this.storageConnectionString = storageConnectionString;
        // }

        this.table = new AzureTable(this.accountName, this.accountKey, this.tableName);
        await this.table.init();

        //TODO: change this blobName once done with development
        this.blob = new AzureBlob(this.accountName, this.accountKey, 'dev-blobs');

        await this.table.tableStruct
            .addString('ServerTiming')
            .addString('url')
            .addString('MachineName')
            .addString('IP')
            .addString('Params')
            .addString('Status')
            .addString('Method')
        return this;
    }

    async create(item) {
        return this.save(item);
    }

    async saveDataBlob(obj) {
        let name = _.get(obj, 'PartitionKey');
        if (!name) {
            name = AzureTable.uuid();
        }
        name = `${name}.json`;
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
        if (!name) return undefined;
        name = `${name}.json`;
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


    static genGuid() {
        return AzureTable.uuid();
    }


    async selectByCode(code) {
        let query = AzureTable.createQuery(`Code eq ${code}`);
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
