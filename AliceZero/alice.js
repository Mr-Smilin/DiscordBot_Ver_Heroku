//#region Discord.js套件
const Discord = require('discord.js');
//不變的使用者
const client = new Discord.Client();
//播歌
const ytdl = require('ytdl-core');
//#endregion

//#region 繼承js
const gasApi = require('./sideJS/gasGet.js');
const messageManager = require('./sideJS/messageManager.js');
const myDBFunction = require('./sideJS/myDataBase.js');
//#endregion

//#region 讀json
const auth = require('./jsonHome/auth.json');
const baseValue = require('./jsonHome/baseValue.json');
const romValue = require('./jsonHome/romValue.json');
const { exit } = require('process'); //....?
const { Console } = require('console');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
//#endregion

//#region 表單資料
//資料狀態控制
let downloading = false;

//各頻道訂製觸發指令
let ranValue;

//機器人訊息庫
let botMessage;

//使用者專屬訊息庫
let userMessage;

//歌單
let nowSongName = new Map();
let dispatcher = new Map();
let songList = new Map();
let songInfo = new Map(); //歌曲詳細資訊
let songLoop = new Map(); //歌曲循環
let catchCount = 0; //音樂主程序例外狀況的連續崩潰次數
//#endregion

//#region 系統功能-修改romValue-前綴字
//此功能當前狀態
let nowUseTheEditRomValue = false;
//此功能當前使用者
let nowUseTheEditRomValueUserID = "";
//此功能使用之房間
let nowUseTheEditRomValueChannelID = "";
//哪些要顯示
const canLookRomValue = ["id", "name", "value"];
//哪些可修改
const canEditRomValue = ["value"];
//#endregion

//#region 載入表單資料&啟動BOT
//幸之心
const MyToken = auth.token;
client.login(MyToken);

client.on('ready', () => {
    downloading = true; //下載中

    myDBFunction.getDataFormRanValue(function(value) {
        if (value) {
            ranValue = value;
        }
        myDBFunction.getDataFormBotMessage(function(value) {
            if (value) {
                botMessage = value;
            }
            myDBFunction.getDataFormUserMessage(function(value) {
                if (value) {
                    userMessage = value;
                }
                client.user.setActivity('請使用 ~ help 查詢使用說明書!', { type: 'WATCHING' });
                client.user.setAFK(true);
                console.log(`Logged in as ${client.user.tag}!`);
                downloading = false; //下載結束
            })
        })
    });
});
//#endregion

//#region onMessage
client.on('message', msg => {
    //#region 前置偵錯
    try {
        //大分類判斷
        if (!msg.guild || !msg.member || downloading) return;
        //中分類判斷
        if (!msg.member.user) return;
        //小分類判斷
        if (msg.member.user.bot) return;
    } catch (err) {
        console.log(err, 'error#001')
    }
    //#endregion

    //宣告
    let args;
    const cmd = (msg.content.split(' '));

    if (cmd[1] !== undefined) {

        let baseBeforeText = romValue.find(value => value.value == cmd[0]);
        if (baseBeforeText !== undefined) {
            baseBeforeText = baseBeforeText.value;
        } else {
            baseBeforeText = cmd[0];
        }

        if (msg.content.substring(0, cmd[0].length) === baseBeforeText) {
            // ID 1 FROM romValue
            args = msg.content.substring(baseBeforeText.length + cmd[1].length + 2).split(romValue[1].value);
        }

        SelectFunctionFromBeforeText(msg, cmd, args);
    } else {
        if (cmd[0] !== undefined) {
            SelectFunctionFromBeforeText(msg, cmd);
        }
    }
});

//新增主要功能時，需要修改這邊的switchTemp與romValue
function SelectFunctionFromBeforeText(msg, cmd, args = [""]) {

    //#region temp賦予
    //標準
    let temp = 9;
    for (let i = 0; i <= romValue.length - 1; i++) {
        if (cmd[0] == romValue[i].value) {
            temp = romValue[i].id;
            break;
        }
    }

    //判斷是否存在個案
    for (let i = 0; i <= ranValue.length - 1; i++) {
        if (cmd[0] == ranValue[i].Value) {
            temp = ranValue[i].ID;
            break;
        }
    }

    //權限判斷
    temp = findPowerFromBaseValue(msg, temp);
    //正則判斷
    if (cmd[1] !== undefined)
        temp = DeleteTempIfHaveEx(msg.content, temp);
    else temp = DeleteTempIfHaveEx(cmd[0], temp);
    //#endregion

    switch (temp) {
        case 0: //系統指令
            DoBaseFunction(msg, cmd[1], args);
            break;
        case 2: //修改觸發句功能
            DoEditRomValue(msg, cmd[1], args);
            break;
        case 3: //攻略組查表
            DoRaidersGet(msg, cmd[1], args);
            break;
        case 4: //音樂指令
            DoMusicFunction(msg, cmd[1], args);
            break;
        case 5: //TRpg指令
            DoTRpgFunction(msg, cmd[1], args);
            break;
        case 9: //關鍵字回復
            DoBotMessageSend(msg, cmd[0], cmd[1]);
            break;
    }
}
//#endregion

//#region onMessage事件下方法
//baseFunction
async function DoBaseFunction(msg, cmd, args) {
    switch (cmd) {
        case 'help':
            GetHelpMessage(msg, args)
            break;
        case '老婆':
            msg.reply('你沒有老婆!!');
            break;
        case '安安':
            msg.channel.send('午安');
            break;
        case 'myAvatar':
            const avatar = {
                files: [{
                    attachment: msg.author.displayAvatarURL,
                    name: 'avatar.jpg'
                }]
            };
            if (avatar.files) {
                msg.channel.send(`${msg.author}`, avatar);
            }
            break;
        case 'test':
            //msg.channel.send(myEmoji.get('G001'))
            //msg.channel.send("test")
            // .then(message => {
            //message.react("💯") //貼圖回應
            //message.pin() //釘選
            //message.delete() //刪除
            //  }).catch(() => {
            //something
            //  })
            //findPowerFromBaseValue(678615262211211308, 1);
            //client.channels.get('725288853249720402').send('test');
            break;
        case 'test2':
            break;
        case 's': //傳貼圖
            sendEmoji(msg, args[0]);
            break;
        case '貓':
            getCatImage(msg);
            break;
        case '食物':
            getFoodImage(msg);
            break;
        case 'dice':
            getDice(msg, cmd, args);
            break;
        case 'd':
            getDice(msg, cmd, args);
            break;
        case 'v':
            //getVote(msg, cmd, args);
            break;
    }
}

