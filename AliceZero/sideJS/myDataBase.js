var axios = require('axios');
var qs = require('qs');

const auth = require('../jsonHome/auth.json');

//獲取ranValue的全部資料
exports.getDataFormRanValue = function(callback) {
    const config = {
        method: 'post',
        url: auth.myDataBase.GET.getDataFormRanValue,
        headers: {}
    };

    axios(config)
        .then(function(response) {
            //callback(JSON.stringify(response.data));
            callback(JSON.parse(JSON.stringify(response.data)));
        })
        .catch(function(error) {
            console.log('ERROR#MyDataBase#01: ', error);
            callback(undefined);
        });
}

//新增一筆資料給ranValue
exports.postDataForRanValue = function(pushData) {
    var data = qs.stringify({
        'id': pushData[0],
        'name': pushData[1],
        'value': pushData[2],
        'canEdit': pushData[3],
        'groupID': pushData[4],
        'groupName': pushData[5],
        'channelID': pushData[6],
        'channelName': pushData[7],
        'userID': pushData[8],
        'userName': pushData[9],
        'method': pushData[10]
    });
    var config = {
        method: 'post',
        url: auth.myDataBase.POST.postDataToRanValue,
        headers: {},
        data: data
    };

    axios(config)
        .then(function(response) {
            console.log(JSON.stringify(response.data));
        })
        .catch(function(error) {
            console.log(error);
        });
}

//獲取botMessage的全部資料
exports.getDataFormBotMessage = function(callback) {
    const config = {
        method: 'post',
        url: auth.myDataBase.GET.getDataFormBotMessage,
        headers: {}
    };

    axios(config)
        .then(function(response) {
            //callback(JSON.stringify(response.data));
            callback(JSON.parse(JSON.stringify(response.data)));
        })
        .catch(function(error) {
            console.log('ERROR#MyDataBase#02: ', error);
            callback(undefined);
        });
}

//獲取userMessage的全部資料
exports.getDataFormUserMessage = function(callback) {
    const config = {
        method: 'post',
        url: auth.myDataBase.GET.getDataFormUserMessage,
        headers: {}
    };

    axios(config)
        .then(function(response) {
            //callback(JSON.stringify(response.data));
            callback(JSON.parse(JSON.stringify(response.data)));
        })
        .catch(function(error) {
            console.log('ERROR#MyDataBase#03: ', error);
            callback(undefined);
        });
}