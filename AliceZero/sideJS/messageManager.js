const { indexOf } = require("ffmpeg-static");


//help romID:0
exports.HelpMessage = function (RichEmbed, callback) {
  const embed = new RichEmbed()
    .setColor('#6A6AFF')
    .setTitle('Some titles')
    //.setURL('https://i.imgur.com/UV6lgWg.jpg')
    .setAuthor('サチ', 'https://i.imgur.com/UV6lgWg.jpg', 'https://home.gamer.com.tw/homeindex.php')
    .setDescription('Some description here')
    .setThumbnail('https://i.imgur.com/UV6lgWg.jpg')
    .addField('Regular field title', 'Some value here')
    .addField('\u200B', '\u200B')
    .addField('Inline field title', 'Some value here', true)
    .addField('Inline field title', 'Some value here', true)
    .addField('Inline field title', 'Some value here', true)
    //.setImage('https://i.imgur.com/wSTFkRM.png')
    .setTimestamp()
    .setFooter('07群的都是變態484', 'https://i.imgur.com/crrk7I2.png');
  callback(embed);
}

//EditRomValue romID:2
exports.EditRomValueMessage = function (RichEmbed, channel, romValue, ranValue, callback) {
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
      ranID = ranValue.filter(function (item) {
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