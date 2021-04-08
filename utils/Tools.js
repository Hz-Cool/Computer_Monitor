
var email = require("emailjs");
const https = require('https');
var moment = require('moment-timezone');
moment.tz.setDefault("Asia/Shanghai");
const {
    EmailConfig,
    EmailMessageConfig
} = require('./Configuration');

/**
 * 发送邮件
 */
function SendEmail(callback) {
    const client = new email.SMTPClient(EmailConfig);
    client.send(
        {
            text: `${dateformat('HH:mm:ss')}`,
            subject: '游戏掉线啦_Node',
            ...EmailMessageConfig,
        },
        (err, message) => {
            console.log(err || message);
            if (callback) callback();
        }
    );
}
SendEmail()

/**
 * 请求
 * @param {*} options 
 * @param {*} callback 
 */
function request(options, callback) {
    const req = https.request(options, (res) => {
        //console.log(`状态码: ${res.statusCode}`);
        res.setEncoding("utf-8");
        var responseString = "";
        res.on("data", function (data) {
            responseString += data;
        });
        res.on("end", function () {
            //console.log("🚀 ~ responseString", responseString)
            try {
                var resultObject = JSON.parse(responseString);
                if (callback) callback(resultObject)
            } catch (error) {
                console.log("🚀 ~ error", error)
            }
        });
    });

    req.on("error", (error) => {
        console.error(error);
    });

    req.end();
}


/**
 * 存储
 * @param {*} options 
 * @param {*} data 
 * @param {*} callback 
 */
function requestPut(options, data, callback) {
    const req = https.request(options, res => {
        //console.log(`状态码: ${res.statusCode}`)
        res.on("end", function () {
            callback();
        });
    })

    req.on('error', error => {
        console.error(error)
    })

    const temp = JSON.stringify(data);

    req.write(temp)
    req.end()
}


/**
 * 格式时间
 * @param {*} fmt 
 * @param {*} date 
 * @returns 
 */
function dateformat(fmt = 'YYYY-MM-DD HH:mm:ss', date = new Date()) {
    return moment().format(fmt)
}

module.exports = {
    SendEmail,
    request,
    requestPut,
    dateformat
};

