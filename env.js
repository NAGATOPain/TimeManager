module.exports = Object.freeze({
    APP_NAME: 'TimeManager',
    APP_VERSION: 'v1.0.0',
    VIEWS_PATH: './views/',
    CONTROLLER_PATH: './controllers/controller.js',
    MODEL_PATH: './models/model.js',
    DATABASE_PATH: './models/data.db',
    PORT: 3000,

    WUNDERLIST_CLIENT_ID: `d05f1b8a90a3a914b30a`,
    WUNDERLIST_CLIENT_SECRET: `30c5102501f66049da237082f5c52f7848a9dec87ac5914609722b31f834`,
    WUNDERLIST_REDIRECT_URL: `http://localhost:3000/wunderlist/token`,
    WUNDERLIST_AUTHORIZE_PATH: `https://www.wunderlist.com/oauth/authorize`
});
