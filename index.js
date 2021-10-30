const cron = require('cron');
const fs = require('fs');
const inquirer = require('inquirer');
const shell = require('shelljs');
const request = require('request');

let tg_bot_token = '123:abc';
let tg_chat_id = '0123456';

const baseUrl = 'https://gd.masadora.jp/api/group/delivery';
const defaultConfig = {
	'list':
		[
			/*
			{
				'username': '',
				'currentGroupNo': '',
				'groupStatus': '' // 2000 已发布，待完成 | 3000 已截单
			}
			*/
		]
}
let readConfig = null;

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

const init = async () => {
	let answer = await promptQuestion('TG_TOKEN', 'input', '初始化：请输入Telegram bot token');
	tg_bot_token = answer.TG_TOKEN;

	answer = await promptQuestion('TG_CHAT_ID', 'input', '初始化：请输入Telegram chat id');
	tg_bot_token = answer.TG_CHAT_ID;

	let USERNAME = null;
	let data = null;

	while (USERNAME == null) {
		answer = await promptQuestion('USERNAME', 'input', '初始化：请输入用户名');
		USERNAME = answer.USERNAME;
		const options = {
			url: baseUrl,
			method: 'get',
			json: true,
			qs: { page: 0, size: 1, keyword: USERNAME }
		}
		data = await promisifyRequest(options).catch(err => {
			console.log("请求错误：" + err.message);
		});
		if (data == null || data.total == 0 || data.content[0].user.name != USERNAME) {
			console.log('请求错误或用户不存在');
			USERNAME = null;
		} else {
			let tmp = fs.readFileSync('./users.json', 'utf-8');
			readConfig = JSON.parse(tmp);
			readConfig.list.push({
				'username': USERNAME,
				'currentGroupNo': data.content[0].infoNo,
				'groupStatus': data.content[0].status
			})
			fs.writeFileSync('./users.json', JSON.stringify(readConfig, null, 2), { encoding: 'utf-8' });
			console.log('添加成功');
			console.log(`当前列表：\n[1]\n用户名：${USERNAME}\n最新团号：${data.content[0].infoNo}\n状态：${data.content[0].status}`);
			console.log('进行列表管理，请运行 npm config');
		}
	}
}

const job = new cron.CronJob('*/20 * * * * *', function () {
	// console.log('You will see this message every 20 seconds');
	let tmp = fs.readFileSync('./users.json', 'utf-8');
	readConfig = JSON.parse(tmp);
	let updateInfo = readConfig.list.map(element => {
		return new Promise((resolve) => {
			const options = {
				url: baseUrl,
				method: 'get',
				json: true,
				qs: { page: 0, size: 1, keyword: element.username }
			}
			promisifyRequest(options).then((body) => {
				if (body.content[0].infoNo != element.currentGroupNo) {
					pushNotification(element.username, body.content[0].infoNo);
					element.currentGroupNo = body.content[0].infoNo;
				}
				resolve();
			}).catch(err => {
				console.log("请求错误：" + err.message);
			})
		});
	})
	Promise.all(updateInfo).then(() => {
		fs.writeFileSync('./users.json', JSON.stringify(readConfig, null, 2), { encoding: 'utf-8' });
	});
});

const pushNotification = async (username, infoNo) => {
	const text = encodeURI(`用户 ${username} 拼团信息有更新\n最新团号： \`${infoNo}\``);
	const tgUrl = `https://api.telegram.org/bot${tg_bot_token}/sendMessage?chat_id=${tg_chat_id}&parse_mode=MarkdownV2&text=${text}`;
	promisifyRequest(tgUrl).catch(err => {
		console.log('Telegram消息推送失败：' + err.message);
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

const checkConfig = async (config) => {
	try {
		fs.accessSync(config);
	} catch (err) {
		fs.writeFileSync(config, JSON.stringify(defaultConfig, null, 2), { encoding: 'utf-8' });
		await init();
	}
}

const run = async () => {
	await checkConfig('./users.json').then(() => {
		job.start();
	})
}

run();
