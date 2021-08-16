const TeleBot = require('telebot');
const bot = new TeleBot('123:abc'); // Bot Token

var fs = require('fs');
var path = require('path');
var request = require('request');

var timeStamps = [];

// 创建json文件存放目录
var dirPath = path.join(__dirname, "file");
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
	console.log("file目录创建成功");
} else {
	console.log("file目录已存在");
}

// request
function getTime() {
	var DATE = new Date();
	var date = DATE.toLocaleDateString().replace(/\//g,'-');
	var time = DATE.toLocaleTimeString('chinese',{hour12:false}).replace(/:/g,'-');
	var res = date + '-' + time;
	return res;
}

var options = {
    url: 'https://gd.masadora.jp/api/group/delivery?page=0&size=5&keyword=KEYWORD' // 搜索关键词
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        //console.log(body);
		console.log('statusCode == 200');
    }
}

function getJson() {
	var time = getTime();
	timeStamps.push(time);
	var fileName = time + '.json';
	var stream = fs.createWriteStream(path.join(dirPath, fileName));
	request(options, callback).pipe(stream).on("close", function (err) {
		console.log(fileName + " "+ "下载完成");
    });
}

function parseJson(file) {
	 var obj = JSON.parse(file.replace(/[\r\n\s+]/g, '')); // 清除结果中的换行符
	 var data = [];
	 var res = "";
	 for(var i = 0; i < obj.pageSize; i++)
	 {
		 var elem = [];
		 elem.push(obj.content[i].infoNo);
		 elem.push(obj.content[i].statusE);
		 elem.push(obj.content[i].settings.title);
		 data.push(elem);
	 }
	 for(var i = 0; i < obj.pageSize; i++)
	 {
		 var row = "";
		 for(var j = 0; j < 3; j++)
		 {
			row += data[i][j] + ' ';
		 }
		 res += row + '\n';
	 }
	 return res;
}

bot.on('/query', (msg) => {
	var siz = timeStamps.length;
	var fileName = timeStamps[siz - 1] + '.json';
	var file = fs.readFileSync(path.join(dirPath, fileName),'utf-8');
	var res = parseJson(file);
	msg.reply.text('最近一次查询：\n' + timeStamps[siz - 1]);
	msg.reply.text(res);
});

bot.start();
getJson();	

