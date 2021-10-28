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
			'currentGroupNo': ''
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