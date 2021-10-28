const cron = require('cron');
const fs = require('fs');
let shell = require('shelljs');
const path = require('path');
const request = require('request');

const tg_bot_token = '123:abc';

const baseUrl = 'https://gd.masadora.jp/api/group/delivery?page=0&size=1&keyword=';
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

const checkConfig = function (config) {
	try {
	  fs.accessSync(config);
	} catch (e) {
	  fs.writeFileSync(config,JSON.stringify(defaultConfig,null,2),{encoding: 'utf-8'});
	}
}