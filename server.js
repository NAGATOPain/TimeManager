const express = require('express');
const app = express();
const port = process.env.port || 6969;
const constants = require('./env.js');

app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Resource
app.use('/css', express.static(__dirname + '/views/css'));
app.use('/js', express.static(__dirname + '/views/js'));
app.use('/img', express.static(__dirname + '/views/img'));

const controller = require(constants.CONTROLLER_PATH);
controller.run(app);

app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});
