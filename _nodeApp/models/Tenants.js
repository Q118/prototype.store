/**
 * Tenant
 * 
 * Tenants of the application
 * this the OG
 */
const _ = require('lodash');

const config = require('../config');
const { AzureTable } = require('../lib/azureTable');

class Tenants {
    constructor(storageConnectionString = config.globalStorageConnectionString) {

        this.storageConnectionString = storageConnectionString;

        this.init = this.init.bind(this);
        //this.create = this.create.bind(this);
        this.save = this.save.bind(this);
        this.merge = this.merge.bind(this);
        //this.remove = this.remove.bind(this);
        //this.selectByUsername = this.selectByUsername.bind(this);
        this.selectAll = this.selectAll.bind(this);
    }

    async init(storageConnectionString) {
        if (storageConnectionString) {
            this.storageConnectionString = storageConnectionString;
        }
        this.table = new AzureTable(this.storageConnectionString, 'Tenants');
        await this.table.init();

        await this.table.tableStruct
            .addString('Name')
            .addString('AzureLocation')
            .addString('Environment')
            .addString('ApiSecret')
            .addString('DbConnectionString')
            .addString('StorageConnectionString')
            .addString('Settings')
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

    /*
    remove(obj) {
        return this.table.deleteEntityByKey(obj.PartitionKey, obj.RowKey);
    }
    */

    /*
    async selectByUsername(username) {
        const query = AzureTable.createQuery()
            .top(1)
            .where('RowKey eq ?', username);
        return this.table.execQuery(query);
    }
    */

    async selectById(id) {
        let item = await this.table.retrieveObjById(id);
        return item;
    }

    selectAll() {
        return this.table.execQueryAllObj();
    }

    /*
    static genGuid() {
        return AzureTable.uuid();
    }
    */

    static async create() {
        let obj = new Tenants();
        await obj.init();
        return obj;
    }
}

module.exports = {
    Tenants,
};
