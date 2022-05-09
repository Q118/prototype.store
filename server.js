var express = require('express')
var fs = require('fs')
var morgan = require('morgan')
var path = require('path')

var app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { v4: genId } = require('uuid');
// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })


const assignId = (req, res, next) => {
    req.id = genId();
    next()
}

// setup the guid
morgan.token('id', getId = (req) => {
    return req.id
})
//? combined format: :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"


app.use(assignId)

morgan.token('req-body', function (req, res) {
    return JSON.stringify(req.body)
})

const originalSend = app.response.send

app.response.send = function sendOverWrite(body) {
  originalSend.call(this, body)
  this.__custombody__ = body
}

morgan.token('res-body', (_req, res) =>
  JSON.stringify(res.__custombody__),
)

// setup the logger
app.use(morgan(`GUID: :id :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" Body: :req-body, :res-body`, { stream: accessLogStream }))




app.get('/', (req, res) => {
    
    setTimeout(function () {
        res.send('hello, world!')
    }, 668);
    
})


app.listen(3000, () => {
    console.log('Example app listening on port 3000!')
})

