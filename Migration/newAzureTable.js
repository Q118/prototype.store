/**
 * this file to create a new classes for the Azure Table
 * with the new SDK
 * prob most important because this class is used 
 * heavily throughout rules-engine API
 * TODO: will also need to refactor CallTracking after this
 */



const { TableClient, AzureNamedKeyCredential, TableEntity, odata } = require("@azure/data-tables");

// const uuid = require('uuid').v4;
const _ = require('lodash');

//! use example: https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/tables/data-tables/samples/v12/javascript/workingWithInt64.js
//! to set up the structure class...


//*Previously in azure-storage, we would create our entity as an object with a specific structure for representing values, also keeping in mind that there are 2 required properties PartitionKey and RowKey in which the capital P and R respectively are important as the service is case sensitive.
//? There were 2 ways to set the property values in azure-storage the raw way in which the value of each property is an object with a property named `_` containing the value and an optional property named $ to specify the Edm type. If no type is passed it is inferred
//*The other way in azure-storage was to insert an entity was to use the entityGenerator which helped abstracting the creation of the value object described above
//!Now in the new SDK, in order to have more idiomatic property names in our entities we have moved to *partitionKey* and *rowKey* (camel case). Also you no longer need to use the value object structure or entityGenerator anymore, instead use normal JavaScript values.

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
//So a Map is an insert-ordered key-value store for Javascript, which additionally allows mapping any value to any value, instead of restricting keys to be strings. This can greatly simplify some code where ordering is important, or where objects or other complex data types need to be associated with other data.

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
            objPropName = entityPropName.charAt(0).toLowerCase() + entityPropName.slice(1);
        }
        let propDef = {
            entityPropName, // e.g. 'PartitionKey' .. ? why do we need both????
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

    genEntityValueByPropDef(obj, propDef, defaultValue = undefined) {
        let entityValue = undefined;
        let objValue = this.getObjValueByPropDef(obj, propDef, defaultValue);
        if (propDef) {
            switch (propDef.propType) {
                case PROPERTY_TYPES.STRING:
                    entityValue = { value: `${objValue}`, type: "String" };
                    break;
                case PROPERTY_TYPES.INT64:
                    entityValue = { value: `${objValue}`, type: "Int64" };
                    break;
                case PROPERTY_TYPES.DATETIME:
                    entityValue = { value: `${objValue}`, type: "DateTime" };
                    //? must be in ISO 8601 format (e.g. "2019-01-01T00:00:00.000Z")
                    break;
                case PROPERTY_TYPES.BOOLEAN:
                    objValue = Boolean(objValue || false);
                    entityValue = { value: `${objValue}`, type: "Boolean" };
                    break;
                case PROPERTY_TYPES.INT32:
                    entityValue = { value: `${objValue}`, type: "Int32" };
                    break;
                case PROPERTY_TYPES.BINARY:
                    entityValue = { value: `${objValue}`, type: "Binary" };
                    break;
                case PROPERTY_TYPES.GUID:
                    entityValue = { value: `${objValue}`, type: "Guid" };
                    break;
                case PROPERTY_TYPES.DOUBLE:
                    entityValue = { value: `${objValue}`, type: "Double" };
                    break;
                default:
                    throw new Error(`Unknown property type: ${propDef.propType}`);
            }
        } else {
            throw new Error(`Property definition not found.`);
        }
        return entityValue; // value of the entity, example: 'true', its the actual value to be stored in the table
    }

    genEntityValueByPropName(obj, propName, defaultValue = undefined) {
        let propDef = this.propDefs.get(propName);
        return this.genEntityValueByPropDef(obj, propDef, defaultValue); // returns value of the entity
    }

    getEntityFromObj(obj) {
        let entity = {};
        function buildEntity(propDef) {
            entity[propDef.entityPropName] = this.genEntityValueByPropDef(obj, propDef);
        };  //????????????????????? HOW/WHY is this working?
        this.propDefs.forEach(buildEntity.bind(this));
        /*
        let self = this;
        this.propDefs.forEach((propDef) => {
            entity[propDef.entityPropName] = self.genEntityValueByPropDef(obj, propDef);
        });
        */
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



class AzureTable {
    constructor(accountName, accountKey, tableName) {
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


    async init() {
        try {
            await this.tableSvc.createTable();
            console.log(`Table created`);
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
            let responseData = await this.insertOrReplaceEntity(obj);
            console.log(`Object replaced/inserted`);
            return responseData;
        } catch (error) {
            throw new Error(error);
        }
    }

    async insertOrMergeObj(obj) {
        try {
            if (obj.partitionKey === undefined || obj.rowKey === undefined) {
                throw new Error(`PartitionKey and RowKey are required`);
            }
            let responseData = await this.insertOrMergeEntity(obj);
            console.log(`Object merged/inserted`);
            return responseData;
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
            let responseData = await this.retrieveEntityByKey(partitionKey, rowKey);
            console.log(`Object retrieved`);
            return responseData;
        } catch (error) {
            throw new Error(error);
        }
    }

    // old SDK querying a table didn't provide a built in way to handle pagination and we had to use continuationToken
    // new one, we return a PagedAsyncIterableIterator that handles the details of pagination internally, simplifying the task of iteration

    /**
     * Retrieve an entity by PK
     */
    async retrieveObjById(id) {
        try {
            //lists all entities where PartitionKey === id
            const query = `PartitionKey eq '${id}'`;
            let queryResults = await this.execQueryRaw(query)
            return await AzureTable.convertEntityToObj(queryResults);
        } catch (error) {
            throw new Error(error);
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
     * @param {string} query
     * @returns {PagedAsyncIterableIterator}
     */
    async execQueryRaw(query) {
        try {
            let queryResults = this.tableSvc.listEntities({
                queryOptions: { filter: odata(query) }
                // queryOptions: { filter: odata`amount le 3660` }
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
            let queryResults = await this.execQueryRaw(query)
            return await AzureTable.convertEntityToObj(queryResults);
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
            throw new Error(error)
        }
    }
    
    //TODO: fix above and below functions.. they need help

    async execQueryAllObj(query = undefined) {
        try {
            if (query === undefined) {
                query = AzureTable.createQuery();
                // `PartitionKey eq '${this.tableStruct.partitionKey}'`;
                // select: '*',
            }
            let all = [];
            let results = await this.execQuery(query);
            all.push(...results);
            return all;
        } catch (error) {
            throw new Error(error)
        }
    }





    /**
     * Static Functions
     */

    /**
     * @param {PagedAsyncIterableIterator} queryResults
     * @returns array of entities, single entity, or undefined if no entities found
     */
    static async convertEntityToObj(queryResults) {
        let entities = [];
        for await (const entity of queryResults) {
            entities.push(entity);
        }
        if (entities.length === 0) return undefined;
        if (entities.length === 1) return entities[0];
        return entities;
    }         



    static createQuery(fields) {
        // deconstruct criteria
        // use select to only return the fields we want
        let queryOptions;                                                                
        // {
        //      filter: odata(string)
        //      select: [<string>]
        //}
        return queryOptions
    }


    //TODO: add the rest of the static methods for this class

    static create(accountName, accountKey, tableName) {
        const table = new AzureTable(accountName, accountKey, tableName);
        return table.init();
    }

}



module.exports = {
    AzureTable,
    AzureTableStruct,
}