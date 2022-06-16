/**
 * Azure Table Utility
 */
const azureStorage = require('azure-storage');
const _ = require('lodash');
const retryOperations = new azureStorage.ExponentialRetryPolicyFilter();

const entGen = azureStorage.TableUtilities.entityGenerator;

//const uuid = require('uuid/v4');
const uuid = require('uuid').v4;

const PROPERTY_TYPES = {
    INT32: 'Int32',
    INT64: 'Int64',
    BINARY: 'Binary',
    BOOLEAN: 'Boolean',
    STRING: 'String',
    GUID: 'Guid',
    DOUBLE: 'Double',
    DATETIME: 'DateTime',
}

/**
 * 
 * TODO: Maybe add an obj property type to map to
 * in JS. ATM, just letting it happen organically
 * and seeing how that runs for now.
 */
class AzureTableStruct {
    constructor() {
        this.propDefs = new Map();

        // Every table MUST have these
        this.add('PartitionKey', PROPERTY_TYPES.STRING, 'PartitionKey');
        this.add('RowKey', PROPERTY_TYPES.STRING, 'RowKey');
        this.add('Timestamp', PROPERTY_TYPES.DATETIME, 'Timestamp');

        // Ensure this is properly bound if these are referenced in pointers
        this.add = this.add.bind(this);
        this.addBoolean = this.addBoolean.bind(this);
        this.addDateTime = this.addDateTime.bind(this);
        this.addInt64 = this.addInt64.bind(this);
        this.addString = this.addString.bind(this);
        this.genEntityValueByPropDef = this.genEntityValueByPropDef.bind(this);
        this.genEntityValueByPropName = this.genEntityValueByPropName.bind(this);
        this.getEntityFromObj = this.getEntityFromObj.bind(this);
        this.getObjFromEntity = this.getObjFromEntity.bind(this);
    }

    static createPropDef(entityPropName, propType, objPropName = undefined) {
        if (objPropName === undefined) {
            // Omit required Azure Table Storage property names from lowercasing
            // the first letter as a default.
            if (entityPropName === 'PartitionKey' || entityPropName === 'RowKey' || entityPropName === 'Timestamp') {
                objPropName = entityPropName;
            } else {
                objPropName = entityPropName.charAt(0).toLowerCase() + entityPropName.slice(1);
            }
        }
        let propDef = {
            entityPropName,
            objPropName,
            propType,
        }
        return propDef;
    }

    add(entityPropName, propType, objPropName = undefined) {
        let propDef = AzureTableStruct.createPropDef(entityPropName, propType, objPropName);
        this.propDefs.set(entityPropName, propDef);
        return this;
    }

    addString(name, objPropName = undefined) {
        return this.add(name, PROPERTY_TYPES.STRING, objPropName);
    }

    addDateTime(name, objPropName = undefined) {
        return this.add(name, PROPERTY_TYPES.DATETIME, objPropName);
    }

    addBoolean(name, objPropName = undefined) {
        return this.add(name, PROPERTY_TYPES.BOOLEAN, objPropName);
    }

    addInt64(name, objPropName = undefined) {
        return this.add(name, PROPERTY_TYPES.INT64, objPropName);
    }

    getObjValueByPropDef(obj, propDef, defaultValue = undefined) {
        let objValue = obj[propDef.objPropName];
        // Set a default if undefined and the default is given
        if (objValue === undefined && defaultValue !== undefined) objValue = defaultValue;
        return objValue
    }

    genEntityValueByPropDef(obj, propDef, defaultValue = undefined) {
        let entityValue = undefined;
        let objValue = this.getObjValueByPropDef(obj, propDef, defaultValue);
        if (propDef) {
            switch (propDef.propType) {
                case PROPERTY_TYPES.STRING:  entityValue = entGen.String(objValue);  break;
                case PROPERTY_TYPES.INT64: entityValue = entGen.Int64(objValue);  break;
                case PROPERTY_TYPES.DATETIME:  entityValue = entGen.DateTime(objValue);  break;
                case PROPERTY_TYPES.BOOLEAN:  
                    objValue = Boolean(objValue || false);
                    entityValue = entGen.Boolean(objValue);
                    break;
                case PROPERTY_TYPES.INT32: entityValue = entGen.Int32(objValue);  break;
                case PROPERTY_TYPES.BINARY: entityValue = entGen.Binary(objValue);  break;
                case PROPERTY_TYPES.GUID: entityValue = entGen.Guid(objValue);  break;
                case PROPERTY_TYPES.DOUBLE: entityValue = entGen.Double(objValue);  break;

                default:
                    let msg = `Unknown property type ${propDef.propType} found for ${propDefName}`;
                    throw new Error(msg);
            }
        } else {
            let msg = `Property definition not found for ${propDefName}`;
            throw new Error(msg);
        }
        return entityValue;
    }

