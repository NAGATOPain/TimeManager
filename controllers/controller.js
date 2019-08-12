const VIEWS_PATH = '../views/';
var renderer = require('./featureRenderer.js');

function signUpPageProcessing(app){
    app.get('/signup', (req, res) => {
        res.render(VIEWS_PATH + 'signup');
    });

    app.post('/signup', (req, res, next) => {
        let username = req.body.username;
        let email = req.body.email;
        let pass = req.body.password;
        console.log(`Request body: ${req.body}`);
        console.log(`POST: Username = ${username}, Email = ${email}, Password: ${pass}`);

        res.status(200).json(req.body);
    });
}

function signInPageProcessing(app){
    app.get('/signin', (req, res) => {
        res.render(VIEWS_PATH + 'signin');
    });

    app.post('/signin', (req, res) => {
        let username = req.body.username;
        let pass = req.body.password;
        console.log(`Request body: ${req.body}`);
        console.log(`POST: Username = ${username}, Password: ${pass}`);

        res.status(200).json(req.body);
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
        'title': title
    }
    app.get('/dashboard', (req, res) => {
        res.status(200).render(VIEWS_PATH + 'dashboard', obj);
    });

    app.post('/dashboard', (req, res) => {
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