// #region 參數參考
// //此功能當前狀態
// let nowUseTheEditRomValue = false;
// //此功能當前使用者
// let nowUseTheEditRomValueUserID = "";
// //此功能使用之房間
// let nowUseTheEditRomValueChannelID = "";
//#endregion
//系統功能-修改romValue-前綴字
function DoEditRomValue(msg, cmd, args) {

    //先判斷功能是否啟用
    if (nowUseTheEditRomValue) {

        //判斷指令使用方頻道是否正確
        if (nowUseTheEditRomValueChannelID === msg.channel.id) {
            switch (cmd) {
                case 'help':
                    messageManager.EditRomValueMessage(
                        Discord.RichEmbed,
                        nowUseTheEditRomValueChannelID,
                        romValue,
                        ranValue,
                        function(embed) {
                            msg.channel.send(embed);
                        });
                    break;
                case 'close':
                    nowUseTheEditRomValue = false;
                    msg.channel.send('修改功能關閉');
                    break;
                default:
                    //正則
                    const r = /^[0-9]*[1-9][0-9]*$/;
                    if (cmd <= 9 && cmd >= 0) {
                        if (r.test(cmd)) {
                            try {
                                let pushData = new Array;
                                let tempValue;
                                tempValue = cmd;
                                pushData.push(tempValue); // ID
                                tempValue = findRomValueToID(cmd, 'name');
                                pushData.push(tempValue); // Name
                                tempValue = args[0];
                                pushData.push(tempValue); // Value
                                tempValue = findRomValueToID(cmd, 'canEdit');
                                pushData.push(tempValue); // CanEdit
                                tempValue = msg.guild.id;
                                pushData.push(tempValue); // GroupID
                                tempValue = msg.guild.name;
                                pushData.push(tempValue); // GroupName
                                tempValue = msg.channel.id;
                                pushData.push(tempValue); // ChannelID
                                tempValue = msg.channel.name;
                                pushData.push(tempValue); // ChannelName
                                tempValue = msg.author.id;
                                pushData.push(tempValue); // UserID
                                tempValue = msg.author.username;
                                pushData.push(tempValue); // UserName
                                tempValue = 'write';
                                pushData.push(tempValue); // method
                                myDBFunction.postDataForRanValue(pushData, function() {
                                    downloading = true; //下載中
                                    myDBFunction.getDataFormRanValue(function(value) {
                                        if (value) {
                                            ranValue = value;
                                        }
                                        downloading = false; //下載結束
                                    });
                                });
                            } catch (err) {
                                msg.channel.send('資料更新期間發生例外錯誤!\n如果此問題不斷發生，請通知作者(DoEditRomValue')
                                console.log('DoEditRomValue: ', err);
                            }
                        }
                    }
                    break;
            }
            exit;
        } else {
            msg.channel.send('有其他人正在使用中!\n請稍等一下~');
            exit;
        }

    } else {
        nowUseTheEditRomValueChannelID = msg.channel.id;
        nowUseTheEditRomValueUserID = msg.member.user.id;
        nowUseTheEditRomValue = true;
        messageManager.EditRomValueMessage(
            Discord.RichEmbed,
            nowUseTheEditRomValueChannelID,
            romValue,
            ranValue,
            function(embed) {
                msg.channel.send(embed);
            });
    }
}

//攻略組 舊寫法 待優化
function DoRaidersGet(msg, cmd, args) {
    switch (cmd) {
        case '轉生點': //轉生點查詢
            LevelFunction(msg, cmd, args);
            break;
        case '技能':
            SkillFunction(msg, cmd, args);
            break;
        case '黑特':
            BlackListFunction(msg, cmd, args);
            break;
        case '成就':
            MileageFunction(msg, cmd, args);
            break;
    }
}

//音樂指令
function DoMusicFunction(msg, cmd, args) {
    goToMusicHouse(msg, cmd, args);
}

//TRpg指令
function DoTRpgFunction(msg, cmd, args) {
    switch (cmd) {
        case 'dice': //骰子
            getTRpgDice(msg, args);
            break;
        case 'DICE': //骰子
            getTRpgDice(msg, args);
            break;
        case 'd': //骰子
            getTRpgDice(msg, args);
            break;
        case 'D': //骰子
            getTRpgDice(msg, args);
            break;
        case '排序': //排序
            getRandomSortArray(msg, cmd, args);
            break;
    }
}

//關鍵字回復
function DoBotMessageSend(msg, cmd, args) {
    let BTalk;
    if (args === undefined) BTalk = findUserMessageToATalk(msg, cmd);
    else BTalk = findUserMessageToATalk(msg, cmd, args);

    if (Array.isArray(BTalk)) {
        if (BTalk.length == 0) {
            if (args === undefined) BTalk = findBotMessageToATalk(cmd);
            else BTalk = findBotMessageToATalk(cmd, args);
        }
    } else {
        if (BTalk === undefined) {
            if (args === undefined) BTalk = findBotMessageToATalk(cmd);
            else BTalk = findBotMessageToATalk(cmd, args);
        }
    }

    if (BTalk !== undefined) {
        if (BTalk.length != 0) {
            if (BTalk[0] !== undefined) {
                message = valueChange(BTalk[0].BTalk, msg);
            } else {
                message = valueChange(BTalk.BTalk, msg);
            }
            msg.channel.send(message);
        }
    };
}
//#endregion