    genEntityValueByPropName(obj, entityPropName) {
        let propDef = this.propDefs.get(entityPropName);
        return this.genEntityValueFromPropDef(obj, propDef);
    }

    getEntityFromObj(obj) {
        let entity = {};
        function buildEntity(propDef) {
            entity[propDef.entityPropName] = this.genEntityValueByPropDef(obj, propDef);
        };
        this.propDefs.forEach(buildEntity.bind(this));
        return entity;
    }

    /**
     * Creates an entity with only the properties
     * that exist in the object.
     * @param {*} obj 
     */
    getMergeEntityFromObj(obj) {
        let entity = {};
        function buildEntity(propDef) {
            if (_.has(obj, propDef.objPropName)) {
                entity[propDef.entityPropName] = this.genEntityValueByPropDef(obj, propDef);
            }
        };
        this.propDefs.forEach(buildEntity.bind(this));
        return entity;
    }

    getObjFromEntity(entity) {
        let obj = {};
        this.propDefs.forEach(function (propDef) {
            if (_.has(entity, propDef.entityPropName + '._')) {
                obj[propDef.objPropName] = entity[propDef.entityPropName]._;
            }
        });
        return obj;
    }

}

class AzureTable {
    // Trying async in a constructor
    // https://stackoverflow.com/a/50885340/2387067
    //
    // Alternative is to use a static factory function
    // and then call an init function that is async
    // passing that back to the caller
    constructor(connectionString, tableName) {
        this.tableSvc = azureStorage.createTableService(connectionString).withFilter(retryOperations);
        this.tableName = tableName;

        this.tableStruct = new AzureTableStruct();

        this.init = this.init.bind(this);
        this.insertOrReplaceEntity = this.insertOrReplaceEntity.bind(this);
        this.retrieveEntityByKey = this.retrieveEntityByKey.bind(this);
        this.deleteEntityByKey = this.deleteEntityByKey.bind(this);
        this.execQueryRaw = this.execQueryRaw.bind(this);
        this.execQuery = this.execQuery.bind(this);
    }

