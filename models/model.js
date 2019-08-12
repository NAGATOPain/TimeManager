const constants = require('../env.js');
var sqlite3 = require('sqlite3').verbose();
var bcrypt = require('bcryptjs');

var fs = require('fs');
var existsDatabase = fs.existsSync(constants.DATABASE_PATH);
var db = new sqlite3.Database(`${constants.DATABASE_PATH}`);

const CRYPTO_SEED_LENGTH = 13;

// Hashing

async function checkValidHashedString(raw, hashed){
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
            if (err){
                resolve(undefined);
            }
            else
                resolve(row.token);
        });
    });
}

async function generateToken(user, pass, ip){
    let rawString = `${user}_${pass}_${ip}`;
    return await hashString(rawString);
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

async function isLoggedIn(user, cookies){
    let tokenArray = await getAccessToken();
    if (tokenArray.includes(cookies)){
        return true;
    }
    return false;
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

exports.validateLogin = async function(user, pass, ip, cookie){
    // Check if cookie is in access token
    let accessToken = await getAccessToken(user);
    if (accessToken.includes(cookie)){
        return 'OK';
    }

    // If not
    let hashedPassword = await getHashedPassword(user);
    if (hashedPassword === undefined){
        // Error here
        return 'N_Exist';
        console.log("This account didn't exist");
    }
    else {
        if (checkValidHashedString(pass, hashedPassword)){
            console.log("OK");
            let newToken = await generateToken(user, pass, ip);
            if (accessToken.length > 0) accessToken += '_';
            accessToken += newToken;
            console.log(accessToken);
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
