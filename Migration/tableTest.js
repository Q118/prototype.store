/**
 * This file to simply test the AzureTableStruct logic
 * and the little nuences from the migration
 */

// const { odata, TableClient, AzureNamedKeyCredential } = require("@azure/data-tables");
const tableName = "devTest";
const tablesEndpoint = "https://accsrusdev.table.core.windows.net/";
const { AzureTable } = require("./newAzureTable");


const tableClient = new AzureTable(
    "accsrusdev", "Plumb2Rm3XSJ3aF7sSc8Mm2XiPkZe0ILMIdSAPYhkfqpvGms7SYb/5hLICuewvfWVvjtDkZcWP7MojXpS8TZuA==", tableName
);

// Creates the table with `tableName` if it doesn't exist
const task1 = {
    partitionKey: "1111",
    rowKey: "",
    description: "!!! out the trash",
    completed: true,
    amount: 3659,
    bigAmount: BigInt(43351435454115235),
    // above creates a Type of Int64 in table
    dueDate: new Date(2015, 6, 20)
};


let modelOptions = {
    bigAmount: null
}

async function main() {
    // await tableClient.init();
    // await tableClient.createEntity(task1); // lets see if we can merge stuff also...
    // await tableClient.upsertEntity(task1);
    // okay TO MERGE WE NEED TO USE updateEntity()
    // no use UPSERT, which inserts if the entity doesn't exist or updates the existing one
    // await tableClient.insertOrReplaceEntity(task1);
    // return await tableClient.retrieveObjById("1111");
    // return await tableClient.deleteEntityByKey("1111", "");

    let queryObj = {
        text: "amount ge 3660"
    }

    return await tableClient.execQueryRaw("amount ge 3660");

//!!! HERE is HOW WE DO THE QUERYING
//! use this logic in the newAzureTable.js file
    // const priceListResults = tableClient.listEntities({
    //     queryOptions: { filter: odata`amount le 3660` }
    // });
    // for await (const product of priceListResults) {
    //     console.log(`${product.description}: ${product.amount}`);
    // }

};


main().then((res) => {
    console.log(res);
}).catch((err) => {
    console.log(err);
});