    init() {
        const thisTable = this;
        return new Promise((resolve, reject) => {
            this.tableSvc.createTableIfNotExists(this.tableName, function (error /*, result, response */) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(thisTable);
            });
        });
    }

    // TODO: Interesting reading
    // https://docs.microsoft.com/en-us/rest/api/storageservices/insert-entity#response
    // https://docs.microsoft.com/en-us/azure/cosmos-db/table-storage-how-to-use-nodejs#add-an-entity-to-a-table
    insertOrReplaceEntity(entity) {
        return new Promise((resolve, reject) => {
            this.tableSvc.insertOrReplaceEntity(this.tableName, entity, function (error, result, /* response */) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            });
        });
    }

    insertOrMergeEntity(entity) {
        return new Promise((resolve, reject) => {
            this.tableSvc.insertOrMergeEntity(this.tableName, entity, function (error, result, /* response */) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            });
        });
    }

    async insertOrReplaceObj(obj) {
        let entity = this.tableStruct.getEntityFromObj(obj);
        let result = await this.insertOrReplaceEntity(entity);
        return this.tableStruct.getObjFromEntity(result);
    }

    async insertOrMergeObj(obj) {
        let entity = this.tableStruct.getMergeEntityFromObj(obj);
        let result = await this.insertOrMergeEntity(entity);
        let retobj = this.tableStruct.getObjFromEntity(result);
        return retobj;
    }

    retrieveEntityByKey(partitionKey, rowKey) {
        return new Promise((resolve, reject) => {
            this.tableSvc.retrieveEntity(this.tableName, partitionKey, rowKey, function (error, result, response) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            });
        });
    }

    retrieveObjByKey(partitionKey, rowKey) {
        return this.retrieveEntityByKey(partitionKey, rowKey).then(entity => {
            return this.tableStruct.getObjFromEntity(entity);
        });
    }

    async retrieveObjById(id) {
        let obj;
        let query = AzureTable.createQuery()
            .top(1)
            .where('PartitionKey eq ?', id);
        let results = await this.execQueryAllObj(query);
        if (results && results.length == 1) {
            obj = results[0];
        }
        return obj;
    }

    
    deleteEntityByKey(partitionKey, rowKey) {
        return new Promise((resolve, reject) => {
            const key = {
                PartitionKey: entGen.String(partitionKey),
                RowKey: entGen.String(rowKey),
            };

            this.tableSvc.deleteEntity(this.tableName, key, function (error, response) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(response);
            });
        });
    }

    /**
     * Executes a raw, Azure Table Storage query
     * @param {TableQuery} query 
     * @param {*} continuationToken 
     */
    execQueryRaw(query, continuationToken = null) {
        return new Promise((resolve, reject) => {
            this.tableSvc.queryEntities(this.tableName, query, continuationToken, function (error, result, response) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            });
        });
    }

    execQuery(query, continuationToken = null) {
        return new Promise((resolve, reject) => {
            let plainObjs = [];
            this.execQueryRaw(query, continuationToken).then(results => {
                results.entries.forEach(row => {
                    plainObjs.push(AzureTable.convertTableStorageToObj(row));
                });
                resolve({
                    continuationToken: results.continuationToken,
                    rows: plainObjs,
                });
            }).catch(reject);
        });
    }

    async execQueryAll(query) {
        let continuationToken = null;
        let all = [];
        do {
            let results = await this.execQuery(query, continuationToken);
            all.push(...results.rows);
            continuationToken = results.continuationToken;
        } while (continuationToken !== null);
        return all;
    }

    /**
     * This differs from execQueryAll
     */
    async execQueryAllObj(query = undefined) {
        if (query === undefined) {
            query = AzureTable.createQuery();
        }

        let continuationToken = null;
        let all = [];
        do {
            let results = await this.execQueryRaw(query, continuationToken);
            all.push(...results.entries);
            continuationToken = results.continuationToken;
        } while (continuationToken !== null);

        return all.map(this.tableStruct.getObjFromEntity);
    }


    /**
     * Static Functions
     */
    static convertTableStorageToObj(entity) {
        let plainObj = {};
        for (let property in entity) {
            if (property === '.metadata') continue;
            plainObj[property] = entity[property]._;
        }
        return plainObj;
    }

    static createQuery() {
        return new azureStorage.TableQuery();
    }

    static entGen() {
        return entGen;
    }

    static uniqueKey() {
        return entGen.String(uuid());
    }

    static uuid() {
        return uuid();
    }

    static create(connectionString, tableName) {
        const table = new AzureTable(connectionString, tableName);
        return table.init();
    }

    static readFirst(connectionString, tableName, partitionKey, rowKey = undefined) {
        return AzureTable.create(connectionString, tableName).then(table => {
            let query;
            if (rowKey === undefined) {
                query = AzureTable.createQuery()
                    .top(1)
                    .where('PartitiontKey eq ?', partitionKey);
            } else {
                query = AzureTable.createQuery()
                    .top(1)
                    .where('PartitiontKey eq ? and RowKey eq ?', partitionKey, rowKey);
            }
            return table.execQuery(query);
        });
    }

    static readAll(connectionString, tableName) {
        return AzureTable.create(connectionString, tableName).then(table => {
            let query = AzureTable.createQuery();
            return table.execQueryAll(query);
        });
    }
}


/**
 * Base Model class for creating models on top
 * of Azure tables.
 */
class ModelBase {
    constructor() {

        this.init = this.init.bind(this);
        this.create = this.create.bind(this);
        this.save = this.save.bind(this);
        this.remove = this.remove.bind(this);
        this.selectSingle = this.selectSingle.bind(this);
        this.selectAll = this.selectAll.bind(this);
    }

    async init(storageConnectionString, tableName) {
        this.storageConnectionString = storageConnectionString;
        this.table = new AzureTable(this.storageConnectionString, tableName);
        await this.table.init();
        return this.table.tableStruct;
    }

/*
    async init(storageConnectionString, tableName) {
        (await super.init(storageConnectionString, tableName)).
            .addString('enabled','enabled')
            .addString('firstname','firstname')
            .addString('lastname','lastname')
            .addString('password','password')
            .addString('roles','roles')
            .addString('username','username');
    }
*/
    async create(item) {
        return await this.save(item);
    }

    save(obj) {
        return this.merge(obj);
    }
    
    merge(obj) {
        return this.table.insertOrMergeObj(obj);
    }

    remove(obj) {
        return this.table.deleteEntityByKey(obj.PartitionKey, obj.RowKey);
    }

    async selectSingle(partitionKey, rowKey = undefined) {
        if (partitionKey !== undefined && rowKey !== undefined) {
            return this.table.retrieveObjByKey(partitionKey, rowKey);
        } else {
            let query = AzureTable.createQuery()
                .top(1)
                .where('PartitionKey eq ?', partitionKey);
            let results = await this.table.execQueryAllObj(query);
            if (results.length > 0) {
                return results[0];
            }
        }
    }

    selectAll() {
        return this.table.execQueryAllObj();
    }
}


module.exports = {
    AzureTable,
    AzureTableStruct,
    ModelBase,
    PROPERTY_TYPES,
};
