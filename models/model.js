const constants = require('../env.js');
var sqlite3 = require('sqlite3').verbose();
var bcrypt = require('bcryptjs');
var sha256 = require('js-sha256');

var fs = require('fs');
var existsDatabase = fs.existsSync(constants.DATABASE_PATH);
var db = new sqlite3.Database(`${constants.DATABASE_PATH}`);

const CRYPTO_SEED_LENGTH = 13;

// Hashing

async function isValidBCryptedString(raw, hashed){
    return await bcrypt.compare(raw, hashed);
}

async function hashString(str){
    return await bcrypt.hash(str, CRYPTO_SEED_LENGTH).then(hash => {
        return hash;
    });
}

// Access Token

function getAccessToken(user){
    return new Promise((resolve, reject) => {
        let sql = `SELECT access_token token FROM user WHERE user = ? OR email = ? ;`;
        db.get(sql, [user, user], (err, row) => {
            if (err || row === undefined){
                resolve(undefined);
            }
            else
                resolve(row.token);
        });
    });
}

function generateToken(user, pass){
    return sha256(`${user}_${pass}`);
}

function updateAccessToken(user, newToken){
    return new Promise((resolve, reject) => {
        let sql = `UPDATE user SET access_token = ? WHERE user = ? OR email = ? ;`;
        db.run(sql, [newToken, user, user], (err) => {
            if (err) resolve(false);
            else resolve(true);
        });
    });
}

function getHashedPassword(user){
    return new Promise((resolve, reject) => {
        let sql = `SELECT pass pass FROM user WHERE user = ? OR email = ? ;`;
        db.get(sql, [user, user], (err, row) => {
            if (err || row === undefined) {
                resolve(undefined);
            }
            else {
                resolve(row.pass);
            }
        });
    });
}

exports.isLoggedIn = (user, token) => {
    return getAccessToken(user).then((result) => {
        if (result === undefined){
            return false;
        }
        result = result.split('_');
        if (result.includes(token)){
            return true;
        }
        return false;
    });
}

exports.parseCookie = (cookies) => {
    if (cookies.acc !== undefined){
        let cookie = cookies.acc;

        if (typeof(cookie.items) === 'object' && cookie.items.length === 2){
            let username = cookie.items[0];
            let token = cookie.items[1];
            return [username, token];
        }
        return false;
    }
    return false;
}

exports.deleteTokenOfUser = async (username, token) => {

    let accessToken = await getAccessToken(username);
    if (accessToken === undefined){
        return false;
    }
    else {
        accessToken = accessToken.split('_');
        if (accessToken.includes(token)){
            let result = accessToken.filter((value, index, arr) => { return value !== token; });
            result = result.join('_');
            await updateAccessToken(username, result);
            return true;
        }
        else return false;
    }
}

exports.init = () => {
    db.serialize(() => {
        if (!existsDatabase){
            console.log("Create database file !");
            db.run(`CREATE TABLE user (access_token TEXT, email TEXT, user TEXT PRIMARY KEY, pass TEXT);`);
        }
        else {
            console.log("Exist file !");
        }
    });
}

exports.createAccount = function(email, user, pass){
    return bcrypt.hash(pass, CRYPTO_SEED_LENGTH).then(hash => {
        let stmt = db.prepare('INSERT INTO user VALUES (?, ?, ?, ?);', (error) => {
            return 'Failed';
        });
        stmt.run('', email, user, hash);
        stmt.finalize();
        return 'OK';
    });
}

exports.validateLogin = async function(user, pass){
    // If not
    let hashedPassword = await getHashedPassword(user);
    if (hashedPassword === undefined){
        // Error here
        return 'N_Exist';
    }
    else {
        if (isValidBCryptedString(pass, hashedPassword)){
            let accessToken = await getAccessToken(user);
            let newToken = generateToken(user, pass);
            if (accessToken.length > 0) accessToken += '_';
            accessToken += newToken;
            await updateAccessToken(user, accessToken);
            return ['OK', newToken];
        }
        else {
            return 'P_Wrong';
        }
    }
}

exports.getInboxData = () => {

    return {title: 'Inbox', content: '1'};

}
