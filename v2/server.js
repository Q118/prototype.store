require('dotenv').config();

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * @summary View Engine set up  
 */
console.log('Initializing the EJS view engine');
// Define where the views are stored
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/master');
// ^This lets us have one, main structural page in /views/layouts/master.ejs
app.set('layout extractScripts', true)
app.set('layout extractStyles', true)




app.get("/", (req, res) => {
    // render the main page
    res.render('view', {
        name: "shelby",
        message: "This is a message",
        title: "Compliance Rules Workbench"
    });
});

app.listen(3000, () => {
    console.log('webApp is running on port 3000');
});