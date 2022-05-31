const express = require('express')
const fs = require('fs')
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const AzureQueue = require('./azureQueue').AzureQueue;

