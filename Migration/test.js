/** this file for testing how to convert to certain types with js */


const valueE = BigInt("4351664643");
const valeD = "3543524"

// console.log(valueE)

// console.log(new Date(valeD))

const flag = Boolean();
const flag1 = Boolean(valeD);
const flag2 = new Boolean(valeD);
const flag3 = new Boolean();

// console.log(flag)
// console.log(flag1);
// console.log(flag2);
// console.log(flag3);


// show the difference between a Map and an Object through a code example
const map = new Map();
const obj = new Object();

map.set(1, "value");
obj["key"] = "value";

// console.log(map.get(1));
// console.log(obj["key"]);

// console.log(map.has("key"));
// console.log(obj.hasOwnProperty("key"));
// console.log(`\n`);

// console.log(map);
// console.log(obj);

// console.log(typeof BigInt(43351435454115235));

let entityPropName = "partitionKey";
let objPropName = undefined;

objPropName = entityPropName.charAt(0).toLowerCase() + entityPropName.slice(1);
// console.log(objPropName);

let tenantObj = {
    PartitionKey: 'sr',
    RowKey: '',
    azureLocation: 'eastus2',
    apiSecret: 'f432bde6-402e-41de-a4cb-67b722ed16ba92b68684-077e-49d0-8e57-e359c6e6018a',
    dbConnectionString: 'Data source=accsrusdev.database.windows.net;Initial Catalog=accsrusdev;User ID=adminsr;Password=Ot5oYcVgxB7H4SxLFWKE26eJ5kvzfU4U;',
    storageConnectionString: 'DefaultEndpointsProtocol=https;AccountName=accsrusdev;AccountKey=Plumb2Rm3XSJ3aF7sSc8Mm2XiPkZe0ILMIdSAPYhkfqpvGms7SYb/5hLICuewvfWVvjtDkZcWP7MojXpS8TZuA==;',
    settings: '{}'
}

let connectionString = tenantObj.storageConnectionString;



// parse the connection string to get the account name and key
let connectionStringParts = connectionString.split(";");

async function parseAccountAndKey(stringParts) {
    let accountName, accountKey;
    let accountCredentials = {};
    stringParts.forEach(part => {
        if (part.includes("AccountName")) {
            accountName = part.split("=")[1];
        } else if (part.includes("AccountKey")) {
            accountKey = part.split("=")[1];
        }
    });
    accountCredentials = { accountName, accountKey };
    return accountCredentials;
}


// console.log(run(connectionString).accountKey);


let str = "DefaultEndpointsProtocol=https;AccountName=aderantcomplianceusdev;AccountKey=kiTqIOitoMm6Wcg0xZOHZR4Qc92orMT7XRyc4w02YddR/NHD5fEV9uEdahngPiFeCEHxtpneI16rbe6uLQnrBA==;EndpointSuffix=core.windows.net";

// parse out str to find what is between 'AccountName=' and ';'
let accountName = str.split("AccountName=")[1].split(";")[0];
let accountKey = str.split("AccountKey=")[1].split(";")[0];
// console.log(accountName);
// console.log(accountKey);

let myMap = new Map({
    'partitionKey': {
      entityPropName: 'partitionKey',
      objPropName: 'partitionKey',
      propType: 'String'
    },
    'rowKey' : {
      entityPropName: 'rowKey',  
      objPropName: 'rowKey',     
      propType: 'String'
    },
    'timestamp' : {
      entityPropName: 'timestamp',
      objPropName: 'timestamp',  
      propType: 'DateTime'       
    },
    'Name' : { entityPropName: 'Name', objPropName: 'name', propType: 'String' },
    'AzureLocation' : {
      entityPropName: 'AzureLocation',
      objPropName: 'azureLocation',
      propType: 'String'
    },
    'Environment' : {
      entityPropName: 'Environment',
      objPropName: 'environment',    propType: 'String'
    },
    'ApiSecret' : {
      entityPropName: 'ApiSecret',
      objPropName: 'apiSecret',
      propType: 'String'
    },
    'DbConnectionString' : {
      entityPropName: 'DbConnectionString',    
      objPropName: 'dbConnectionString',       
      propType: 'String'
    },
    'StorageConnectionString' : {
      entityPropName: 'StorageConnectionString',
      objPropName: 'storageConnectionString',  
      propType: 'String'
    },
    'Settings' : {
      entityPropName: 'Settings',    objPropName: 'settings',
      propType: 'String'
    }
  });

  //access the partitionKey property of the map above
    console.log(myMap.get('partitionKey').objPropName);