/**
 * this file to create a new classes for the Azure Table
 * with the new SDK
 * prob most important because this class is used 
 * heavily throughout rules-engine API
 * TODO: will also need to refactor CallTracking after this
 */

// ? Azure tableStruct is used only in the constructor of AzureTable..not actually used anywhere else.. but I think will still need it to be here to use... well lets grok the migration first and see...
// so actually may not need to really change much to the struct class bc it doesnt use the SDK really.. its built with js and lodash

const { TableClient, AzureNamedKeyCredential, TableEntity, odata } = require("@azure/data-tables");
// const uuid = require('uuid').v4;
// const _ = require('lodash');



//*Previously in azure-storage, we would create our entity as an object with a specific structure for representing values, also keeping in mind that there are 2 required properties PartitionKey and RowKey in which the capital P and R respectively are important as the service is case sensitive.
//? There were 2 ways to set the property values in azure-storage the raw way in which the value of each property is an object with a property named `_` containing the value and an optional property named $ to specify the Edm type. If no type is passed it is inferred
//*The other way in azure-storage to insert an entity was to use the entityGenerator which helped abstracting the creation of the value object described above
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


// #region
// class AzureTableStruct {
//     //keeping this relatively the same other than remove entGen.... 
//     //no actually need to change throughout bc comments above..
//     constructor() {
//         this.propDefs = new Map();

//         // Every table MUST have these
//         this.add('PartitionKey', PROPERTY_TYPES.STRING, 'PartitionKey');
//         this.add('RowKey', PROPERTY_TYPES.STRING, 'RowKey');
//         this.add('Timestamp', PROPERTY_TYPES.DATETIME, 'Timestamp');

//         // Ensure this is properly bound if these are referenced in pointers
//         this.add = this.add.bind(this);
//         this.addBoolean = this.addBoolean.bind(this);
//         this.addDateTime = this.addDateTime.bind(this);
//         this.addInt64 = this.addInt64.bind(this);
//         this.addString = this.addString.bind(this);
//         this.genEntityValueByPropDef = this.genEntityValueByPropDef.bind(this);
//         this.genEntityValueByPropName = this.genEntityValueByPropName.bind(this);
//         this.getEntityFromObj = this.getEntityFromObj.bind(this);
//         this.getObjFromEntity = this.getObjFromEntity.bind(this);
//     }

//     //? i dont think we need anythign like this bc this is all not needed since the new SDK handles setting the type itself..,.
//     static createPropDef(entityPropName, propType, objPropName = undefined) {
//         if (objPropName === undefined) {
//             // Omit required Azure Table Storage property names from lowercasing
//             // the first letter as a default.
//             if (entityPropName === 'PartitionKey' || entityPropName === 'RowKey' || entityPropName === 'Timestamp') {
//                 objPropName = entityPropName;
//             } else {
//                 objPropName = entityPropName.charAt(0).toLowerCase() + entityPropName.slice(1);
//             }
//         }
//         let propDef = {
//             entityPropName,
//             objPropName,
//             propType,
//         }
//         return propDef;
//     }

//     add(entityPropName, propType, objPropName = undefined) {
//         let propDef = AzureTableStruct.createPropDef(entityPropName, propType, objPropName);
//         this.propDefs.set(entityPropName, propDef);
//         return this;
//     }

//     addString(name, objPropName = undefined) {
//         return this.add(name, PROPERTY_TYPES.STRING, objPropName);
//     }

//     addDateTime(name, objPropName = undefined) {
//         return this.add(name, PROPERTY_TYPES.DATETIME, objPropName);
//     }

//     addBoolean(name, objPropName = undefined) {
//         return this.add(name, PROPERTY_TYPES.BOOLEAN, objPropName);
//     }

//     addInt64(name, objPropName = undefined) {
//         return this.add(name, PROPERTY_TYPES.INT64, objPropName);
//     }

//     getObjValueByPropDef(obj, propDef, defaultValue = undefined) {
//         let objValue = obj[propDef.objPropName];
//         // Set a default if undefined and the default is given
//         if (objValue === undefined && defaultValue !== undefined) objValue = defaultValue;
//         return objValue
//     }