//#region 抓刪
//抓刪 更新事件
client.on('messageUpdate', function(oldMessage, newMessage) {
    if (!oldMessage.guild || !newMessage.guild) return;

    if (oldMessage.content !== newMessage.content) {
        //愛恩葛朗特
        if (oldMessage.guild.id === '707946293603074108') {
            str = `事件 更新\n使用者 ${oldMessage.member.user.username}\n群組 ${oldMessage.channel.name}\n舊對話 ${oldMessage.content}\n新對話 ${newMessage.content}\n`;
            client.channels.get('733348701346725888').send(str);
        }
    }
})

//抓刪 刪除事件
client.on('messageDelete', message => {
        if (!message.guild) return;

        //愛恩葛朗特
        if (message.guild.id === '707946293603074108') {
            str = `事件 刪除\n使用者 ${message.member.user.username}\n群組 ${message.channel.name}\n刪除內容 ${message.content}\n`;
            client.channels.get('733348701346725888').send(str);
        }
    })
    //#endregion

//#region 更新頻道簡介
client.on('channelUpdate', function(oldChannel, newChannel) {
    try {
        //只做SAO群的簡介紀錄
        if (newChannel.guild) {
            if (newChannel.guild.id == '707946293603074108') {
                let embed = new Discord.RichEmbed()
                    .setColor('#fbfbc9')
                    .setTimestamp();
                //如果更新頻道訊息是07
                if (oldChannel.id == '719892968579792907') {
                    embed.setTitle(newChannel.name);
                    embed.addField('簡介', newChannel.topic);
                    client.channels.get('746179713407385672').send(embed);
                } else {
                    embed.setTitle(newChannel.name);
                    embed.addField('簡介', newChannel.topic);
                    client.channels.get('746179727747973138').send(embed);
                }
            }
        }
    } catch (err) {
        console.log('channelUpdate Error');
    }
})

//#endregion

//#region 方法們

//#region 攻略組

//轉生點
function LevelFunction(msg, cmd, args) {
    if (args[0] === undefined || args[0] === '' || args[1] === '' || args[0] > 100 || args[0] < 1 || args[1] > 10 || args[1] < 1 || isNaN(args[0]) === true || (isNaN(args[1]) === true && args[1] !== undefined)) {
        msgs = '```轉生點查詢\n語法:攻略組 轉生點 {等級} [範圍]\n\n從選擇等級開始查詢，根據範圍返還查詢數量\n\n等級不可低於1，不可大於100\n範圍不可低於1，不可大於10(預設5)```'
        msg.channel.send(msgs);
    } else {
        //範圍預設5
        if (args[1] === undefined) {
            args[1] = 5;
        }
        gasApi.getLevel(args[0], args[1], function(data) {
            getLevel(args[0], data, function(msgs) {
                msg.channel.send(msgs);
            })
        })
    }
}

//攻略組轉生點，資料處理
function getLevel(level, data, callback) {
    let j = parseFloat(level);
    let msgs = '```';
    for (i = 0; i <= data.length - 1; i++) {
        if (data[i] !== undefined) {
            msgs = msgs + `等級${paddingLeft((i + j), 4)} | 等級所需經驗${paddingLeft(data[i].lat, 7)} | 累積轉生點${paddingLeft(data[i].lng, 3)} \n`;
        }
    }
    msgs = msgs + '```';
    if (msgs === '``````') {
        msgs = '你能不能正常打字?';
    }
    callback(msgs);
}

//技能
function SkillFunction(msg, cmd, args) {
    gasApi.getSkill(args[0], function(msgs) {
        msg.channel.send(msgs);
    });
}

//黑特
function BlackListFunction(msgA, cmd, args) {
    gasApi.getBlackList(function(msgData) {
        let many = 4; //一次顯示幾筆
        let i = 0;
        let msgs = '```';
        if (args[0].trim() != '') {
            for (i; i <= msgData.length - 1; i++) {
                if (msgData[i].indexOf(args[0]) != -1) {
                    msgA.channel.send('```' + msgData[i] + '```')
                    break;
                }
            }
            if (i == msgData.length) {
                //沒資料就走原內容
                BlackListFunction(msgA, cmd, [''])
            }
        } else {
            for (i; i < many; i++) {
                msgs = msgs + msgData[i];
            }
            i = 0;
            msgs = msgs + '1/' + Math.ceil(msgData.length / many) + '頁```';
            msgA.channel.send(msgs)
                .then(msg => {
                    msg.react("⏪")
                        .then(msg.react("⏩"))
                    const filter = (reaction, user) => {
                        return ['⏩', '⏪'].includes(reaction.emoji.name) && user.id === msgA.author.id;
                    };

                    const collector = msg.createReactionCollector(filter, { time: 600000 });

                    collector.on('collect', (reaction, user) => {
                        switch (reaction.emoji.name) {
                            case '⏩':
                                if (i >= msgData.length - 1 - many) {
                                    msg.channel.send('後面就沒有了喔~~')
                                        .then(msg => {
                                            setTimeout(() => {
                                                msg.delete();
                                            }, 5000);
                                        })
                                } else {
                                    i = i + many;
                                    EditBlackList(i, msgData, msg, many);
                                }
                                break;
                            case '⏪':
                                if (i <= 0) {
                                    msg.channel.send('這邊是開頭喔!')
                                        .then(msg => {
                                            setTimeout(() => {
                                                msg.delete();
                                            }, 5000);
                                        })
                                } else {
                                    i = i - many;
                                    EditBlackList(i, msgData, msg, many);
                                }
                                break;
                        }
                    })
                })

        }
    });
}

//編輯黑特訊息
function EditBlackList(temp, msgData, msg, many) {
    let message = '```';
    let maxL = many;
    if (msgData.length - temp < many) {
        maxL = msgData.length - temp
    }
    for (i = temp; i < temp + maxL; i++) {
        message = message + msgData[i];
    }
    message = message + `${temp/many+1}/${Math.ceil(msgData.length/many)}頁` + '```';
    msg.edit(message);
}

