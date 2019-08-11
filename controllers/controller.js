const VIEWS_PATH = '../views/'

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

exports.run = (app) => {

    console.log("Imported controller");

    // Sign up page
    signUpPageProcessing(app);

    // Sign in page
    signInPageProcessing(app);

    // Dash board
    app.get('/dashboard', (req, res) => {
        res.render(VIEWS_PATH + 'dashboard', {sidebarComponent: ['ass', 'asss1'], currentFeature: 'Luudeptrai'});
    });

    app.use((req, res, next) => {
        res.status(404).render(VIEWS_PATH + 'errors');
    });

}
