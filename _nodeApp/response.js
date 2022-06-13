const exampleResponse = [
  {
    requestId: 'a66959c0-d7f7-40a7-af6f-d1be3b0abb47',
    step: 'result',
    serverTimings: '5118.561299999999ms', statusCode: 200
  }, 
  { requestId: 'a66959c0-d7f7-40a7-af6f-d1be3b0abb47', step: 'body' },
  {
    requestId: 'a66959c0-d7f7-40a7-af6f-d1be3b0abb47',
    step: 'start',
    method: 'POST'
  }
]



for (let x = 1; x < relArr.length; x++) {

  newRow.PartitionKey = relArr[x].requestId;

  newRow.serverTiming = newRow.serverTiming !== null ? relArr[x].serverTimings || "" : newRow.serverTiming;

  newRow.url = newRow.url !== null ? relArr[x].url || "" : newRow.url;

  newRow.status = newRow.statusCode !== "" ? relArr[x].statusCode || "" : newRow.statusCode;
  newRow.method = newRow.method !== "" ? relArr[x].method || "" : newRow.method;
  
  console.log(newRow.method)//! this is logged so why not recording in table??
  
  
  // TODO logic to get the below props from blob
  newRow.rule = relArr[x].rule || "";
  newRow.requestDataType = relArr[x].requestDataType || "";
  newRow.responseDataType = relArr[x].responseDataType || "";
}