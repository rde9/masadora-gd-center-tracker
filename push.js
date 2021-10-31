const request = require('request');
const dotenv = require('dotenv').config();

const promisifyRequest = (options) => {
  return new Promise((resolve, reject) => {
    request(options, (err, res, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  })
}

const push = async (username, infoNo) => {
  if (process.env.TG_BOT_TOKEN && process.env.TG_USER_ID) {
    const tgText = encodeURI(`新拼团信息：${username} \`${infoNo}\``);
    const tgUrl = `https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage?chat_id=${process.env.TG_USER_ID}&parse_mode=MarkdownV2&text=${tgText}`;
    promisifyRequest(tgUrl)
    .then(() => {
      console.log('Telegram消息推送成功');
    })
    .catch(err => {
      console.log('Telegram消息推送失败：' + err.message);
    })
  }

  if (process.env.IGOT_PUSH_KEY) {
    const igTitle = encodeURI(`新拼团信息：${username} ${infoNo}`);
    const igUrl = `https://push.hellyw.com/${process.env.IGOT_PUSH_KEY}/${igTitle}`;
    promisifyRequest(igUrl)
    .then(() => {
      console.log('iGot消息推送成功');
    })
    .catch(err => {
      console.log('iGot消息推送失败：' + err.message);
    })
  }

  if(process.env.SERVERCHAN_KEY) {
    const scTitle = encodeURI(`新拼团信息：${username} ${infoNo}`);
    const scUrl = `https://sctapi.ftqq.com/${process.env.SERVERCHAN_KEY}.send?title=${scTitle}`;
    promisifyRequest(scUrl)
    .then(() => {
      console.log('Server酱消息推送成功');
    })
    .catch(err => {
      console.log('Server酱消息推送失败：' + err.message);
    })
  }


}

module.exports = push;
