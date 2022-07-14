/**
 * Azure Table Utility
 * made with new SDK 
 * TODO: refactor ../models/ApiRequest after this
 */
const { TableClient, AzureNamedKeyCredential, TableEntity, odata } = require("@azure/data-tables");
const uuid = require('uuid').v4;
const _ = require('lodash');
//Previously in azure-storage, we would create our entity as an object with a specific structure for representing values
//in the new SDK, we can use *partitionKey* and *rowKey* (camel case). Also you no longer need to use the value object structure or entityGenerator anymore, instead use normal JavaScript values.
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
 * @class AzureTableStruct
*/
class AzureTableStruct {
    constructor() {
        this.propDefs = new Map();

        // Every table MUST have these
        this.add('partitionKey', PROPERTY_TYPES.STRING, 'partitionKey');
        this.add('rowKey', PROPERTY_TYPES.STRING, 'rowKey');
        this.add('timestamp', PROPERTY_TYPES.DATETIME, 'timestamp');

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
            // ensure we camelCase
            objPropName = entityPropName.charAt(0).toLowerCase() + entityPropName.slice(1);
        }
        let propDef = {
            entityPropName, // e.g. 'PartitionKey' 
            objPropName, // e.g. 'partitionKey'
            propType, // e.g. 'string'
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
        return objValue;// e.g. 'partitionKey'
    }

    // ref example for setting types: https://stack247.wordpress.com/2021/08/21/azure-data-table-query-in-typescript/ 
    //and: https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/tables/data-tables/samples/v12/javascript/workingWithInt64.js
    genEntityValueByPropDef(obj, propDef, defaultValue = undefined) {
        let entityValue = undefined;
        let objValue = this.getObjValueByPropDef(obj, propDef, defaultValue);
        if (propDef) {
            // we no longer need the big switch statement bc we can use normal JS values to insert directly
            entityValue = objValue;
        } else {
            let msg = `Property definition not found for ${propDef.entityPropName}`
            throw new Error(msg);
        }
        return entityValue; // value of the entity, example: "true"; its the actual *value* to be stored in the table
    }

    genEntityValueByPropName(obj, propName, defaultValue = undefined) {
        let propDef = this.propDefs.get(propName);
        return this.genEntityValueByPropDef(obj, propDef, defaultValue); // returns value of the entity
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
            if (_.has(entity, propDef.entityPropName)) {
                obj[propDef.objPropName] = entity[propDef.entityPropName].value;
            }
        });
        return obj;
    }

}


/**
 * @class AzureTable
*/
class AzureTable {
    constructor(accountName, accountKey, tableName) {
        // TODO add /tableName at end?
        const tablesEndpoint = `https://${accountName}.table.core.windows.net`;
        this.tableName = tableName;
        this.tableSvc = new TableClient(
            tablesEndpoint,
            tableName,
            new AzureNamedKeyCredential(accountName, accountKey)
        );

        this.tableStruct = new AzureTableStruct();
        this.init = this.init.bind(this);
        this.insertOrReplaceEntity = this.insertOrReplaceEntity.bind(this);
        this.retrieveEntityByKey = this.retrieveEntityByKey.bind(this);
        this.deleteEntityByKey = this.deleteEntityByKey.bind(this);
        this.execQueryRaw = this.execQueryRaw.bind(this);
        this.execQuery = this.execQuery.bind(this);
    }

    /**
    * calling create table will create the table used
    * to instantiate the TableClient.
    * **If the table already exists this function doesn't throw.**
     */
    async init() {
        try {
            await this.tableSvc.createTable();
            console.log(`Table created or already exists: ${this.tableName}`);
            return;
        } catch (error) {
            throw new Error(error);
        }
    }


    async insertOrReplaceEntity(entity) {
        try {
            if (entity.partitionKey === undefined || entity.rowKey === undefined) {
                throw new Error(`PartitionKey and RowKey are required`);
            }
            let responseData = await this.tableSvc.upsertEntity(entity, "Replace");
            console.log(`Entity replaced/inserted`);
            return responseData;
        } catch (error) {
            throw new Error(error);
        }
    }
    /**
     * @param {TableEntity} entity 
     */
    async insertOrMergeEntity(entity) {
        try {
            if (entity.partitionKey === undefined || entity.rowKey === undefined) {
                throw new Error(`PartitionKey and RowKey are required`);
            }
            let responseData = await this.tableSvc.upsertEntity(entity, "Merge");
            console.log(`Entity merged/inserted`);
            return responseData;
        } catch (error) {
            throw new Error(error);
        }
    }

    async insertOrReplaceObj(obj) {
        try {
            if (obj.partitionKey === undefined || obj.rowKey === undefined) {
                throw new Error(`PartitionKey and RowKey are required`);
            }
            let entity = this.tableStruct.getEntityFromObj(obj);
            let responseData = await this.insertOrReplaceEntity(entity);
            return this.tableStruct.getObjFromEntity(responseData);
        } catch (error) {
            throw new Error(error);
        }
    }