//成就
function MileageFunction(msgA, cmd, args) {
    gasApi.getMileage(function(msgData) {
        if (typeof(msgData) == 'string') {
            msgA.channel.send(msgData);
        } else if (typeof(msgData) == 'object') {
            let texture = ['🔟', '🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯']
            let str = '';
            for (i = 1; i < msgData.length; i++) {
                str = str + msgData[i][0].MyIDName + ' 請點選 ' + texture[i] + '\n\n';
            }
            msgA.channel.send('```成就\n\n請根據貼圖選擇要查看的分類~\n\n' + str + '```')
                .then(msg => {
                    for (i = 1; i < msgData.length; i++) {
                        if (msgData[i] != undefined) {
                            if (msgData[i].length != 0) {
                                msg.react(texture[i])
                            }
                        }
                    }
                    const filter = (reaction, user) => {
                        return texture.includes(reaction.emoji.name) && user.id === msgA.author.id;
                    };

                    const collector = msg.createReactionCollector(filter, { time: 600000 });

                    collector.on('collect', (reaction, user) => {
                        const j = texture.indexOf(reaction.emoji.name);
                        const selectData = msgData[j];
                        let str = '```' + selectData[0].MyIDName + '\n\n';
                        for (i = 0; i < selectData.length; i++) {
                            str = `${str}條件名稱 ${selectData[i].Answer}\n獲得點數 ${selectData[i].Point}\n不同角色可否累積 ${selectData[i].Repeat}\n\n`;
                        }
                        str = str + '```';
                        msg.channel.send(str);
                    })
                })
                .catch(err => {
                    console.log('errMileage', err)
                })
        }
    })
}
//#endregion

//#region 找資料
//找根據id找romValue的對應資料
function findRomValueToID(idName, itemName) {
    e = romValue.filter(function(item) {
        return item.id == idName
    })
    switch (itemName) {
        case 'name':
            return (e[0].name);
        case 'value':
            return (e[0].value);
        case 'canEdit':
            return (e[0].canEdit);
    }
}

//#region status參考
// 1 = 完全匹配
// 2 = 相似匹配
//#endregion
//根據ATalk找botMessage的對應資料
function findBotMessageToATalk(cmd, status = 1) {
    let BTalk;
    if (status == 1) {
        BTalk = botMessage.filter(item => item.ATalk == cmd);
    } else if (status == 2) {
        BTalk = botMessage.filter(item => cmd.indexOf(item.ATalk) != -1)
    }

    //如果帶回不只一個json，取得觸發字串最大者
    if (BTalk !== undefined)
        if (BTalk.length > 1) {
            let BTalkLength = new Array;
            BTalk.forEach(item => BTalkLength.push((item.ATalk).length));
            BTalkLength = Math.max(...BTalkLength);
            BTalk = BTalk.find(item => (item.ATalk).length == BTalkLength);
        }

    return BTalk;
}

//根據ATalk找userMessage的對應資料
function findUserMessageToATalk(msg, cmd, status = 1) {
    let BTalk;
    if (status == 1) {
        BTalk = userMessage.filter(item => item.ATalk == cmd && item.targetID == msg.author.id);
    } else if (status == 2) {
        BTalk = userMessage.filter(item => cmd.indexOf(item.ATalk) != -1 && item.targetID == msg.author.id)
    }

    //如果帶回不只一個json，取得觸發字串最大者
    if (BTalk !== undefined)
        if (BTalk.length > 1) {
            let BTalkLength = new Array;
            BTalk.forEach(item => BTalkLength.push((item.ATalk).length));
            BTalkLength = Math.max(...BTalkLength);
            BTalk = BTalk.find(item => (item.ATalk).length == BTalkLength);
        }

    return BTalk;
}

//傳送貼圖
function sendEmoji(msg, args) {
    a = client.emojis.find(emoji => emoji.name === args);
    if (a === undefined || a === null) {
        msg.channel.send('Alice cant find this emoji').then(data => {
            msg.delete();
            setTimeout(data.delete(), 2000);
        })
    } else if (a.animated) {
        msg.channel.send('this emoji is animated').then(data => {
            msg.delete();
            setTimeout(data.delete(), 2000);
        })
    } else {
        msg.channel.send(`<:${a.name}:${a.id}>`).then(data => msg.delete())
    }
}

//貓圖
function getCatImage(msg) {
    gasApi.getCatImage(url => {
        if (url.substring(0, 4) != 'http') {
            msg.channel.send(url);
        } else {
            const avatar = {
                files: [{
                    attachment: url,
                    name: 'cat.jpg'
                }]
            };
            if (avatar.files) {
                msg.channel.send('', avatar);
            }
        }
    });
}

//食物
function getFoodImage(msg) {
    gasApi.getFoodImage(url => {
        if (url.substring(0, 4) != 'http') {
            msg.channel.send(url);
        } else {
            const avatar = {
                files: [{
                    attachment: url,
                    name: 'food.jpg'
                }]
            };
            if (avatar.files) {
                msg.channel.send('', avatar);
            }
        }
    });
}
//#endregion

//#region 播歌類方法
//進語音房播歌
async function goToMusicHouse(msg, cmd, args) {
    try {
        switch (cmd) {
            case 'Alice':
                return musicMaster(msg);
            case '休息':
                return goBackHomeFromMusicHouse(msg.guild.id, msg.channel.id);
            case '先播這個':
                return addMusicToOne(msg, args);
            case '先播這首':
                return addMusicToOne(msg, args);
        }

        let validate = await ytdl.validateURL(cmd);
        if (!validate) return msg.channel.send('The link is not working.1');
        if (cmd.substring(0, 4) !== 'http') return msg.channel.send('The link is not working.2');
        let info = await ytdl.getInfo(cmd);

        if (info.videoDetails) {
            if (msg.member.voiceChannel) {
                if (!msg.guild.voiceConnection) {
                    const nowMusicPlayGuild = msg.guild.id;
                    const nowMusicPlayChanel = msg.channel.id;
                    songList.set(nowMusicPlayGuild, new Array());
                    songInfo.set(nowMusicPlayGuild, new Array());
                    songLoop.set(nowMusicPlayGuild, false);
                    addMusicToSongList(nowMusicPlayGuild, cmd);
                    addMusicInfoToSongInfo(nowMusicPlayGuild, info);
                    playMusic(msg, nowMusicPlayGuild, nowMusicPlayChanel);
                    msg.channel.send('來了~').then(
                        msg.delete()
                    ).catch(err => console.log('musicError1'));
                } else {
                    addMusicToSongList(msg.guild.id, cmd);
                    addMusicInfoToSongInfo(msg.guild.id, info);
                    msg.channel.send('已幫你加入歌單~!').then(
                        msg.delete()
                    ).catch(err => console.log('musicError2'));
                }
            } else {
                msg.reply('請先進入頻道:3...');
            }
        } else {
            msg.channel.send('The link is not working.3');
        }
    } catch (err) {
        console.log('goToMusicHouse')
        msg.channel.send(`There's error in this function, so you can ask administer for help.`);
    }
}

