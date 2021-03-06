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
        else {
            signInUpRequestData.alertMessage.visibility = "visible";
            if (message === 'Exist')
                signInUpRequestData.alertMessage.message = "This account has existed!";

            else if (message === 'Email')
                signInUpRequestData.alertMessage.message = "This email is not valid!";

            else if (message === 'Username')
                signInUpRequestData.alertMessage.message = "Username contains only alphanumeric and underscore!";

            else if (message === 'Password')
                signInUpRequestData.alertMessage.message = "Password contains only alphanumeric and underscore!";

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
        if (message[0] === 'OK'){
            res.cookie('acc', {items: [username, message[1]]});
            res.status(200).redirect('/dashboard');
        }
        else if (message[0] === 'N_Exist'){
            signInUpRequestData.alertMessage.visibility = "visible";
            signInUpRequestData.alertMessage.message = "This account didn't exist!";
            res.render(VIEWS_PATH + 'signin', signInUpRequestData);
        }
        else if (message[0] == 'P_Wrong'){
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

    // Wunderlist

    app.get('/wunderlist/token', (req, res) => {
        const requestToken = req.query.code;
        axios.post('https://www.wunderlist.com/oauth/access_token', {
            client_id: `${enviroment.WUNDERLIST_CLIENT_ID}`,
            client_secret: `${enviroment.WUNDERLIST_CLIENT_SECRET}`,
            code: `${requestToken}`
        }).then(async function(response){
            const message = await model.addWunderlistAccessToken(req, response.data.access_token);
            if (message === 'OK'){
                res.render(VIEWS_PATH + 'close');
            }
            else {
                res.status(200).send({content: message});
            }
        }).catch(function (error){
            console.log(error);
        });
    });

    // Inbox
    app.post('/dashboard/inbox/add', async (req, res) => {
        const inboxWork = req.body.inbox;
        const fromTime = req.body.fromTime;
        const toTime = req.body.toTime;
        const message = await model.addInboxWork(req, inboxWork, fromTime, toTime);
        if (message === 'OK'){
            const renderRes = await renderer.render('btnInbox', req);
            res.status(200).send(renderRes);
        }
        else {
            res.status(200).send({content: message});
        }
    });

    app.post('/dashboard/inbox/done', async (req, res) => {
        const inboxWork = req.body.name;
        const message = await model.doneInboxWork(req, inboxWork);
        if (message === 'OK'){
            const renderRes = await renderer.render('btnInbox', req);
            res.status(200).send(renderRes);
        }
        else res.status(200).send({content: message});
    });

    app.post('/dashboard/inbox/delete', async (req, res) => {
        const inboxWork = req.body.name;
        const message = await model.deleteInboxWork(req, inboxWork);
        if (message === 'OK'){
            const renderRes = await renderer.render('btnInbox', req);
            res.status(200).send(renderRes);
        }
        else res.status(200).send({content: message});
    });

    // Daily
    app.post('/dashboard/daily/add', async (req, res) => {
        const dailyWork = req.body.name;
        const fromTime = req.body.from_time;
        const toTime = req.body.to_time;
        const dailyDays = req.body.daily_days;
        const color = req.body.color;

        const message = await model.addDailyWork(req, dailyWork, fromTime, toTime, dailyDays, color);
        if (message === 'OK'){
            const renderRes = await renderer.render('btnDaily', req);
            res.status(200).send(renderRes);
        }
        else res.status(200).send({content: message});
    });

    app.post('/dashboard/daily/getdata', async (req, res) => {
        const dailyWorkName = req.body.name;
        const dailyWork = await model.getDailyWork(req, dailyWorkName);
        if (dailyWork !== undefined && dailyWork !== ''){
            res.status(200).send(dailyWork);
        }
        else res.status(200).send({content: 'Some errors have occcured!'});
    });

    app.post('/dashboard/daily/modify', async (req, res) => {
        const oldName = req.body.oldName;
        const newName = req.body.newName;
        const fromTime = req.body.fromTime;
        const toTime = req.body.toTime;
        const dailyDays = req.body.dailyDays;
        const color = req.body.color;

        const message = await model.updateDailyWork(req, oldName, newName, fromTime, toTime, dailyDays, color);
        if (message === 'OK'){
            const renderRes = await renderer.render('btnDaily', req);
            res.status(200).send(renderRes);
        }
        else res.status(200).send({content: message});
    });

    app.post('/dashboard/daily/delete', async(req, res) => {
        const dailyWork = req.body.name;
        const message = await model.deleteDailyWork(req, dailyWork);
        if (message === 'OK'){
            const renderRes = await renderer.render('btnDaily', req);
            res.status(200).send(renderRes);
        }
        else res.status(200).send({content: message});
    });

    // Money

    app.post('/dashboard/money/add', async (req, res) => {
        const moneyName = req.body.name;
        const money = req.body.money;
        const message = await model.addMoney(req, moneyName, money);
        if (message === 'OK'){
            const renderRes = await renderer.render('btnMoney', req);
            res.status(200).send(renderRes);
        }
        else res.status(200).send({content: message});
    });

    app.post('/dashboard/money/render', async (req, res) => {
        const renderRes = await renderer.render('btnMoney', req);
        res.status(200).send(renderRes); 
    });

    app.post('/dashboard/money/update', async (req, res) => {
        const oldName = req.body.oldName;
        const newName = req.body.newName;
        const oldMoney = req.body.oldMoney;
        const newMoney = req.body.newMoney;

        const message = await model.updateMoney(req, oldName, newName, oldMoney, newMoney);
        if (message === "OK"){
            const renderRes = await renderer.render('btnMoney', req);
            res.status(200).send(renderRes);
        }   
        else res.status(200).send({content: message});
    });

    // General
    app.get('/dashboard', async (req, res) => {
        let checkCookie = await checkCookieForLogIn(req.cookies);
        if (!checkCookie){
            res.status(200).redirect('/signin');
        }
        else {
            
            // Download data from Wunderlist, only uncompleted one
            
            const access_token = await model.getWunderlistAccessToken(req);
            if (typeof access_token === "string"){
                const wunderListInboxID = await model.getWunderlistInboxListID(access_token);
                let wunderListInboxTasks = await model.getWunderlistAllTasksOfListID(access_token, wunderListInboxID, false);

                let inboxData = await model.getInboxData(req);
                wunderListInboxTasks.forEach(async (element) => {
                    let inInboxData = inboxData.find((arrElement) => {return arrElement.name === element.title;})
                    if (inInboxData === undefined){
                        await model.addInboxWork(req, element.title, element.created_at, '');
                    } 
                });  
            }
            else {
                console.log("??");
            }

            // Rendering
            const requestData = await renderer.render('btnHome', req);
            requestData.title = `Hi ${model.parseCookie(req.cookies)[0]}, may I help you?`;
            res.status(200).render(VIEWS_PATH + 'dashboard', requestData);
        }
    });

    app.post('/dashboard', async (req, res) => {
        let checkCookie = await checkCookieForLogIn(req.cookies);
        if (!checkCookie){
            res.status(200).redirect('/signin');
        }
        else {
            let btnClicked = req.body.btnClicked;
            const renderRes = await renderer.render(btnClicked, req);
            res.status(200).send(renderRes);
        }
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
