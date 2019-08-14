const express = require('express');
const app = express();
var cookieParser = require('cookie-parser');
const constants = require('./env.js');
const port = process.env.port || constants.PORT;

app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Resource
app.use('/css', express.static(__dirname + '/views/css'));
app.use('/js', express.static(__dirname + '/views/js'));
app.use('/plugins', express.static(__dirname + '/views/plugins'))
app.use('/img', express.static(__dirname + '/views/img'));

const model = require(constants.MODEL_PATH);
model.init();

const controller = require(constants.CONTROLLER_PATH);
controller.run(app);

app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});