//歌曲插播
async function addMusicToOne(msg, args) {
    try {
        let validate = await ytdl.validateURL(args[0]);
        if (!validate) return msg.channel.send('The link is not working.1');
        if (args[0].substring(0, 4) !== 'http') return msg.channel.send('The link is not working.2');
        let info = await ytdl.getInfo(args[0]);
        console.log(info);
        if (info.videoDetails) {
            if (msg.member.voiceChannel) {
                if (!msg.guild.voiceConnection) {
                    const nowMusicPlayGuild = msg.guild.id;
                    const nowMusicPlayChanel = msg.channel.id;
                    songList.set(nowMusicPlayGuild, new Array());
                    songInfo.set(nowMusicPlayGuild, new Array());
                    songLoop.set(nowMusicPlayGuild, false);
                    addMusicToSongList(nowMusicPlayGuild, args[0]);
                    addMusicInfoToSongInfo(nowMusicPlayGuild, info);
                    playMusic(msg, nowMusicPlayGuild, nowMusicPlayChanel);
                    msg.channel.send('來了~').then(
                        msg.delete()
                    ).catch(err => console.log('musicError3'));
                } else {
                    addMusicToSongList(msg.guild.id, args[0], 2);
                    addMusicInfoToSongInfo(msg.guild.id, info, 2);
                    msg.channel.send('好的，下一首播這個喔!').then(
                        msg.delete()
                    ).catch(err => console.log('musicError4'));
                }
            } else {
                msg.reply('請先進入頻道:3...');
            }
        } else {
            msg.channel.send('The link is not working.3');
        }
    } catch (err) {
        console.log('addMusicToOne')
        msg.channel.send(`There's error in this function, so you can ask administer for help.`);
    }
}

//退出語音頻道
function goBackHomeFromMusicHouse(nowMusicPlayGuild, nowMusicPlayChanel) {
    try {
        if (client.voiceConnections.get(nowMusicPlayGuild)) {
            try {
                nowSongName.set(nowMusicPlayGuild, undefined);
                songList.set(nowMusicPlayGuild, new Array());
                songInfo.set(nowMusicPlayGuild, new Array());
                client.voiceConnections.get(nowMusicPlayGuild).disconnect();
                nowMusicPlayGuild = undefined;
            } catch {
                console.log('MusicEndError');
            }
            client.channels.get(nowMusicPlayChanel).send('晚安~');
        } else {
            client.channels.get(nowMusicPlayChanel).send('可是..我還沒進來:3');
        }
    } catch (err) {
        client.channels.get(nowMusicPlayChanel).send('晚安~~');
    }
}

//添加歌曲進歌單
function addMusicToSongList(nowMusicPlayGuild, src, type = 1) {
    try {
        if (type === 1) {
            songList.get(nowMusicPlayGuild).push(src);
        } else if (type === 2) {
            songList.get(nowMusicPlayGuild).unshift(src)
        }
    } catch (err) {
        console.log('addMusicToSongList');
    }
}

//將歌曲資訊打入陣列
function addMusicInfoToSongInfo(nowMusicPlayGuild, info, type = 1) {
    try {
        if (info.videoDetails) {
            if (type === 1) {
                songInfo.get(nowMusicPlayGuild).push(info.videoDetails);
            } else if (type === 2) {
                if (songInfo.get(nowMusicPlayGuild).length !== 0) {
                    nowSongInfo = songInfo.get(nowMusicPlayGuild).shift();
                    songInfo.get(nowMusicPlayGuild).unshift(info.videoDetails);
                    songInfo.get(nowMusicPlayGuild).unshift(nowSongInfo);
                } else {
                    songInfo.get(nowMusicPlayGuild).unshift(info.videoDetails);
                }
            }
        }
    } catch (err) {
        console.log('addMusicInfoToSongInfo')
    }
}

//播放歌曲
function playMusic(msg, nowMusicPlayGuild, nowMusicPlayChanel) {
    msg.member.voiceChannel.join().then(
        connection => {
            try {
                musicPlay2(connection, nowMusicPlayGuild, nowMusicPlayChanel);
            } catch {
                msg.channel.send('播歌期間發生錯誤!\n可能是這首歌小愛不喜歡聽')
            }
        }
    ).catch(err => {
        console.log('musicError5');
        console.log('播歌期間發生錯誤');
        nowSongName.set(nowMusicPlayGuild, undefined);
        goBackHomeFromMusicHouse(nowMusicPlayGuild, nowMusicPlayChanel);
    });
}

