const express = require('express')
const fs = require('fs')
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require("dotenv").config();
const AzureQueue = require('./azureQueue').AzureQueue;


const insertMessage = async (message) => {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;    
    const azureQueue = new AzureQueue(connectionString, "apirequests");
    const result = await azureQueue.insertMessage(message);
    return result;
};

// let data = `{"filename": "40ca60ec-417b-4124-8dfe-1adbe854a0b3.json" }`
let data = "40ca60ec-417b-4124-8dfe-1adbe854a0b3.json"


insertMessage(data).then(result => {
    console.log(result);
}).catch(err => {
    console.log(err);
});
