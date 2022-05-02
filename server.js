const http = require("http");

const nodeServer = http.createServer((request, response) => {
    const requestStart = Date.now();

    let errorMessage = null;
    let body = [];
    request.on("data", chunk => {
        // fired when the server received new chunks of data from the client
        body.push(chunk);
    });
    request.on("end", () => {
        // called when all data has been sent
        body = Buffer.concat(body);
        body = body.toString();
    });
    request.on("error", error => {
        // called when something goes wrong
        errorMessage = error.message;
    });

    //The IncomingMessage class implements the ReadableStream interface. 
    //uses the events of that interface to signal when body data from the client arrives.

    response.on("finish", () => {

        // ServerResponse class has a finish event that is fired the sever finished sending it’s response. This doesn’t mean the client received everything, but it’s an indicator that the api work is done.

        const { rawHeaders, httpVersion, method, socket, url } = request;
        const { remoteAddress, remoteFamily } = socket;

        console.log(
            JSON.stringify({
                timestamp: Date.now(),
                processingTime: Date.now() - requestStart,
                rawHeaders,
                body,
                errorMessage,
                httpVersion,
                method,
                remoteAddress,
                remoteFamily,
                url
            }, null, 2) //pretty-print
        );
    });

    process(request, response);
});

//We passed the processing of our request to a separate function to simulate an other module that takes care of it. The processing takes place asynchronously, because of the setTimeout, so synchronous logging wouldn’t get the desired result, but the finish event takes care of this by firing after response.end() was called.

const process = (request, response) => {
    setTimeout(() => {
        response.end();
    }, 100);
};

nodeServer.listen(8888, () => {
    console.log("Node server is running on port 8888");
});


/**
 * @description - json-server for mocked backend
 */
const jsonServer = require('json-server');
//const { get } = require('http');
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(router)
server.listen(3000, () => {
    console.log('JSON Server is running on 3000')
})