// 與playMusic分割，避免重複進出語音
// msg不穩定
async function musicPlay2(connection, nowMusicPlayGuild, nowMusicPlayChanel) {
    try {
        nowSongName.set(nowMusicPlayGuild, songList.get(nowMusicPlayGuild).shift());
        const streamOptions = {
            seek: 0,
            volume: 0.5,
            Bitrate: 192000,
            Passes: 1
        };
        streamOptions.highWaterMark = 1;
        let stream = await ytdl(nowSongName.get(nowMusicPlayGuild), {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 26214400 //25ms
        });
        //dispatcher = connection.playStream(stream, streamOptions);
        dispatcher.set(nowMusicPlayGuild, connection.playStream(stream, streamOptions));
        dispatcher.get(nowMusicPlayGuild).on("end", end => {
            newMusicEnd(nowMusicPlayGuild);
            if (songList.get(nowMusicPlayGuild).length != 0) {
                musicPlay2(connection, nowMusicPlayGuild, nowMusicPlayChanel);
            } else {
                goBackHomeFromMusicHouse(nowMusicPlayGuild, nowMusicPlayChanel);
            }
        });
    } catch (err) {
        console.log('musicPlay2');
        catchCount = catchCount + 1;
        if (catchCount <= 5) {
            client.channels.get(nowMusicPlayChanel).send('音樂主方法傳回例外錯誤\n重新填充歌曲...\n嘗試重新播放曲目，歌單顯示有可能異常');
            songList.get(nowMusicPlayGuild).unshift(nowSongName.get(nowMusicPlayGuild))
            if (songList.get(nowMusicPlayGuild).length != 0) {
                musicPlay2(connection, nowMusicPlayGuild, nowMusicPlayChanel);
            } else {
                goBackHomeFromMusicHouse(nowMusicPlayGuild, nowMusicPlayChanel);
            }
        } else {
            catchCount = 0;
            client.channels.get(nowMusicPlayChanel).send('連續錯誤實例過多，已中斷播放\n或許是小愛不喜歡聽這首歌，請稍後再試~');
            goBackHomeFromMusicHouse(nowMusicPlayGuild, nowMusicPlayChanel);
        }
    }
};

//歌曲結束事件
function newMusicEnd(nowMusicPlayGuild) {
    try {
        if (songLoop.get(nowMusicPlayGuild)) {
            songInfo.get(nowMusicPlayGuild).push(songInfo.get(nowMusicPlayGuild).shift());
            songList.get(nowMusicPlayGuild).push(nowSongName.get(nowMusicPlayGuild));
            nowSongName.set(nowMusicPlayGuild, undefined); //避免bug
        } else {
            songInfo.get(nowMusicPlayGuild).shift(); //將最舊的歌曲資訊清出
            nowSongName.set(nowMusicPlayGuild, undefined);
        }
    } catch (err) {
        console.log('newMusicEnd');
    } finally {
        catchCount = 0;
    }
}

//歌曲列表
function musicList(msg) {
    if (nowSongName.get(msg.guild.id) === undefined) {
        msg = '當前沒有歌曲隊列喔!';
    } else {
        msgs = '```歌曲列表~\n'
        for (i = 0; i < songInfo.get(msg.guild.id).length; i++) {
            msgs = msgs + (i + 1) + '. ' + songInfo.get(msg.guild.id)[i].title + '\n'
        }
        msgs = msgs + '```';
    }
    msg.channel.send(msgs);
}

//播歌功能控制台
function musicMaster(msg) {
    try {
        if (nowSongName.get(msg.guild.id) === undefined) {
            msg.channel.send('?');
        } else {
            songMasterMessage = msg.channel.send('當前播放歌曲~\n' + nowSongName.get(msg.guild.id) + '\n下一首 | 清單 | 循環').then(
                msg.react('⏩')
            ).then(
                msg.react('📃')
            ).then(
                msg.react('🔁')
            ).catch(err => {
                console.log('errMusic', err)
            })

            const filter = (reaction, user) => {
                return ['⏩', '⏹️', '📃', '⏸️', '▶️', '🔁'].includes(reaction.emoji.name) && user.id === msg.author.id;
            };

            const collector = msg.createReactionCollector(filter, { time: 600000 });

            collector.on('collect', (reaction, user) => {
                if (dispatcher.get(msg.guild.id) !== undefined) {
                    switch (reaction.emoji.name) {
                        case '⏩':
                            if (songList.get(msg.guild.id).length != 0) {
                                dispatcher.get(msg.guild.id).end();
                            } else {
                                msg.reply('沒有下一首了呦')
                            }
                            break;
                        case '⏹️':
                            goBackHomeFromMusicHouse(msg.guild.id, msg.channel.id);
                            break;
                        case '📃':
                            musicList(msg);
                            break;
                        case '⏸️':
                            dispatcher.get(msg.guild.id).pause();
                            break;
                        case '▶️':
                            dispatcher.get(msg.guild.id).resume();
                            break;
                        case '🔁':
                            if (songLoop.get(msg.guild.id)) msg.channel.send('循環功能關閉!')
                            else msg.channel.send('開啟循環功能了喔!')
                            songLoop.set(msg.guild.id) = !songLoop.get(msg.guild.id);
                            break;
                    }
                } else {
                    msg.channel.send('The song will ready,please wait seconds for again.')
                }
            });
            collector.on('end', collected => {
                console.log(`Collected ${collected.size} items`);
            });
        }
    } catch (err) {
        console.log('musicMaster');
        msg.channel.send(`There's error in this function, so you can ask administer for help.`);
    }
}
//#endregion

//#region 小/基本功能
//help方法
function GetHelpMessage(msg, args) {
    switch (args[0]) {
        case '!':
            messageManager.HelpMessage2(Discord.RichEmbed, function(embed) {
                msg.channel.send(embed);
            })
            break;
        case '攻略組':
            messageManager.HelpMessage3(Discord.RichEmbed, function(embed) {
                msg.channel.send(embed);
            })
            break;
        case 'T':
            messageManager.HelpMessage4(Discord.RichEmbed, function(embed) {
                msg.channel.send(embed);
            })
            break;
        default:
            messageManager.HelpMessage(Discord.RichEmbed, function(embed) {
                msg.channel.send(embed);
            })
            break;
    }

}

//權限判斷 預設判斷群組id
function findPowerFromBaseValue(msg, temp) {
    let a = baseValue.Power.find(item => item.ChannelID == msg.channel.id && item.Power.indexOf(temp) != -1);
    if (a !== undefined) temp = -1;
    else if (baseValue.Power.find(item => item.ChannelID == msg.channel.id) === undefined) {
        a = baseValue.Power.find(item => item.GroupID == msg.guild.id && item.Power.indexOf(temp) != -1);
        if (a !== undefined) temp = -1;
    }
    return temp;
}

