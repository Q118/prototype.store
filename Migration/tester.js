const azure = require("azure-storage");
const queueService = azure.createQueueService("DefaultEndpointsProtocol=https;AccountName=accsrusdev;AccountKey=Plumb2Rm3XSJ3aF7sSc8Mm2XiPkZe0ILMIdSAPYhkfqpvGms7SYb/5hLICuewvfWVvjtDkZcWP7MojXpS8TZuA==;BlobEndpoint=https://accsrusdev.blob.core.windows.net/;QueueEndpoint=https://accsrusdev.queue.core.windows.net/;TableEndpoint=https://accsrusdev.table.core.windows.net/;FileEndpoint=https://accsrusdev.file.core.windows.net/;");
const queueName = "dev-queue";

// queueService.getMessages(queueName, function (error, result) {
//     if (!error) {
//         console.log(result);
//     }
// });

function getMessages() {
    return new Promise((resolve, reject) => {
        queueService.getMessages(queueName, function (error, serverMessages) {
            if (error) {
                reject(error);
                return;
            }
            resolve(serverMessages);
        });
    });
}

getMessages().then(result => {
    console.log(result);
});

//  queueService.getMessages(queueName, function(error, serverMessages) {
//    if(!error) {
//       //Process the message in less than 30 seconds, the message
//       //text is available in serverMessages[0].messagetext
//      queueService.deleteMessage(queueName, serverMessages[0].messageId, serverMessages[0].popReceipt, function(error) {
//        if(!error){
//            // Message deleted
//        }
//      });
//    }
//  });
