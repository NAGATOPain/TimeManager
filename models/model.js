const constants = require('../env.js');
var sqlite3 = require('sqlite3').verbose();
var bcrypt = require('bcryptjs');
var sha256 = require('js-sha256');

var fs = require('fs');
var existsDatabase = fs.existsSync(constants.DATABASE_PATH);
var db = new sqlite3.Database(`${constants.DATABASE_PATH}`);

const CRYPTO_SEED_LENGTH = 13;

// Algorithms
function isEmail(email){
	return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g.test(email);
}


function isProperString(str){
	// Only contains alphanumeric, _, -
	return /^([\w-]+)$/.test(str);
}

function isProperStringWithSomeSpecialCharacter(str){
	return /^(\w[\w-\s.,'"?()]+)$/.test(str);
}

// Hashing

function isValidBCryptedString(raw, hashed){
    return bcrypt.compare(raw, hashed);
}

async function hashString(str){
    return await bcrypt.hash(str, CRYPTO_SEED_LENGTH).then(hash => {
        return hash;
    });
}

// Access Token

function getAccessToken(username){
    return new Promise((resolve, reject) => {
        const sql = `SELECT access_token token FROM user WHERE user = ? OR email = ? ;`;
        db.get(sql, [username, username], (err, row) => {
            if (err || row === undefined){
                resolve(undefined);
            }
            else
                resolve(row.token);
        });
    });
}

function generateToken(username, password){
    return sha256(`${username}_${password}`);
}

function updateAccessToken(username, newToken){
    return new Promise((resolve, reject) => {
        const sql = `UPDATE user SET access_token = ? WHERE user = ? OR email = ? ;`;
        db.run(sql, [newToken, username, username], (err) => {
            if (err) resolve(false);
            else resolve(true);
        });
    });
}

function getHashedPassword(username){
    return new Promise((resolve, reject) => {
        const sql = `SELECT pass password FROM user WHERE user = ? OR email = ? ;`;
        db.get(sql, [username, username], (err, row) => {
            if (err || row === undefined) {
                resolve(undefined);
            }
            else {
                resolve(row.password);
            }
        });
    });
}

function getInboxDataOfUser(username){

    return new Promise((resolve, reject) => {
        const sql = `SELECT _rowid_, * FROM inbox WHERE user = ? AND done = ? ORDER BY _rowid_ DESC`;
        db.all(sql, [username, 0], (err, rows) => {
            if (err || rows === undefined){
                resolve(undefined);
            }
            else {
                resolve(rows);
            }
        });
    });
}

function addInboxWorkForUser(username, inboxWork, fromTime, toTime){
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO inbox VALUES (?, ?, ?, ?, ?);`;
		let from_t, to_t;

		if (fromTime === "" || fromTime === undefined) from_t = (new Date()).toJSON();
		else from_t = fromTime;

		if (toTime === "" || toTime === undefined) to_t = (new Date()).toJSON();
		else to_t = toTime;

		if (Date.parse(from_t) > Date.parse(to_t)) to_t = from_t;

        db.run(sql, [username, inboxWork, from_t, to_t, 0], (err) => {
            if (err) {
                resolve('Error');
            }
            else{
                resolve('OK');
            }
        });
    });
}

function doneInboxWorkForUser(username, inboxWork){

	return new Promise((resolve, reject) => {
		const sql = `UPDATE inbox SET done = 1 WHERE user = ? AND name = ? ;`;
		db.run(sql, [username, inboxWork], (err) => {
            if (err) {
                resolve('Error');
            }
            else{
                resolve('OK');
            }
        });
	});
}

function deleteInboxWorkForUser(username, inboxWork){
	return new Promise((resolve, reject) => {
		const sql = `DELETE FROM inbox WHERE user = ? AND name = ? ;`;
		db.run(sql, [username, inboxWork], (err) => {
            if (err) {
                resolve('Error');
            }
            else{
                resolve('OK');
            }
        });
	});
}

////////////////////////

exports.isLoggedIn = (username, token) => {
    return getAccessToken(username).then((result) => {
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
        const cookie = cookies.acc;

        if (typeof(cookie.items) === 'object' && cookie.items.length === 2){
            const username = cookie.items[0];
            const token = cookie.items[1];
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
            db.run(`CREATE TABLE inbox (user TEXT, name TEXT, from_t TEXT, to_t TEXT, done INTEGER);`);
			// db.run(`CREATE TABLE book (user TEXT, name TEXT, from_t TEXT, to_t TEXT, done INTEGER);`);
			// db.run(`CREATE TABLE project (user TEXT, name TEXT, from_t TEXT, to_t TEXT, done INTEGER);`);
			db.run(`CREATE TABLE daily (user TEXT, name TEXT, from_t TEXT, to_t TEXT, daily TEXT);`);
            // db.run(`CREATE TABLE money (user TEXT, money INTEGER, from_t TEXT, to_t TEXT);`)
        }
        else {
            console.log("Exist file !");
        }
    });
}

exports.createAccount = async function(email, username, password){
    const hash = await bcrypt.hash(password, CRYPTO_SEED_LENGTH);
    return new Promise((resolve, reject) => {
        // Check email, user, pass here

        if (!isEmail(email))
            resolve('Email');
        else if (!isProperString(username))
            resolve('Username');
        else if (!isProperString(password))
            resolve('Password');
        else {
            db.run(`INSERT INTO user VALUES (?, ?, ?, ?);`, ['', email, username, hash], (err, result) => {
                if (err) resolve('Exist');
                else resolve('OK');
            });
        }
    });
}

exports.validateLogin = async function(username, password){
    // If not
    const hashedPassword = await getHashedPassword(username);
    if (hashedPassword === undefined){
        // Error here
        return ['N_Exist', ''];
    }
    else {
        const isValidPassword = await isValidBCryptedString(password, hashedPassword);
        if (isValidPassword){
            let accessToken = await getAccessToken(username);
            const newToken = generateToken(username, password);
            if (accessToken.length > 0) accessToken += '_';
            accessToken += newToken;
            await updateAccessToken(username, accessToken);
            return ['OK', newToken];
        }
        else {
            return ['P_Wrong', ''];
        }
    }
}

exports.getCalendarData = async (request) => {
	const username = exports.parseCookie(request.cookies)[0];
	let result = [];

	// Get all inbox works
	const inboxData = await getInboxDataOfUser(username);
	inboxData.forEach((item) => {
		result.push({title: item.name, start: item.from_t, end: item.to_t, color: '#42a7f5'});
	});

	return result;
}

// Inbox

exports.getInboxData = async (request) => {
    const username = exports.parseCookie(request.cookies)[0];
    const data = await getInboxDataOfUser(username);
    return data;
}

exports.addInboxWork = async (request, inboxWork, fromTime, toTime) => {
    if (!isProperStringWithSomeSpecialCharacter(inboxWork)){
        return 'Invalid';
    }
    else {
        const username = exports.parseCookie(request.cookies)[0];
        const addStatus = await addInboxWorkForUser(username, inboxWork, fromTime, toTime);
        return addStatus;
    }
}

exports.doneInboxWork = async (request, inboxWork) => {
	const username = exports.parseCookie(request.cookies)[0];
	const doneStatus = await doneInboxWorkForUser(username, inboxWork);

	return doneStatus;
}

exports.deleteInboxWork = async (request, inboxWork) => {
	const username = exports.parseCookie(request.cookies)[0];
	const deleteStatus = await deleteInboxWorkForUser(username, inboxWork);

	return deleteStatus;
}

// Daily

exports.getDailyData = async (request) => {
	return [{title: 'Hello', start: '2019-08-17T11:19:07.599Z', end: '2019-08-17T11:19:07.599Z'}];
}