//正則判斷 有奇怪符號的都給我出去
function DeleteTempIfHaveEx(msg, temp) {
    let tempValue = temp;
    //if (msg.substring(0, 4) !== 'http') {
    if (tempValue != '4') {
        const t = /\@|\:/;
        if (t.test(msg)) tempValue = -1;
    }
    return tempValue;
}

//參數替換
function valueChange(message, msg) {
    if (message.indexOf("$[ID]") != -1) {
        beforeStr = message.substring(0, message.indexOf('$[ID]'));
        afterStr = message.substring(message.indexOf('$[ID]') + 5, message.length);
        message = beforeStr + '<@' + msg.author.id + '>' + afterStr;
    }

    return message;
}

//字串補空白
function paddingLeft(str, lenght) {
    if (str.length >= lenght)
        return str;
    else
        return paddingLeft(" " + str, lenght);
}

//骰子
function getDice(msg, cmd, args) {
    try {
        let range = 6;
        let rangeText = new Array();

        rangeText.push('殘念的骰出了');
        rangeText.push('在眾人溫和的目光下骰出了');
        rangeText.push('在一陣強光中骰出了');
        rangeText.push('運氣很好的骰出了');
        rangeText.push('在灰庭醬的祝福下骰出了');
        rangeText.push('「哈↑哈↑哈↓哈↑哈→」在大笑中的 兔田ぺこら 骰出了');

        const regex = /^[0-9]*$/; //純數字
        const regex2 = /^[0-9]*[Dd][0-9]*$/; //純數字 D 純數字 EX:2D12
        const regex2b = /^[0-9]*d[0-9]*$/; //純數字 d 純數字 EX:2D12
        const regex3 = /[@ /\n]/;
        const regex4 = /^[0-9]*[Dd][0-9]*>[0-9]*$/; //2D12>60
        const regex5 = /^[0-9]*[Bb][0-9]*>[0-9]*$/; //2B12>6
        if (regex5.test(args[0]) && args[0] != '') {
            getBaceDice(msg, args, '2', rangeText)
        } else
        if (regex4.test(args[0]) && args[0] != '') {
            getBaceDice(msg, args, '1', rangeText)
        } else
        if (regex2.test(args[0]) && args[0] != '') {
            getBaceDice(msg, args, '0', rangeText)
        } else {
            if (regex.test(args[0]) && args[0] != '') {
                range = args[0];
            }
            const a = Math.floor((Math.random() * range) + 1);
            msg.channel.send(`${msg.author.username} ${rangeText[Math.floor(Math.random() * rangeText.length)]} ${a} 點!!`);
        }
    } catch (err) {
        console.log(err);
    }
}

//基礎骰
function getBaceDice(msg, args, typeED, rangeText) {
    try {
        const regex = /^[0-9]*$/; //純數字
        const regex2b = /^[0-9]*d[0-9]*$/; //純數字 d 純數字 EX:2D12
        const regex2c = /^[0-9]*d[0-9]*>[0-9]*$/; //純數字 D 純數字 EX:2D12
        const regex3 = /[@ /\n]/;
        const regex5b = /^[0-9]*b[0-9]*>[0-9]*$/;
        let msgEd = ``;
        let valueEd;
        let a = 0; //存儲亂數用
        let b = 0; //存儲亂數總和用
        let strSelect = 0;
        let bigSelect = 0; //<60
        let bigCount = 0; //2b12>6 使用
        const textDone = '~~';
        if (args[1] != undefined && !regex3.test(args[1]) && args[1].length < 200) {
            msgEd = `${args[1]} `;
        }
        msgEd = `${msgEd}\n進行亂數檢定${args[0]}`;

        if (typeED === '2') {
            if (regex5b.test(args[0])) valueEd = args[0].split('b');
            else valueEd = args[0].split('B');
            //截2d 12>60
            bigSelect = valueEd[1].split('>');
            valueEd[1] = bigSelect[0];
            bigSelect = bigSelect[1];
            if (bigSelect === '') bigSelect = 0;
        } else if (typeED === '1') {
            if (regex2c.test(args[0])) valueEd = args[0].split('d');
            else valueEd = args[0].split('D');
            //截2d 12>60
            bigSelect = valueEd[1].split('>');
            valueEd[1] = bigSelect[0];
            bigSelect = bigSelect[1];
            if (bigSelect === '') bigSelect = 0;
        } else if (typeED === '0') {
            if (regex2b.test(args[0])) valueEd = args[0].split('d');
            else valueEd = args[0].split('D');
        }

        if (valueEd[0] > 10) valueEd[0] = 10;
        if (valueEd[0] > 5) strSelect = 1; //太洗版了，5秒後自刪

        if (regex.test(valueEd[1]) && valueEd[1] != '') {
            range = valueEd[1];
        }

        for (i = 0; i < valueEd[0]; i++) {
            a = Math.floor((Math.random() * range) + 1);
            b = b + a;
            if (typeED === '2' && !(a > bigSelect)) {
                msgEd = `${msgEd}\n${textDone}第 ${i+1} 次 ${rangeText[Math.floor(Math.random() * rangeText.length)]}${textDone} 
                ${textDone}${a} 點!!${textDone}`;
            } else {
                bigCount = bigCount + 1; //type2才會用到
                msgEd = `${msgEd}\n第 ${i+1} 次 ${rangeText[Math.floor(Math.random() * rangeText.length)]} 
            ${a} 點!!`;
            }
        }
        msgEd = `${msgEd}\n\n檢定結束，${msg.author.username} 骰出了 ${b} !!`;
        if (typeED === '1') {
            msgEd = `${msgEd}\n${b} > ${bigSelect} = ${b>bigSelect}`;
        } else if (typeED === '2') {
            msgEd = `${msgEd}\n→成功數 ${bigCount}`;
        }
        msg.channel.send(msgEd).then(msg => {
            if (strSelect == 1) {
                setTimeout(() => {
                    msg.delete();
                }, 5000)
            }
        }).catch(err => { console.log('getBaceDiceError#02', err) });
    } catch (err) {
        console.log('getBaceDiceError', err);
    }
}

