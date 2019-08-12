const VIEWS_PATH = '../views/';
var renderer = require('./featureRenderer.js');
var enviroment = require('../env.js');
var model = require('../models/model.js');

function signUpPageProcessing(app){
    app.get('/signup', async (req, res) => {
        res.render(VIEWS_PATH + 'signup', {APP_NAME: enviroment.APP_NAME, APP_VERSION: enviroment.APP_VERSION});
    });

    app.post('/signup', async function (req, res, next) {

        let user = req.body.username;
        let email = req.body.email;
        let pass = req.body.password;

        let message = await model.createAccount(email, user, pass);
        if (message === 'OK'){
            res.status(200).redirect('/signin');
        }
        else if (message === 'Failed'){
            res.status(200).send("This account has existed.");
        }
    });
}

function signInPageProcessing(app){
    app.get('/signin', async (req, res) => {
        res.render(VIEWS_PATH + 'signin', {APP_NAME: enviroment.APP_NAME, APP_VERSION: enviroment.APP_VERSION});
    });

    app.post('/signin', async (req, res) => {
        let username = req.body.username;
        let pass = req.body.password;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        console.log(`IP: ${ip}`);

        let message = await model.validateLogin(username, pass, ip, req.cookie.log);
        if (message === 'OK' || message[0] === 'OK'){
            res.status(200)
            .cookie('log', message[1])
            .send('cookie set')
            .redirect('/dashboard');
        }
        else if (message === 'N_Exist'){

        }
        else if (message == 'P_Wrong'){

        }
    });
}

function dashBoardProcessing(app){

    let sidebarComponents = [
        { 'id': 'btnInbox', 'icon': '/img/inbox.png', 'text': 'Inbox'},
        { 'id': 'btnBooks', 'icon': '/img/book.png', 'text': 'Books'},
        { 'id': 'btnProject', 'icon': '/img/project.png', 'text': 'Projects'},
        { 'id': 'btnDaily', 'icon': '/img/daily.png', 'text': 'Daily Works'},
        { 'id': 'btnMoney', 'icon': '/img/money.png', 'text': 'Money'},
        { 'id': 'btnSchedule', 'icon': '/img/calendar.png', 'text': 'Schedule Render'}
    ];

    let title = 'Hi there';
    let obj = {
        'sidebarComponent': sidebarComponents,
        'APP_NAME': enviroment.APP_NAME,
        'APP_VERSION': enviroment.APP_VERSION,
        'title': title
    }
    app.get('/dashboard', async (req, res) => {
        res.status(200).render(VIEWS_PATH + 'dashboard', obj);
    });

    app.post('/dashboard', async (req, res) => {
        let btnClicked = req.body.btnClicked;
        res.status(200).send(renderer.render(btnClicked));
    });
}

exports.run = (app) => {

    console.log("Imported controller");

    // Sign up page
    signUpPageProcessing(app);

    // Sign in page
    signInPageProcessing(app);

    // Dash board
    dashBoardProcessing(app);

    app.use((req, res, next) => {
        res.status(404).render(VIEWS_PATH + 'errors');
    });

}
