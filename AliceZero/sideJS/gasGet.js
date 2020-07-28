var request = require('request');

const auth = require('../jsonHome/auth.json');

//#region 攻略組表單相關

//#region 請求宣告
//攻略組表單第一頁，等級&重生點
const levels = {
    'method': 'GET',
    'url': auth.gasUrl.levels,
    'headers': {}
};

//攻略組表單第二頁，各角色持有技能
const skills = {
    'method': 'GET',
    'url': auth.gasUrl.skills,
    'headers': {}
};

//攻略組表單第五頁，黑特單
const blackList = {
    'method': 'GET',
    'url': auth.gasUrl.blackList,
    'headers': {}
};

//成就
const mileage = {
    'method': 'GET',
    'url': auth.gasUrl.mileage,
    'headers': {}
};
//#endregion

//#region 實作&處理資料
//獲取等級&轉生點
exports.getLevel = function(newLevel, range = 1, callback) {
    let backValue = new Array;
    request(levels, function(error, response) {
        //if (error) throw new Error(error);
        if (error) {
            callback(error);
        } else {
            if (response.body !== undefined && typeof(response.body) === 'string') {
                if (response.body.substring(0, 1) !== '{') {
                    callback('出現意外錯誤~\n通常是google不開心了');
                }
            } else {
                callback('出現意外錯誤~\n通常是google不開心了');
            }
            let data = JSON.parse(response.body);
            let j = parseFloat(newLevel)
            for (var i = 0; i <= range - 1; i++) {
                backValue.push(data[i + j]);
            }
            callback(backValue);
        }
    });
};

//獲取技能列表
exports.getSkill = function(name, callback) {
    errMsg = '```技能查詢\n語法:攻略組 技能 {角色名稱}\n\n根據角色名稱，反饋此角色已記錄技能與獲得條件\n\n角色名稱需與表單完全一致';


    request(skills, function(error, response) {
        if (error) callback('出現意外錯誤~\n通常是google不開心了');
        if (response.body !== undefined && typeof(response.body) === 'string') {
            if (response.body.substring(0, 1) !== '{') {
                callback('出現意外錯誤~\n通常是google不開心了');
            }
        } else {
            callback('出現意外錯誤~\n通常是google不開心了');
        }
        let data = JSON.parse(response.body);
        if (data[name] !== undefined) {
            let skills = new Array;
            skills.push(0);
            skills.push(data[name].skill1);
            skills.push(data[name].skill2);
            skills.push(data[name].skill3);
            skills.push(data[name].skill4);
            skills.push(data[name].skill5);
            skills.push(data[name].skill6);
            skills.push(data[name].skill7);
            skills.push(data[name].skill8);

            let tasks = new Array;
            tasks.push(data[name].task1);
            tasks.push(data[name].task2);
            tasks.push(data[name].task3);
            tasks.push(data[name].task4);
            tasks.push(data[name].task5);
            tasks.push(data[name].task6);
            tasks.push(data[name].task7);
            tasks.push(data[name].task8);

            for (var i = 8; i >= 1; i--) {
                if (skills[i] !== '') {
                    skills[0] = i;
                    break;
                }
            }

            msg = '```';
            msg = msg + `角色  ${name}`;
            for (var i = 0; i < skills[0]; i++) {
                msg = msg + '\n技能' + (i + 1) + ' ' + paddingRightForCn(skills[i + 1], 8) + '| 獲取條件 ' + paddingRightForCn(tasks[i], 8);
            }
            msg = msg + '```';
            callback(msg);
        } else {
            msg = '\n目前的角色有~...\n';
            let names = Object.keys(data)
            for (var i = 0; i < names.length; i++) {
                msg = msg + `${paddingRightForCn(names[i], 7)}`;
                if (i % 6 == 5 && i != 0) {
                    msg = msg + '\n';
                }
            }
            msg = msg + '```';
            errMsg = errMsg + msg;
            callback(errMsg)
        }
    });
};

