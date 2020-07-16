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
const { format } = require('path');
const { isArray } = require('util');
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
let songList = new Array();
let nowSongName;
let dispatcher;
let nowMusicPlayGuild = undefined;
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

    myDBFunction.getDataFormRanValue(function (value) {
        if (value) {
            ranValue = value;
        }
        myDBFunction.getDataFormBotMessage(function (value) {
            if (value) {
                botMessage = value;
            }
            myDBFunction.getDataFormUserMessage(function (value) {
                if (value) {
                    userMessage = value;
                }
                client.user.setPresence({ game: { name: '請使用 ~ help 查詢使用說明書!' }, status: 'idle' });
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
        temp = DeleteTempIfHaveEx(cmd[1], temp);
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
        case 4:
            DoMusicFunction(msg, cmd[1], args);
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
            messageManager.HelpMessage(Discord.RichEmbed, function (embed) {
                msg.channel.send(embed);
            })
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
        case 'r': //給留言上貼圖
            //client.channels.get('717361302829400168').send('<@731076508612952146>').cleanContent;
            //console.log(msg);
            // a = client.channels.get(msg.channel.id).fetchMessages({limit: 100});
            // console.log('a ',a,'\nb ',a.find(item => item.id==='731062385212653700'));
            break;
        //#region 語音功能(舊)
        // case 'Alice': //語音功能
        //     if (nowMusicPlayGuild === msg.guild.id || nowMusicPlayGuild === undefined)
        //         goToMusicHouse(msg, args);
        //     else
        //         msg.channel.send('目前有其他群組正在使用此功能，請稍等喔!')
        //     break;
        // case 'Alice休息':
        //     goBackHomeFromMusicHouse(msg);
        //     break;
        //#endregion
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
                        function (embed) {
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
                                myDBFunction.postDataForRanValue(pushData, function () {
                                    downloading = true; //下載中
                                    myDBFunction.getDataFormRanValue(function (value) {
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
            function (embed) {
                msg.channel.send(embed);
            });
    }
}

//攻略組 舊寫法 待優化
function DoRaidersGet(msg, cmd, args) {
    switch (cmd) {
        case '轉生點': //轉生點查詢
            if (args[0] === undefined || args[0] === '' || args[1] === '' || args[0] > 100 || args[0] < 1 || args[1] > 10 || args[1] < 1 || isNaN(args[0]) === true || (isNaN(args[1]) === true && args[1] !== undefined)) {
                msgs = '```轉生點查詢\n語法:攻略組 轉生點 {等級} [範圍]\n\n從選擇等級開始查詢，根據範圍返還查詢數量\n\n等級不可低於1，不可大於100\n範圍不可低於1，不可大於10(預設5)```'
                msg.channel.send(msgs);
            } else {
                if (args[1] === undefined) {
                    args[1] = 5;
                }
                gasApi.getLevel(args[0], args[1], function (data) {
                    getLevel(args[0], data, function (msgs) {
                        msg.channel.send(msgs);
                    })
                })
            }

            break;
        case '技能':
            gasApi.getSkill(args[1], function (msgs) {
                msg.channel.send(msgs);
            });

            break;
        case '黑特':
            gasApi.getBlackList(function (msgs) {
                msg.channel.send(msgs);
            });

            break;
    }
}

//音樂指令
function DoMusicFunction(msg, cmd, args) {
    if (nowMusicPlayGuild === msg.guild.id || nowMusicPlayGuild === undefined)
        goToMusicHouse(msg, cmd, args);
    else
        msg.channel.send('目前有其他群組正在使用此功能，請稍等喔!')
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
client.on('messageUpdate', function (oldMessage, newMessage) {
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
    //愛恩葛朗特
    if (message.guild.id === '707946293603074108') {
        str = `事件 刪除\n使用者 ${message.member.user.username}\n群組 ${message.channel.name}\n刪除內容 ${message.content}\n`;
        client.channels.get('733348701346725888').send(str);
    }
})
//#endregion

//#region 方法們
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

//字串補空白
function paddingLeft(str, lenght) {
    if (str.length >= lenght)
        return str;
    else
        return paddingLeft(" " + str, lenght);
}

//找根據id找romValue的對應資料
function findRomValueToID(idName, itemName) {
    e = romValue.filter(function (item) {
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
    if (msg.substring(0, 4) !== 'http') {
        const t = /\!|\@|\:/;
        if (t.test(msg)) tempValue = -1;
    }
    return tempValue;
}

//進語音房播歌
async function goToMusicHouse(msg, cmd, args) {
    nowMusicPlayGuild = msg.guild.id;
    switch (cmd) {
        case 'Alice':
            return musicMaster(msg);
        case '休息':
            return goBackHomeFromMusicHouse(msg);
        case '先播這個':
            return addMusicToOne(msg, args);
        case '先播這首':
            return addMusicToOne(msg, args);
    }

    let validate = await ytdl.validateURL(cmd);
    if (!validate) return msg.channel.send('The link is not working.');
    if (cmd.substring(0, 4) !== 'http') return msg.channel.send('The link is not working.');

    if (msg.member.voiceChannel) {
        if (!msg.guild.voiceConnection) {
            addMusicToSongList(cmd);
            playMusic(msg);
            msg.channel.send('來了~').then(
                msg.delete()
            ).catch(err => console.log(err));
        } else {
            addMusicToSongList(cmd);
            msg.channel.send('已幫你加入歌單~!').then(
                msg.delete()
            ).catch(err => console.log(err));
        }
    } else {
        msg.reply('請先進入頻道:3...');
    }

}

//退出語音頻道
function goBackHomeFromMusicHouse(msg) {
    nowMusicPlayGuild = undefined;
    if (msg.guild.voiceConnection) {
        nowSongName = undefined;
        songList = new Array();
        msg.guild.voiceConnection.disconnect();
        msg.channel.send('晚安~');
    } else {
        msg.channel.send('可是..我還沒進來:3');
    }
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

//歌曲插播
async function addMusicToOne(msg, args) {
    let validate = await ytdl.validateURL(args[0]);
    if (!validate) return msg.channel.send('The link is not working.');
    if (args[0].substring(0, 4) !== 'http') return msg.channel.send('The link is not working.');

    if (msg.member.voiceChannel) {
        if (!msg.guild.voiceConnection) {
            addMusicToSongList(args[0]);
            playMusic(msg);
            msg.channel.send('來了~').then(
                msg.delete()
            ).catch(err => console.log(err));
        } else {
            songList.unshift(args[0]);
            msg.channel.send('好的，下一首播這個喔!').then(
                msg.delete()
            ).catch(err => console.log(err));
        }
    } else {
        msg.reply('請先進入頻道:3...');
    }

}

//添加歌曲進歌單
function addMusicToSongList(src) {
    songList.push(src);
}

//播放歌曲
async function playMusic(msg) {
    nowSongName = songList.shift();
    const streamOptions = { seek: 0, volume: 0.5 };
    let stream = await ytdl(nowSongName, { filter: 'audioonly' });
    msg.member.voiceChannel.join().then(
        connection => {
            dispatcher = connection.playStream(stream, streamOptions);
            dispatcher.on("end", end => {
                nowSongName = undefined;
                if (songList.length != 0) {
                    playMusic(msg);
                } else {
                    goBackHomeFromMusicHouse(msg);
                }
            });
        }
    ).catch(console.error);
}

//歌曲列表
function musicList(msg) {
    if (nowSongName === undefined) {
        msg = '當前沒有歌曲隊列喔!';
    } else {
        msgs = '```歌曲列表~\n1. ' + nowSongName + '\n'
        for (i = 1; i < songList.length; i++) {
            msgs = msgs + (i + 1) + '. ' + songList[i] + '\n'
        }
        msgs = msgs + '```';
    }
    msg.channel.send(msgs);
}

//播歌功能控制台
function musicMaster(msg) {
    if (nowSongName === undefined) {
        msg.channel.send('?');
    }
    else {
        songMasterMessage = msg.channel.send('當前播放歌曲~\n' + nowSongName + '\n下一首 | 清單 | 暫停 | 播放').then(
            msg.react('⏩')
        ).then(
            msg.react('📃')
        ).then(
            msg.react('⏸️')
        ).then(
            msg.react('▶️')
        ).catch(err => {
            console.log('errMusic', err)
        })

        const filter = (reaction, user) => {
            return ['⏩', '⏹️', '📃', '⏸️', '▶️'].includes(reaction.emoji.name) && user.id === msg.author.id;
        };

        const collector = msg.createReactionCollector(filter, { time: 600000 });

        collector.on('collect', (reaction, user) => {
            switch (reaction.emoji.name) {
                case '⏩':
                    if (songList.length != 0) {
                        dispatcher.end();
                    } else {
                        msg.reply('沒有下一首了呦')
                    }
                    break;
                case '⏹️':
                    goBackHomeFromMusicHouse(msg);
                    break;
                case '📃':
                    musicList(msg);
                    break;
                case '⏸️':
                    dispatcher.pause();
                    break;
                case '▶️':
                    dispatcher.resume();
                    break;
            }
        });
        collector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
        });
    }
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

//#endregion