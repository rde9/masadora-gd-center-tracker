const fs = require('fs');
const inquirer = require('inquirer');
const { exit } = require('process');

const baseUrl = 'https://gd.masadora.jp/api/group/delivery';
let answer;

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

const promptQuestion = (name, type, message) => {
  const question = {
    name: name,
    type: type,
    message: message
  };
  return inquirer.prompt(question);
};

const handleQuestions = async () => {
  console.log('[1] 显示列表');
  console.log('[2] 添加用户');
  console.log('[3] 删除用户');
  console.log('[0] 退出');
  answer = await promptQuestion('ACTION', 'input', '请输入需要执行的动作');
  let tmp = fs.readFileSync('./users.json', 'utf-8');
  let readConfig = JSON.parse(tmp);
  switch (answer.ACTION) {
    case '1':
      let count = 0;
      readConfig.list.forEach(element => {
        ++count;
        console.log(`[${count}]`);
        console.log(`用户名：${element.username}`);
        console.log(`最新团号：${element.currentGroupNo}`);
        console.log(`状态：${element.groupStatus}`);
        console.log();
      });
      break;
    case '2':
      answer = await promptQuestion('USERNAME', 'input', '请输入用户名');
      let USERNAME = answer.USERNAME;
      const options = {
        url: baseUrl,
        method: 'get',
        json: true,
        qs: { page: 0, size: 1, keyword: USERNAME }
      }
      let data = await promisifyRequest(options).catch(err => {
        console.log("请求错误：" + err.message);
      });
      if (data == null || data.total == 0 || data.content[0].user.name != USERNAME) {
        console.log('请求错误或用户不存在');
      } else {
        readConfig.list.push({
          'username': USERNAME,
          'currentGroupNo': data.content[0].infoNo,
          'groupStatus': data.content[0].status
        })
        fs.writeFileSync('./users.json', JSON.stringify(readConfig, null, 2), { encoding: 'utf-8' });
        console.log('添加成功');
      }
      break;
    case '3':
      answer = await promptQuestion('DELETE_USER', 'input', '请输入要删除的用户编号');
      let id = parseInt(answer.DELETE_USER);
      if(!id || id > readConfig.list.length) {
        console.log('输入不合法.');
      } else {
        readConfig.list.splice(id - 1, 1);
        fs.writeFileSync('./users.json', JSON.stringify(readConfig, null, 2), { encoding: 'utf-8' });
        console.log('删除成功');
      }
      break;
    case '0':
      break;
    default:
      console.log('输入不合法.');
      break;
  }
}

const run = async () => {
  await handleQuestions();
}


try {
  fs.accessSync('./users.json');
} catch (err) {
  console.log('配置文件不存在，请先运行 npm start.');
  exit(-1);
}

run();