//獲取黑特
exports.getBlackList = function(callback) {
    request(blackList, function(error, response) {
        //if (error) throw new Error(error);
        if (error) {
            callback('出現意外錯誤~\n通常是google不開心了');
        } else {
            if (response.body !== undefined && typeof(response.body) === 'string') {
                if (response.body.substring(0, 1) !== '{') {
                    callback('出現意外錯誤~\n通常是google不開心了');
                }
            } else {
                callback('出現意外錯誤~\n通常是google不開心了');
            }
            let data = JSON.parse(response.body);
            let keys = Object.keys(data);

            let msgData = new Array;
            for (var i = 0; i < keys.length; i++) {
                if (data[i] !== undefined) {
                    msgData.push(`暱稱 ${data[i].name}\n觀察狀態 ${data[i].type}\n主動殺人次數 ${data[i].count}\n備註 ${data[i].backup}\n\n`);
                }
            }
            // if (msg === '``````') {
            //     msg = '出現錯誤，請重新嘗試\n如果問題持續存在，請通知作者';
            // }
            callback(msgData);
        }
    });
};

//獲取成就表
exports.getMileage = function(callback) {
    request(mileage, function(error, response) {
        //if (error) throw new Error(error);
        if (error) {
            callback(error);
        } else {
            if (response.body !== undefined && typeof(response.body) === 'string') {
                if (response.body.substring(0, 1) !== '[') {
                    callback('出現意外錯誤~\n通常是google不開心了');
                }
            } else {
                callback('出現意外錯誤~\n通常是google不開心了');
            }
            let data = JSON.parse(response.body);

            let returnData = new Array;
            for (i = 0; i < data.length; i++) {
                if (returnData[data[i].MyID] == undefined) {
                    returnData[data[i].MyID] = new Array;
                }
                returnData[data[i].MyID].push(data[i]);
            }
            callback(returnData);
        }
    });
};
//#endregion

//#endregion 攻略組表單相關END

//#region 圖床相關

//#region 請求宣告
const catImage = {
    'method': 'GET',
    'url': `https://api.imgur.com/3/album/${auth.imgur.catImage}/images`,
    'headers': { 'Authorization': 'Bearer ' + auth.imgur.token }
};
const foodImage = {
    'method': 'GET',
    'url': `https://api.imgur.com/3/album/${auth.imgur.foodImage}/images`,
    'headers': { 'Authorization': 'Bearer ' + auth.imgur.token }
};
//#endregion

//#region 實作
//貓咪
exports.getCatImage = function(callback) {
    request(catImage, function(error, response) {
        try {
            if (error) callback('出現錯誤!如果問題持續存在，請通知作者');
            const catImageData = JSON.parse(response.body);
            if (catImageData.status == 200) {
                const imageID = Math.floor(Math.random() * Math.floor(catImageData.data.length));
                callback(catImageData.data[imageID].link);
            } else {
                callback('出現錯誤!如果問題持續存在，請通知作者');
            }
        } catch {
            callback('出現錯誤!如果問題持續存在，請通知作者');
        }
    });
};
//食物
exports.getFoodImage = function(callback) {
    request(foodImage, function(error, response) {
        try {
            if (error) callback('出現錯誤!如果問題持續存在，請通知作者');
            const foodImageData = JSON.parse(response.body);
            if (foodImageData.status == 200) {
                const imageID = Math.floor(Math.random() * Math.floor(foodImageData.data.length));
                callback(foodImageData.data[imageID].link);
            } else {
                callback('出現錯誤!如果問題持續存在，請通知作者');
            }
        } catch {
            callback('出現錯誤!如果問題持續存在，請通知作者');
        }
    });
};
//#endregion

//#endregion

//#region 字串補空白
function paddingRightForCn(str, lenght) {
    if (str.length >= lenght)
        return str;
    else
        return paddingRightForCn(str + "　", lenght);
};
//#endregion