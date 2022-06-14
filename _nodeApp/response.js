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

var azure = require('azure-storage');
var queueService = azure.createQueueService();
var queueName = 'taskqueue';
queueService.getMessage(queueName, function (error, serverMessage) {
  if (!error) {
    // Process the message in less than 30 seconds, the message
    // text is available in serverMessage.messagetext
    queueService.deleteMessage(queueName, serverMessage.messageId, serverMessage.popReceipt, function (error) {
      if (!error) {
        // Message deleted
      }
    });
  }
});


let msgArr = [
  {
    text: {
      requestId: '51f191d4-52a6-408e-897d-f85909bf345d',
      step: 'start',
      method: 'GET'
    },
    id: '579d75c4-fbae-42e6-ade3-2a884de9de36'
  },
  {
    text: { requestId: '51f191d4-52a6-408e-897d-f85909bf345d', step: 'body' },
    id: 'd547839d-0591-42cd-b263-eb03718fe4f4'
  },
  {
    text: {
      requestId: '51f191d4-52a6-408e-897d-f85909bf345d',
      step: 'result',
      serverTimings: '234.2191ms',
      statusCode: 200
    },
    id: '5b6a61f8-61cd-4812-8f2d-25c85ea5ed64'
  },
  {
    text: {
      requestId: '1ba9978d-9736-42b1-9861-ebfab83cadb3',
      step: 'start',
      method: 'GET'
    },
    id: 'b701aab9-d119-43ef-a5fb-9de822d172c5'
  },
  {
    text: { requestId: '1ba9978d-9736-42b1-9861-ebfab83cadb3', step: 'body' },
    id: 'da1c8087-cebf-4e81-b187-150791c6acbf'
  },
  {
    text: {
      requestId: '1ba9978d-9736-42b1-9861-ebfab83cadb3',
      step: 'result',
      serverTimings: '259.0927ms',
      statusCode: 200
    },
    id: '1ca38e02-3c2e-4769-8cf6-cb083bb54383'
  }
]

let relatedSorted = [
  {
    text: { requestId: 'dd00c08f-ed10-42a6-8165-2ae2e245687c', step: 'body' },
    id: '400792f3-9d0e-4f1e-b8a5-01d01bb08e61'
  },
  {
    text: {
      requestId: 'dd00c08f-ed10-42a6-8165-2ae2e245687c',
      step: 'start',
      method: 'GET'
    },
    id: 'c61f773f-1545-4c15-8401-433c9f3aeddb'
  },
  {
    text: {
      requestId: 'dd00c08f-ed10-42a6-8165-2ae2e245687c',
      step: 'result',
      serverTimings: '255.5144ms',
      statusCode: 200
    },
    id: '44a4f118-df45-42c8-8604-767fbd4209a1'
  }
]