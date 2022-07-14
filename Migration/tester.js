const { odata, TableClient, AzureNamedKeyCredential } = require("@azure/data-tables");

// Load the .env file if it exists
const dotenv = require("dotenv");
dotenv.config();



async function queryTables() {
    console.log("== Query tables Sample ==");

    // See authenticationMethods sample for other options of creating a new client
    // const serviceClient = TableServiceClient.fromConnectionString(accountConnectionString);
const tableName = `devTester2`;

    const tbl = new TableClient(
        tablesEndpoint,
        tableName,
        new AzureNamedKeyCredential(accountName, accountKey)
    );


// list entities returns a AsyncIterableIterator
// this helps consuming paginated responses by
// automatically handling getting the next pages
// const entities = client.listEntities();

// this loop will get all the entities from all the pages
// returned by the service
// for await (const entity of entities) {
// console.log(entity);
// }


    // Create a new table
    
    // await serviceClient.createTable(tableName);

    // list the tables with a filter query, queryOptions is optional.
    // odata is a helper function that takes care of encoding the query
    // filter, in this sample it will add quotes around tableName
    const queryTableResults = tbl.listEntities({
        queryOptions: { filter: `` }
    });

    console.log(queryTableResults)

    // Iterate the results
    for await (const entity of queryTableResults) {
        console.log(entity);
    }

    // Deletes the table
    // await serviceClient.deleteTable(tableName);
}

async function main() {
    await queryTables();
}

main().catch((err) => {
    console.error("The sample encountered an error:", err);
});