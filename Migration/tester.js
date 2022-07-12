const azure = require("azure-storage");



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

async function peekMessages() {
    try {
        let peekMessageResponse = await queueSvc.peekMessages();
        return peekMessageResponse.peekedMessageItems[0];
    } catch (error) {
        throw new Error(error);
    }
}

peekMessages().then(result => {
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



const response = await queueClient.receiveMessages();
if (response.receivedMessageItems.length == 1) {
    const receivedMessageItem = response.receivedMessageItems[0];
    console.log("Processing & deleting message with content:", receivedMessageItem.messageText);
    const deleteMessageResponse = await queueClient.deleteMessage(
        receivedMessageItem.messageId,
        receivedMessageItem.popReceipt
    );
    console.log(
        "Delete message successfully, service assigned request Id:",
        deleteMessageResponse.requestId
    );
}