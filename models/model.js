const constants = require('../env.js');
var sqlite3 = require('sqlite3').verbose();
var bcrypt = require('bcryptjs');
var sha256 = require('js-sha256');
const axios = require('axios');

var fs = require('fs');
var existsDatabase = fs.existsSync(constants.DATABASE_PATH);
var db = new sqlite3.Database(`${constants.DATABASE_PATH}`);

const CRYPTO_SEED_LENGTH = 13;

// Algorithms
function isEmail(email){
	return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g.test(email);
}

function isDate(date) {
    return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}

function changeToCurrencyFormat(num){
    return (num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function isProperString(str){
	// Only contains alphanumeric, _, -
	return /^([\w-]+)$/.test(str);
}

function isProperStringWithSomeSpecialCharacter(str){
	return /^(\w[\w-\s.,'"?()ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]+)$/.test(str);
}

function getCurrentDateInYYYYMMDDFormat(){
    return (new Date()).toISOString().split('T')[0];
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

function addWunderlistAccessTokenForUser(username, access_token){
    return new Promise((resolve, reject) => {
        const sql = `UPDATE user SET wl_access_token = ? WHERE user = ? ;`
        db.run(sql, [access_token, username], (err) => {
            if (err) {
                resolve('Error');
            }
            else{
                resolve('OK');
            }
        });
    });
}

function getWunderlistAccessTokenForUser(username){
    return new Promise((resolve, reject) => {
        const sql = `SELECT wl_access_token access_token FROM user WHERE user = ? ;`;
        db.get(sql, [username], (err, row) => {
            if (err || row === undefined || row === ""){
                resolve(undefined);
            }
            else
                resolve(row.access_token);
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
		const sql = `DELETE FROM inbox WHERE user = ? AND name = ? AND done = 0 ;`;
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
function addDailyWorkForUser(username, dailyWork, fromTime, toTime, dailyDays, color){
	return new Promise((resolve, reject) => {
		const sql = `INSERT INTO daily VALUES (?, ?, ?, ?, ?, ?);`;

		if (fromTime === "" || fromTime === undefined){
			resolve('Invalid'); return;
		}

		if (toTime === "" || toTime === undefined){
			resolve("Invalid"); return;
		}

		if (fromTime > toTime){
			resolve("Invalid"); return;
		}

		let dailyDaysString = "";
		for (let day of dailyDays)
			dailyDaysString += (day === 'true' ? 1 : 0);

        db.run(sql, [username, dailyWork, fromTime, toTime, dailyDaysString, color], (err) => {
            if (err) resolve('Error');
            else resolve('OK');
        });
	});
}

function updateDailyWorkForUser(username, oldName, newName, fromTime, toTime, dailyDays, color){
    return new Promise((resolve, reject) => {
        const sql = `UPDATE daily SET 
            name = ? , from_t = ? , to_t = ? , daily = ? , color = ?
        WHERE user = ? AND name = ? ;`;

		if (fromTime === "" || fromTime === undefined){
			resolve('Invalid'); return;
		}

		if (toTime === "" || toTime === undefined){
			resolve("Invalid"); return;
		}

		if (fromTime > toTime){
			resolve("Invalid"); return;
		}

		let dailyDaysString = "";
		for (let day of dailyDays)
			dailyDaysString += (day === 'true' ? 1 : 0);

        db.run(sql, [newName, fromTime, toTime, dailyDaysString, color, username, oldName], (err) => {
            if (err) resolve('Error');
            else resolve('OK');
        });
    });
}

function getDailyDataForUser(username){
	return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM daily WHERE user = ? ;`;
        db.all(sql, [username], (err, rows) => {
            if (err || rows === undefined){
                resolve(undefined);
            }
            else {
                resolve(rows);
            }
        });
    });
}

function getDailyWorkForUser(username, dailyWorkName){
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM daily WHERE user = ? AND name = ? ;`;
        db.get(sql, [username, dailyWorkName], (err, row) => {
            if (err || row === undefined){
                resolve(undefined);
            }
            else
                resolve(row);
        });
    });
}

function deleteDailyWorkForUser(username, dailyWork){
	return new Promise((resolve, reject) => {
		const sql = `DELETE FROM daily WHERE user = ? AND name = ? ;`;
		db.run(sql, [username, dailyWork], (err) => {
            if (err) {
                resolve('Error');
            }
            else{
                resolve('OK');
            }
        });
	});
}

// Money

function addMoneyForUser(username, moneyName, money){
	return new Promise((resolve, reject) => {
        const sql = `INSERT INTO money VALUES (?, ?, ?, ?);`;
        
        const time = getCurrentDateInYYYYMMDDFormat();

		if (money === "" || money === undefined || isNaN(money) || !isDate(time)){
			resolve('Invalid'); return;
		}

		db.run(sql, [username, moneyName, money, time], (err) => {
			if (err) resolve('Error');
			else resolve('OK');
		});
	});
}

function updateMoneyForUser(username, oldName, newName, oldMoney, newMoney){
    return new Promise((resolve, reject) => {
        const sql = `UPDATE money 
        SET moneyName = ? , money = ?  
        WHERE user = ? AND moneyName = ? AND money = ? ;`;

        oldMoney = oldMoney.replace(/,/g ,'');
        newMoney = newMoney.replace(/,/g ,'');

        if (oldMoney === "" || oldMoney === undefined || isNaN(oldMoney) || newMoney === "" || newMoney === undefined || isNaN(newMoney)){
			resolve('Invalid'); return;
		}

        db.run(sql, [newName, newMoney, username, oldName, oldMoney], (err) => {
        if (err) {
            console.log(err);
            resolve('Error');
        }
            else resolve('OK');
        });
    });
}

function getMoneyDataForUser(username, request){
	return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM money WHERE user = ? ORDER BY _rowid_ DESC;`;
        db.all(sql, [username], (err, rows) => {
            if (err || rows === undefined){
                resolve(undefined);
            }
            else {
                let result = [];
                if (request.body.all === undefined || request.body.all === 'true'){
                    result = rows;
                }
                else {
                    const date = new Date();
                    rows.forEach((value) => {
                        const valueDateArray = value.time.split('-');
                        if (request.body.month === 'true' && date.getFullYear() == valueDateArray[0] && date.getMonth() == valueDateArray[1] - 1)
                            result.push(value);
                        
                        else if (request.body.day === 'true' && getCurrentDateInYYYYMMDDFormat() === value.time)
                            result.push(value);
                    });
                }
                resolve(result);
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
            db.run(`CREATE TABLE money (user TEXT, moneyName TEXT, money INTEGER, time TEXT);`)
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

// Wunderlist

exports.addWunderlistAccessToken = async(request, access_token) => {
    const username = exports.parseCookie(request.cookies)[0];
    const message = await addWunderlistAccessTokenForUser(username, access_token);
    return message;
}

exports.getWunderlistAccessToken = async (request) => {
    const username = exports.parseCookie(request.cookies)[0];
    const result = await getWunderlistAccessTokenForUser(username);
    return result;
}

exports.getWunderlistInboxListID = async (access_token) => {
    return new Promise((resolve, reject) => {
        axios.get('https://a.wunderlist.com/api/v1/lists', {
            headers: {
                "x-access-token": `${access_token}`,
                "x-client-id": `${constants.WUNDERLIST_CLIENT_ID}`
            }
        }).then(function(response){
            resolve(response.data.find(obj => obj.title === 'inbox').id);
        }).catch(function(error){
            resolve("Error");
        });
    });
}

exports.getWunderlistAllTasksOfListID = async (access_token, list_id, completed) => {
    return new Promise((resolve, reject) => {
        axios.get('https://a.wunderlist.com/api/v1/tasks', {
            headers:{
                "x-access-token": `${access_token}`,
                "x-client-id": `${constants.WUNDERLIST_CLIENT_ID}`
            },
            params:{
                "completed": completed,
                "list_id": list_id
            }                 
        }).then(function(response){
            resolve(response.data);
        }).catch(function (error){
            resolve("Error");
        });
    });
}

// Calendar data

exports.getCalendarData = async (request) => {
	const username = exports.parseCookie(request.cookies)[0];
	let result = [];

	// Get all inbox works
    const inboxData = await getInboxDataOfUser(username);
	inboxData.forEach((item) => {
		result.push({title: item.name, start: item.from_t, end: item.to_t, color: '#42a7f5'});
	});

	// Get all daily data
	const dailyData = await exports.getDailyData(request);
	result = result.concat(dailyData);

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
	const username = exports.parseCookie(request.cookies)[0];
    const dailyData = await getDailyDataForUser(username);

	let data = [];
    dailyData.forEach((item, index) => {
        let daysOfWeek = [];
        for (let i in item.daily) if (item.daily[i] === '1') daysOfWeek.push(i);
        data.push({title: item.name, startTime: item.from_t, endTime: item.to_t, daysOfWeek: daysOfWeek, color: item.color});
    });

    return data;
}

exports.getDailyWork = async (request, dailyWorkName) => {
    const username = exports.parseCookie(request.cookies)[0];
    const dailyData = await getDailyWorkForUser(username, dailyWorkName);

    return dailyData;
}

exports.updateDailyWork = async (request, oldName, newName, fromTime, toTime, dailyDays, color) => {
    if (!isProperStringWithSomeSpecialCharacter(oldName) || !isProperStringWithSomeSpecialCharacter(newName)){
        return 'Invalid';
    }
    else {
        const username = exports.parseCookie(request.cookies)[0];
        const updateStatus = await updateDailyWorkForUser(username, oldName, newName, fromTime, toTime, dailyDays, color);
        return updateStatus;
    }
}

exports.addDailyWork = async (request, dailyWork, fromTime, toTime, dailyDays, color) => {
	if (!isProperStringWithSomeSpecialCharacter(dailyWork)){
        return 'Invalid';
    }
    else {
        const username = exports.parseCookie(request.cookies)[0];
        const addStatus = await addDailyWorkForUser(username, dailyWork, fromTime, toTime, dailyDays, color);
        return addStatus;
    }
}

exports.deleteDailyWork = async (request, dailyWork) => {
	const username = exports.parseCookie(request.cookies)[0];
	const deleteStatus = await deleteDailyWorkForUser(username, dailyWork);
	return deleteStatus;
}

// Money

exports.addMoney = async (request, moneyName, money) => {
	if (!isProperStringWithSomeSpecialCharacter(moneyName)){
		return 'Invalid';
	}
	else {
		const username = exports.parseCookie(request.cookies)[0];
		const addStatus = await addMoneyForUser(username, moneyName, money);
		return addStatus;
	}
}

exports.getMoneyData = async (request) => {
	const username = exports.parseCookie(request.cookies)[0];
    const moneyData = await getMoneyDataForUser(username, request);

    moneyData.forEach((value) => {
        value.money = changeToCurrencyFormat(value.money)
    });

	return moneyData;
}

exports.updateMoney = async (request, oldName, newName, oldMoney, newMoney) => {
    if (!isProperStringWithSomeSpecialCharacter(newName) || !isProperStringWithSomeSpecialCharacter(oldName)){
		return 'Invalid';
	}
	else {
		const username = exports.parseCookie(request.cookies)[0];
		const updateStatus = await updateMoneyForUser(username, oldName, newName, oldMoney, newMoney);
		return updateStatus;
	}

}

exports.getMoneySum = async (request) => {
    const username = exports.parseCookie(request.cookies)[0];
    const moneyData = await getMoneyDataForUser(username, request);

    let sum = 0;

    moneyData.forEach((value) => {
        sum += value.money;
    });

    return changeToCurrencyFormat(sum);
}
