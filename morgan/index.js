var express = require('express')
var morgan = require('morgan')
var path = require('path')
var rfs = require('rotating-file-stream') // version 2.x

var app = express()

app.use(express.urlencoded({ extended: true }))


// create a rotating write stream
var accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, 'log')
})

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }))


app.use(morgan(':method :host :status :param[id] :res[content-length] - :response-time ms'));

morgan.token('param', function (req, res, param) {
    return req.params[param];
});

app.get('/', function (req, res) {
    res.send('hello, world!')
})

app.listen(3000, () => {
    console.log('running on port 4000');
});