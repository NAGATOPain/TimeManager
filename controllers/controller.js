const VIEWS_PATH = '../views/';
var renderer = require('./featureRenderer.js');
var enviroment = require('../env.js');
var model = require('../models/model.js');

var signInUpRequestData = {
    APP_NAME: enviroment.APP_NAME,
    APP_VERSION: enviroment.APP_VERSION,
    alertMessage: {
        visibility: "invisible",
        message: ""
    }
};


async function checkCookieForLogIn(cookies){
    let cookieArray = model.parseCookie(cookies);
    if (cookieArray){
        let result = await model.isLoggedIn(...cookieArray);
        return result;
    }
    return false;
}

function signUpPageProcessing(app){

    app.get('/signup', async (req, res) => {
        let checkCookie = await checkCookieForLogIn(req.cookies);
        if (checkCookie){
            res.status(200).redirect('/dashboard');
        }
        else {
            signInUpRequestData.alertMessage.visibility = "invisible";
            signInUpRequestData.alertMessage.message = "";
            res.render(VIEWS_PATH + 'signup', signInUpRequestData);
        }
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
            signInUpRequestData.alertMessage.visibility = "visible";
            signInUpRequestData.alertMessage.message = "This account has existed!";
            res.render(VIEWS_PATH + 'signup', signInUpRequestData);
        }
    });
}

function signInPageProcessing(app){

    app.get('/signin', async (req, res) => {
        let checkCookie = await checkCookieForLogIn(req.cookies);
        if (checkCookie){
            res.status(200).redirect('/dashboard');
        }
        else {
            signInUpRequestData.alertMessage.visibility = "invisible";
            signInUpRequestData.alertMessage.message = "";
            res.render(VIEWS_PATH + 'signin', signInUpRequestData);
        }
    });

    app.post('/signin', async (req, res) => {

        let username = req.body.username;
        let password = req.body.password;

        let message = await model.validateLogin(username, password);
        if (typeof message === 'object' || message[0] === 'OK'){
            res.cookie('acc', {items: [username, message[1]]});
            res.status(200).redirect('/dashboard');
        }
        else if (message === 'N_Exist'){
            signInUpRequestData.alertMessage.visibility = "visible";
            signInUpRequestData.alertMessage.message = "This account didn't exist!";
            res.render(VIEWS_PATH + 'signin', signInUpRequestData);
        }
        else if (message == 'P_Wrong'){
            signInUpRequestData.alertMessage.visibility = "visible";
            signInUpRequestData.alertMessage.message = "The password is wrong!";
            res.render(VIEWS_PATH + 'signin', signInUpRequestData);
        }
    });
}

function dashBoardProcessing(app){

    app.post('/dashboard/signout', async (req, res) => {
        let cookieArray = model.parseCookie(req.cookies);
        if (cookieArray){
            let deleteSuccessfull = await model.deleteTokenOfUser(...cookieArray);
            if (deleteSuccessfull){
                res.clearCookie('acc');
                res.redirect('/signin');
            }
        }
    });

    app.get('/dashboard', async (req, res) => {
        let checkCookie = await checkCookieForLogIn(req.cookies);
        if (!checkCookie){
            res.status(200).redirect('/signin');
        }
        else {
            requestData = renderer.render('btnHome');
            requestData.title = `Hi ${model.parseCookie(req.cookies)[0]}, may I help you?`;
            res.status(200).render(VIEWS_PATH + 'dashboard', requestData);
        }
    });

    app.post('/dashboard', async (req, res) => {
        let btnClicked = req.body.btnClicked;
        res.status(200).send(renderer.render(btnClicked));
    });
}

exports.run = (app) => {

    console.log("Imported controller");

    app.get('/', async (req, res) => {
        res.redirect('/signin');
    });

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
