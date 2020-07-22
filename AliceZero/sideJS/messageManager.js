const { indexOf } = require("ffmpeg-static");


//help romID:0
exports.HelpMessage = function(RichEmbed, callback) {
        const embed = new RichEmbed()
            .setColor('#6A6AFF')
            .setTitle('A.L.I.C.E.')
            //.setURL('https://i.imgur.com/UV6lgWg.jpg')
            .setAuthor('アリス・ツーベルク', 'https://i.imgur.com/crrk7I2.png', 'https://home.gamer.com.tw/homeindex.php')
            .setDescription('人工高適應性知性自律存在')
            .setThumbnail('https://i.imgur.com/5ffD6du.png')
            .addField('小愛#0143', '主人您好，請問有何吩咐?')
            .addField('\u200B', '\u200B')
            .addField('系統命令', '神聖術語 ~')
            .addField('help', '幫助指令', true)
            .addField('s {貼圖編號}', '根據編號反饋貼圖(如果小愛有的話)', true)
            .addField('\u200B', '\u200B')
            .addField('請小愛播放歌曲', '神聖術語 !', )
            .addField('Alice', '小愛的遙控器', true)
            .addField('{網址}', '將歌曲放入播放隊列', true)
            .addField('休息', '小愛就會去休息', true)
            .addField('先播這個 {網址}', '可以請小愛插播歌曲', true)
            .addField('\u200B', '\u200B')
            .addField('查詢攻略組們努力製作的表單', '神聖術語 攻略組', )
            .addField('轉生點 {等級} [範圍]', '查詢各等級的轉生點', true)
            .addField('技能 {角色名稱}', '查詢各角色的持有技能', true)
            .addField('黑特', '查詢黑鐵宮名單', true)
            .addField('\u200B', '\u200B')
            .addField('以上是目前小愛開放的指令', '除此以外..')
            .addField('回答', '有時會在大家聊天時回應大家的話', true)
            .addField('紀錄', '小愛會記下誰偷偷刪除訊息', true)
            .addField('情報', '無限期支持myShino計畫~', true)
            //.setImage('https://i.imgur.com/wSTFkRM.png')
            .setTimestamp()
            .setFooter('上香雞排~! 上香雞排~!', 'https://i.imgur.com/crrk7I2.png');
        callback(embed);
    }
    //07群的都是變態484

//EditRomValue romID:2
exports.EditRomValueMessage = function(RichEmbed, channel, romValue, ranValue, callback) {
    let embed = new RichEmbed()
        .setColor('#6A6AFF')
        .setTitle('觸發詞修改')
        .setAuthor('サチ', 'https://i.imgur.com/UV6lgWg.jpg', 'https://home.gamer.com.tw/homeindex.php')
        .setDescription('可修改內容如下')
        .setTimestamp()
        .setFooter('07群的都是變態484', 'https://i.imgur.com/crrk7I2.png');

    //固定資料
    for (let i = 0; i <= romValue.length - 1; i++) {
        if (romValue[i].canEdit) {
            let
                id = romValue[i].id,
                name = romValue[i].name,
                value = romValue[i].value;

            //判斷此頻道是否有更換過此內容
            ranID = ranValue.filter(function(item) {
                return item.ChannelID == channel && item.ID == id;
            })

            if (ranID.length) {
                value = ranID[0].Value;
            }

            embed = embed.addField(id, name + ' ' + value);
        }
    }

    callback(embed);
}


//RichEmbed演示
// new RichEmbed()
//   .setColor('#0099ff')
//   .setTitle('Some title')
//   .setURL('https://discord.js.org/')
//   .setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
//   .setDescription('Some description here')
//   .setThumbnail('https://i.imgur.com/wSTFkRM.png')
//   .addField('Regular field title', 'Some value here')
//   .addField('\u200B', '\u200B')
//   .addField('Inline field title', 'Some value here', true)
//   .addField('Inline field title', 'Some value here', true)
//   .addField('Inline field title', 'Some value here', true)
//   .setImage('https://i.imgur.com/wSTFkRM.png')
//   .setTimestamp()
//   .setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');