//     // NEED TO UNDERSTAND MORE LIKE what objValue even is and where its coming fromm...
//     //! it doesnt actually get called anywhere in the code.. this method... only within this file IN the STruct class
//     genEntityValueByPropDef(obj, propDef, defaultValue = undefined) {
//         let entityValue = undefined;
//         let objValue = this.getObjValueByPropDef(obj, propDef, defaultValue);
//         if (propDef) {
//             switch (propDef.propType) {
//                 //! here we are using the new SDK to create the entity value from the obj value
//                 //TODO: Need to Test all of this and also replace other parts later in code
//                 // case PROPERTY_TYPES.STRING: entityValue = entGen.String(objValue); break;
//                 case PROPERTY_TYPES.STRING:
//                     entityValue = objValue.toString();
//                     break;
//                 // case PROPERTY_TYPES.INT64: entityValue = entGen.Int64(objValue); break;
//                 case PROPERTY_TYPES.INT64:
//                     entityValue = BigInt(objValue);
//                     break;
//                 // case PROPERTY_TYPES.DATETIME: entityValue = entGen.DateTime(objValue); break;
//                 case PROPERTY_TYPES.DATETIME:
//                     entityValue = new Date(objValue);
//                     break;
//                 // case PROPERTY_TYPES.BOOLEAN:  
//                 // objValue = Boolean(objValue || false);
//                 // entityValue = entGen.Boolean(objValue);
//                 // break;
//                 case PROPERTY_TYPES.BOOLEAN:
//                     entityValue = Boolean(objValue || false);
//                     break;
//                 //! case PROPERTY_TYPES.INT32: entityValue = entGen.Int32(objValue); break;
//                 case PROPERTY_TYPES.INT32: entityValue = entGen.Int32(objValue); break;
//                 // case PROPERTY_TYPES.BINARY: entityValue = entGen.Binary(objValue); break;
//                 case PROPERTY_TYPES.BINARY: entityValue = parseInt(objValue, 2); break;
//                 case PROPERTY_TYPES.GUID: entityValue = entGen.Guid(objValue); break;
//                 case PROPERTY_TYPES.DOUBLE: entityValue = entGen.Double(objValue); break;
//                 default:
//                     let msg = `Unknown property type ${propDef.propType} found for ${propDefName}`;
//                     throw new Error(msg);
//             }
//         } else {
//             let msg = `Property definition not found for ${propDefName}`;
//             throw new Error(msg);
//         }
//         return entityValue;
//     }

//     genEntityValueByPropName(obj, entityPropName) {
//         let propDef = this.propDefs.get(entityPropName);
//         return this.genEntityValueFromPropDef(obj, propDef);
//     }

//     getEntityFromObj(obj) {
//         let entity = {};
//         function buildEntity(propDef) {
//             entity[propDef.entityPropName] = this.genEntityValueByPropDef(obj, propDef);
//         };
//         this.propDefs.forEach(buildEntity.bind(this));
//         return entity;
//     }

//     /**
//      * Creates an entity with only the properties
//      * that exist in the object.
//      * @param {*} obj 
//      */
//     getMergeEntityFromObj(obj) {
//         let entity = {};
//         function buildEntity(propDef) {
//             if (_.has(obj, propDef.objPropName)) {
//                 entity[propDef.entityPropName] = this.genEntityValueByPropDef(obj, propDef);
//             }
//         };
//         this.propDefs.forEach(buildEntity.bind(this));
//         return entity;
//     }

//     getObjFromEntity(entity) {
//         let obj = {};
//         this.propDefs.forEach(function (propDef) {
//             if (_.has(entity, propDef.entityPropName + '._')) {
//                 obj[propDef.objPropName] = entity[propDef.entityPropName]._;
//             }
//         });
//         return obj;
//     }

// }
// #endregion

class AzureTable {
    constructor(accountName, accountKey, tableName) {
        const tablesEndpoint = `https://${accountName}.table.core.windows.net`;
        this.tableName = tableName;
        this.tableSvc = new TableClient(
            tablesEndpoint,
            tableName,
            new AzureNamedKeyCredential(accountName, accountKey)
        );





        // this.tableStruct = new AzureTableStruct();

        this.init = this.init.bind(this);
        this.insertOrReplaceEntity = this.insertOrReplaceEntity.bind(this);

        // this.retrieveEntityByKey = this.retrieveEntityByKey.bind(this);
        // this.deleteEntityByKey = this.deleteEntityByKey.bind(this);
        // this.execQueryRaw = this.execQueryRaw.bind(this);
        // this.execQuery = this.execQuery.bind(this);
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

    /**

     */
    async insertOrReplaceEntity(entity) {
        console.log("!")
        console.log(entity.partitionKey)
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

    async retrieveObjById(id) {
        try {
            //lists all entities with PartitionKey = id
            const listResults = this.tableSvc.listEntities({
                queryOptions: { filter: odata`PartitionKey eq ${id}` }
            });
            let entities = [];
            for await (const entity of listResults) {
                entities.push(entity);
            };
            if (entities.length === 0) return undefined;
            if (entities.length === 1) return entities[0];
            return entities;
        } catch (error) {
            throw new Error(error);
        }
    }



}



// yEA I THINK WE can do it without the struct class, can try to just include inside these methods like what he tried to include in his methods that have the tableStuct


module.exports = {
    AzureTable,
}