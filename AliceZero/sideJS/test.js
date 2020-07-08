var axios = require('axios');
var qs = require('qs');
var data = qs.stringify({
  'ID': '0',
  'Name': '系統指令前綴字',
  'Value': '~~~',
  'CanEdit': '1',
  'GroupID': '678615262211211308',
  'GroupName': '',
  'ChannelID': '725288853249720402',
  'ChannelName': '',
  'UserID': '165753385385984000',
  'UserName': '',
  'method': 'write'
});
var config = {
  method: 'post',
  url: 'https://script.google.com/macros/s/AKfycbws1LYAP8LC5e6BlMr-2ShjiPe0zzAvWOEC8NJBnA-5CQcCxO0/exec',
  headers: {},
  data: data
};

axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });