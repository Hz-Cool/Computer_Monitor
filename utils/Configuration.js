//腾讯云请求参数
const CloudConfig = {
    hostname: 'test-XXXX.cos.ap-nanjing.myqcloud.com',
    port: 443,
    headers: {
        'Authorization': 'XXXX',
        'Content-Type': 'application/json',
    }
}
//向日葵
const OrayConfig = {
    hostname: 'sl-api.oray.com',
    path: '/smartplugs/XXXX/electric-online',
    port: 443,
    headers: {
        'Content-Type': 'application/json',
    }
}
//邮件配置
const EmailConfig = {
    user: 'XXXX@139.com',
    password: 'XXXX',
    host: 'smtp.139.com',
    ssl: true,
}
//发送内容
const EmailMessageConfig = {
    from: 'XXXX@139.com',
    to: 'XXXX@139.com',
}

module.exports = {
    CloudConfig,
    OrayConfig,
    EmailConfig,
    EmailMessageConfig,
};