    async insertOrMergeObj(obj) {
        console.log(typeof obj)
        console.log(obj);
        try {
            if (obj.partitionKey === undefined || obj.rowKey === undefined) {
                throw new Error(`PartitionKey and RowKey are required`);
            }
            let entity = this.tableStruct.getEntityFromObj(obj);
            let responseData = await this.insertOrMergeEntity(entity);
            return this.tableStruct.getObjFromEntity(responseData);
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * 
     * @param {string} partitionKey 
     * @param {string} rowKey 
     */
    async retrieveEntityByKey(partitionKey, rowKey) {
        try {
            let responseData = await this.tableSvc.getEntity(partitionKey, rowKey);
            console.log(`Entity retrieved`);
            return responseData;
        } catch (error) {
            throw new Error(error);
        }
    }

    async retrieveObjByKey(partitionKey, rowKey) {
        try {
            let entity = await this.retrieveEntityByKey(partitionKey, rowKey);
            return this.tableStruct.getObjFromEntity(entity);
        } catch (error) {
            console.error(error);
        }
    }

    // old SDK querying a table didn't provide a built in way to handle pagination and we had to use continuationToken
    // In the new one, we return a PagedAsyncIterableIterator that handles the details of pagination internally, simplifying the task of iteration

    /**
     * Retrieve an entity by PK
     */
    async retrieveObjById(id) {
        try {
            let obj;
            const query = AzureTable.createQuery(`PartitionKey eq '${id}'`);
            let queryResults = await this.execQueryAllObj(query)
            if (queryResults && queryResults.length == 1) {
                obj = queryResults[0];
            }
            return obj;
        } catch (error) {
            console.error(error);
        }
    }

    // new SDK allows deleting an entity with just the partitionKey and rowKey
    async deleteEntityByKey(partitionKey, rowKey) {
        try {
            let dataResponse = await this.tableSvc.deleteEntity(partitionKey, rowKey);
            console.log(`Entity deleted: ${partitionKey}`)
            return dataResponse;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * Executes a raw, Azure Table Storage query
     * @param {object} query - the filter object to supply to queryOptions
     * ex:  { filter: odata`${fields}` };
     * @returns {PagedAsyncIterableIterator}
     */
    async execQueryRaw(query) {
        try {
            let queryResults = this.tableSvc.listEntities({
                queryOptions: { query }
                // ex: { filter: odata`amount le 3660` }
            });
            return queryResults;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * @param {*} query 
     * @returns array of entities, single entity, or undefined if no entities found
     */
    async execQuery(query) {
        try {
            let plainObjs = [];
            let queryResults = await this.execQueryRaw(query);
            if (queryResults && queryResults.length > 0) {
                queryResults.forEach(entity => {
                    plainObjs.push(AzureTable.convertTableStorageToObj(entity));
                });
            }
            return plainObjs;
        } catch (error) {
            throw new Error(error)
        }
    }

    async execQueryAll(query) {
        try {
            let all = [];
            let results = await this.execQuery(query);
            all.push(...results);
            return all;
        } catch (error) {
            console.error(error);
        }
    }

    async execQueryAllObj(query = undefined) {
        try {
            if (query === undefined) {
                query = AzureTable.createQuery(`PartitionKey eq ${this.tableStruct.partitionKey}`);
            } //returns { filter: odata`${fields}` };
            let all = [];
            let results = await this.execQueryRaw(query);
            all.push(...results);
            return all.map(this.tableStruct.getObjFromEntity);
        } catch (error) {
            console.error(error);
        }
    }





    /**
     * Static Functions
     */

    /**
     * @param {PagedAsyncIterableIterator} entity
     * @returns array of entities, single entity, or undefined if no entities found
     */
    static async convertTableStorageToObj(entity) {
        let plainObj = {};
        for (let property in entity) {
            if (property === 'metadata') continue;
            plainObj[property] = entity[property];
        }
        return plainObj;
    }


    /**
     * @param {string} fields - filter criteria, ex: `PartitionKey eq '${partitionKey}'`
     * @var {odata} odata - a helper function that takes care of encoding the query filter, it will add quotes around any ${} variables
     */
    static createQuery(fields) {
        // construct criteria
        if (fields === ``) {
            return { filter: `` };
        }
        return { filter: odata`${fields}` };
    }

    static uuid() {
        return uuid();
    }

    // we do not need any other entGen(entGen(), uniqueKey()) methods because the new SDK allows for normal JS values to be used without entityGenerator. 
    // https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/tables/data-tables/MigrationGuide.md#adding-data-to-the-table

    static create(accountName, accountKey, tableName) {
        const table = new AzureTable(accountName, accountKey, tableName);
        return table.init();
    }

    static async readFirst(accountName, accountKey, tableName, partitionKey, rowKey = undefined) {
        try {
            let azureTable = await AzureTable.create(accountName, accountKey, tableName);
            let query;
            if (rowKey === undefined) {
                query = AzureTable.createQuery(`PartitionKey eq ${partitionKey}`);
            } else {
                query = AzureTable.createQuery(`PartitionKey eq ${partitionKey} and RowKey eq '${rowKey}'`);
            }
            return azureTable.execQuery(query);
        } catch (error) {
            console.error(error)
        }
    }

    /**
     * 
     * @function readAll - reads all entities, so no filter
     * **supply odata with <``> and that will return all entities
     */
    static async readAll(accountName, accountKey, tableName) {
        try {
            let azureTable = await AzureTable.create(accountName, accountKey, tableName);
            let query = AzureTable.createQuery(``);
            return azureTable.execQueryAll(query);
        } catch (error) {
            console.error(error)
        }
    }



}





class ModelBase {
    //? I do not see any usage of this class throughout the codebase of rulesENgine
    //TODO confirm with curt if we need this class
}


module.exports = {
    AzureTable,
    AzureTableStruct,
    ModelBase,
    PROPERTY_TYPES
}