//TRpg骰
function getTRpgDice(msg, args) {
    try {
        const regex = [
            /^[0-9]*$/,
            /^[0-9]*[Bb][0-9]*>[0-9]*$/,
            /^[0-9]*[Bb][0-9]*$/,
            /^[0-9]*[Dd][0-9]*>[0-9]*$/,
            /^[0-9]*[Dd][0-9]*$/
        ];

        regex.some(element => {
            if (element.test(args[0])) {
                if (args[1] != undefined) {
                    if (parseFloat(args[1]) > 5) args[1] = 5;
                    const forEnd = args[1];
                    for (j = 0; j < forEnd; j++) getTRpgDice2(msg, args, regex.indexOf(element));
                } else {
                    getTRpgDice2(msg, args, regex.indexOf(element));
                }
                return true;
            }
        })
    } catch (err) {
        console.log('getTRpgDiceError');
    }
}

function getTRpgDice2(msg, args, typeED) {
    try {
        let mStr = '';
        let args0A = 'null';
        let args0B = 'null';
        let range = '6';
        let tempValue = new Array;
        let sumValue = 0;
        let sussesCount = 0;
        switch (typeED) {
            case 0:
                args0A = [0, 6];
                if (args[0] == '') args0A[0] = '1';
                else args0A[0] = args[0];
                break;
            case 1:
                mStr = `\n(${args[0]})→`;
                if (/^[0-9]*b[0-9]*>[0-9]*$/.test(args[0])) {
                    args0A = args[0].split('b'); //2 , 6>8
                    args0B = args0A[1].split('>'); // 6 , 8
                    args0A[1] = args0B[0];
                } else {
                    args0A = args[0].split('B'); //2 , 6>8
                    args0B = args0A[1].split('>'); // 6 , 8
                    args0A[1] = args0B[0];
                }
                break;
            case 2:
                mStr = `\n(${args[0]})→`;
                if (/^[0-9]*b[0-9]*$/.test(args[0])) {
                    args0A = args[0].split('b'); //2 , 6
                } else {
                    args0A = args[0].split('B'); //2 , 6
                }
                break;
            case 3:
                mStr = `\n${args[0]}：\n`;
                if (/^[0-9]*d[0-9]*>[0-9]*$/.test(args[0])) {
                    args0A = args[0].split('d'); //2 , 6>8
                    args0B = args0A[1].split('>'); // 6 , 8
                    args0A[1] = args0B[0];
                } else {
                    args0A = args[0].split('D'); //2 , 6>8
                    args0B = args0A[1].split('>'); // 6 , 8
                    args0A[1] = args0B[0];
                }
                break;
            case 4:
                mStr = `\n${args[0]}：\n`;
                if (/^[0-9]*d[0-9]*$/.test(args[0])) {
                    args0A = args[0].split('d'); //2 , 6
                } else {
                    args0A = args[0].split('D'); //2 , 6
                }
                break;
        }

        if (parseFloat(args0A[0]) > 10) args0A[0] = 10;

        if (args0A !== 'null')
            if (args0A[1] !== '')
                range = parseFloat(args0A[1]);

        for (i = 0; i < parseFloat(args0A[0]); i++) {
            tempValue.push(Math.floor((Math.random() * range) + 1));
            sumValue = sumValue + tempValue[i];
            if (typeED === 1) {
                if (!(parseFloat(tempValue[i]) > parseFloat(args0B[1]))) {
                    tempValue[i] = '~~' + tempValue[i] + '~~';
                } else {
                    sussesCount = sussesCount + 1;
                }
            }
        }

        switch (typeED) {
            case 0:
                mStr = `${mStr}[${tempValue}]`;
                break;
            case 1:
                mStr = `${mStr}${tempValue}\n→成功數${sussesCount}`;
                break;
            case 2:
                mStr = `${mStr}${tempValue}`;
                break;
            case 3:
                mStr = `${mStr}${sumValue}[${tempValue}]`;
                mStr = `${mStr} > ${args0B[1]} = ${parseFloat(sumValue)>parseFloat(args0B[1])}`;
                break;
            case 4:
                mStr = `${mStr}${sumValue}[${tempValue}]`;
                break;
        }
        msg.reply(mStr);
    } catch (err) {
        console.log(err, 'getTRpgDice2Error');
    }
}

//排序
function getRandomSortArray(msg, cmd, args) {
    try {
        const randomArray = args.sort(function() {
            return .5 - Math.random();
        });
        const mStr = `排序\n→ ${randomArray}`;
        let strLengthED = mStr.length;
        if (mStr.length > 50) strLengthED = 50;
        msg.channel.send((mStr).substring(0, strLengthED))
            .catch('getRandomSortArrayError2');
    } catch (err) {
        console.log('getRandomSortArrayError', err);
    }
}

//投票
function getVote(msgA, cmd, args) {
    try {
        let mStr = '```投票 ' + args[0] + '\n```';
        let selectArray = new Array();
        let reachArray = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯'];

        for (i = 1; i < args.length; i++) {
            selectArray.push(args[i]);
        }
        const selectArrayCount = selectArray.length;
        for (i = 10; i > selectArrayCount; i--) {
            selectArray.push('null');
        }

        msgA.channel.send(mStr).then(msg => {
            for (i = 0; i < selectArray.length; i++) {
                if (selectArray[i] != 'null') msg.react(reachArray[i])
            }

            const filter = (reaction, user) => {
                return reachArray.includes(reaction.emoji.name) && user.id === msgA.author.id;
            };

            let timeEd = 600000;
            const collector = msg.createReactionCollector(filter, { time: timeEd });

            collector.on('collect', (reaction, user) => {
                //還沒做
            })
        }).catch(err => {
            console.log('getVote', err)
        })
    } catch (err) {
        console.log('topGetVoteError');
    }
}
//#endregion

//#endregion