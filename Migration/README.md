This folder will be used as a playground while developing new azureQueue, azureTable, and azureBlob JS files.

plan is to start with the azureQueue.js file and follow the migration guide on the github repo.

so start with a copy, then change it up, logic by logic...
    -- use a copy of my ./_nodeApp/app.js file to test out the logic in my new azureQueue.js file

# TABLE MIGRATION
- woah okay so through testing and stuff, I have realized and confrimed that a table can be created and  structured by simply providing the values AS THEY ARE and the sdk knows how to represent them in the table... so I can just use the values as they are and the sdk will do the rest... and that means that the new tableStruct class will be a lot smaller and less lines of code..
<!--it will work as PartitionKEy OR partitionKey...? -->
<!-- ! NO MORE CAPITALIZING THE FIRST letter -->

```js
//!!! HERE is HOW WE DO THE QUERYING
//! use this logic in the newAzureTable.js file
    const priceListResults = tableClient.listEntities({
        queryOptions: { filter: odata`amount le 3660` }
    });
    for await (const product of priceListResults) {
        console.log(`${product.description}: ${product.amount}`);
    }
```

<!-- TODO: will eventually need to update to SiteUsers and RuleSets and other models especially for parts like selectBYusername or ID... bc querying is different with new SDK... -->


<!-- ? So a Map is an insert-ordered key-value store for Javascript, which additionally allows mapping any value to any value, instead of restricting keys to be strings. This can greatly simplify some code where ordering is important, or where objects or other complex data types need to be associated with other data. -->