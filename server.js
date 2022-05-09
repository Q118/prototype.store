var express = require('express')
var fs = require('fs')
var morgan = require('morgan')
var path = require('path')
var app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })


/**
 * @description - set up the guid
 */
const { v4: genId } = require('uuid');
const assignId = (req, res, next) => {
    req.id = genId();
    next()
}
morgan.token('id', getId = (req) => {
    return req.id
})
app.use(assignId)


/**
 * @description - middleware to capture the request body and headers
 */
morgan.token('req-body', function (req, res) {
    return JSON.stringify(req.body)
})
morgan.token('req-headers', function (req, res) {
    return JSON.stringify(req.headers)
})


/**
 * @description - middleware to capture the response body and headers
 */
const originalSend = app.response.send
app.response.send = function sendOverWrite(body) {
    originalSend.call(this, body)
    this.__custombody__ = body
}
morgan.token('res-body', (_req, res) =>
    JSON.stringify(res.__custombody__),
)
morgan.token('res-headers', (_req, res) =>
    JSON.stringify(res.getHeaders()),
)


// setup the logger
app.use(morgan(`GUID: :id,
IP: :remote-addr,
Time: [:date[clf]],
Method: :method,
URL: :url,  
Status: :status,
Content-Length: :res[content-length],
Elapsed-Time :total-time[digits] ms,
REQUEST 
Headers: :req-headers, 
Body: :req-body, 
RESPONSE 
Headers: :res-headers, 
Body: :res-body
`, { stream: accessLogStream }))




app.get('/', (req, res) => {
    setTimeout(function () {
        res.send('hellooooooo, world!')
        // console.log(req.headers);
    }, 668);
})


app.listen(3000, () => {
    console.log('Example app listening on port 3000!')
})

