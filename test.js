// serverTiming: "totl;dur=8.2517, vald;dur=0.0771, proc;dur=8.1538, xfrm;dur=0.0095ms"
//parse the above string to get the value of totl;dur=

const aderantServerTiming = "totl;dur=8.2517, vald;dur=0.0771, proc;dur=8.1538, xfrm;dur=0.0095ms"

let serverTiming = aderantServerTiming;

let timingArr = serverTiming.split(", ");
serverTiming = timingArr[0].split("=")[1];


// console.log(timingArr);

// console.log(serverTiming);

let msgObj = {
  "requestId": "f90efe55-8c24-4ac8-911f-a5b124fedf15",
  "step": "result",
  "serverTiming": "6.7874ms",
  "statusCode": 200
}

//!this is returns in ../triage/apirequest as a local
/* const tenantData = {
    PartitionKey: 'sr', RowKey: '',
    Timestamp: "new Date("2022-06-29T14":54:25.414Z"),
    displayName: "Shelby's Dev Tenancy",
    azureLocation: 'eastus2',
    deploymentStatus: 'Development',
    apiSecret: 'f432bde6-402e-41de-a4cb-67b722ed16ba92b68684-077e-49d0-8e57-e359c6e6018a',
    dbConnectionString: 'Data source=accsrusdev.database.windows.net;Initial Catalog=accsrusdev;User ID=adminsr;Password=Ot5oYcVgxB7H4SxLFWKE26eJ5kvzfU4U;',
    storageConnectionString: 'DefaultEndpointsProtocol=https;AccountName=accsrusdev;AccountKey=Plumb2Rm3XSJ3aF7sSc8Mm2XiPkZe0ILMIdSAPYhkfqpvGms7SYb/5hLICuewvfWVvjtDkZcWP7MojXpS8TZuA==;',
    settings: '{}',
    tenantId: 'sr'
}
  */


let reqList = [
  {
    PartitionKey: '31241432534',
    RowKey: '',
    Timestamp: "2022-06-16T19:30:46.083Z"
  },
  {
    PartitionKey: '623be9c3-ea49-4578-8ade-bf40e65fd991',
    RowKey: '',
    Timestamp: "2022-07-05T15:35:54.8923342Z"
  },
  {
    PartitionKey: 'dfmsaf',
    RowKey: '',
    Timestamp: "2022-06-22T19:30:46.083Z"
  },
  {
    PartitionKey: '4578-8ade-bf40e65fd991',
    RowKey: '',
    Timestamp: "2021-06-16T19:30:32.147Z"
  }]

  //change the order of the array so that it is sorted by the Timestamp from most recent to least recent
  const sorted = reqList.sort((a, b) => {
    // change this to reverse the order:
    // return (a.Timestamp < b.Timestamp) ? -1 : ((a.Timestamp > b.Timestamp) ? 1 : 0)
    return (a.Timestamp > b.Timestamp) ? -1 : ((a.Timestamp < b.Timestamp) ? 1 : 0)
  
  });
  console.log(sorted)

// reqList.forEach(req => {
//   console.log(req.Timestamp)
//   req.timeStamp = req.Timestamp.toISOString();
//   delete req.Timestamp;
// });

// root: .containerOf(reqList) the root is by default the whole screen...
// rootMargin: "100px"