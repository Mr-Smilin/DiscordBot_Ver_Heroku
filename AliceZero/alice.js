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
//#endregion

//#region 表單資料
//資料狀態控制
let downloading = false;

//各頻道訂製觸發指令
let ranValue;

//機器人訊息庫
let botMessage;
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
      console.log(`Logged in as ${client.user.tag}!`);
      downloading = false; //下載結束
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
  }
  catch (err) {
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
  }
  else {
    if (cmd[0] !== undefined) {
      SelectFunctionFromBeforeText(msg, cmd);
    }
  }
});

//新增主要功能時，需要修改這邊的switchTemp與romValue
function SelectFunctionFromBeforeText(msg, cmd, args = [""]) {

  //#region temp賦予
  //標準
  let temp = -2;
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
    default: //關鍵字回復
      if (temp == -2) DoBotMessageSend(msg, cmd[0], cmd[1]);
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
    case 'react': //重複發言，測試用
      console.log(msg.content);
      msg.channel.send(msg.content);
      break;
    case 'Alice':   //語音功能
      let validate = await ytdl.validateURL(args[0]);
      if (!validate) return msg.channel.send('The link is not working.');

      if (msg.member.voiceChannel) {
        if (!msg.guild.voiceConnection) {
          msg.member.voiceChannel.join().then(
            connection => {
              let stream = ytdl(args[0], { filter: 'audioonly' })
              let dispatcher = connection.playStream(stream);
              dispatcher.on("end", end => { msg.member.voiceChannel.leave(); });
            }
          ).catch(console.error);
          msg.channel.send('來了~');
        }
      } else {
        msg.reply('請先進入頻道:3...');
      }
      break;
    case 'Alice休息':
      if (msg.guild.voiceConnection) {
        msg.guild.voiceConnection.disconnect();
        msg.channel.send('晚安~');
      } else {
        msg.channel.send('可是..我還沒進來:3');
      }
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
              }
              catch (err) {
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
    case '轉生點':  //轉生點查詢
      if (args[0] === undefined || args[0] === '' || args[1] === '' || args[0] > 100 || args[0] < 1 || args[1] > 10 || args[1] < 1 || isNaN(args[0]) === true || (isNaN(args[1]) === true && args[1] !== undefined)) {
        msgs = '```轉生點查詢\n語法:攻略組 轉生點 {等級} [範圍]\n\n從選擇等級開始查詢，根據範圍返還查詢數量\n\n等級不可低於1，不可大於100\n範圍不可低於1，不可大於10(預設5)```'
        msg.channel.send(msgs);
      }
      else {
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

//關鍵字回復
function DoBotMessageSend(msg, cmd, args) {
  let BTalk;
  if (args === undefined) BTalk = findBotMessageToATalk(cmd);
  else BTalk = findBotMessageToATalk(cmd, args);

  if (BTalk !== undefined) {
    if (BTalk.length != 0) {
      if (BTalk[0] !== undefined)
        msg.channel.send(BTalk[0].BTalk);
      else
        msg.channel.send(BTalk.BTalk);
    }
  };
}
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
function findBotMessageToATalk(cmd, status = 2) {
  let BTalk;
  if (status == 1) {
    BTalk = botMessage.filter(item => item.ATalk == cmd);
  }
  else if (status == 2) {
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
  const t = /\!|\@|\:/;
  let tempValue = temp;
  if (t.test(msg)) tempValue = -1;
  return tempValue;
}

//#endregion