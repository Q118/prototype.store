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


let inputForMessagesToRow = [
  {
    requestId: '5cf8394e-4cf4-4ffd-bc99-28ee068119d3',
    step: 'body'
  },
  {
    requestId: '5cf8394e-4cf4-4ffd-bc99-28ee068119d3',
    step: 'start',
    method: 'GET'
  },
  {
    requestId: '5cf8394e-4cf4-4ffd-bc99-28ee068119d3',
    step: 'result',
    serverTimings: '1874.8029ms',
    statusCode: 200
  }
]

const bodyBlob = {
  data: [
    { type: 'evaluationData', attributes: [Object] },

    { type: 'rule', attributes: [Object] }
  ]
}


let blobArray = [
  {
    method: 'GET',
    url: '/v1/eav/test/test',
    IP: '::ffff:127.0.0.1',
    machineName: 'WSNA2180',
    headers: {
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/json',
      'ocp-apim-subscription-key': '3d519c4fb57d42bb84505bfb8cc64099',
      'x-api-user': 'sr',
      'x-api-key': 'f432bde6-402e-41de-a4cb-67b722ed16ba92b68684-077e-49d0-8e57-e359c6e6018a',
      'user-agent': 'axios/0.19.0',
      host: 'localhost:8080',
      connection: 'close'
    }
  },
  {},
  {
    headers: {
      'x-powered-by': 'Express',
      vary: 'Origin, Accept-Encoding',
      'access-control-expose-headers': 'Server-Timing',
      'cache-control': 'private, no-cache, no-store, must-revalidate',
      expires: '-1',
      pragma: 'no-cache',
      'content-type': 'application/json; charset=utf-8',
      'content-length': '474',
      etag: 'W/"1da-4+4J3JsdvZHi+xUfWLLC7ynyjAM"'
    },
    response: { links: [Object], data: [Array], meta: [Object] }
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