
const {
    SendEmail,
    request,
    requestPut,
    dateformat,
} = require('./utils/Tools');
const {
    CloudConfig,
    OrayConfig,
} = require('./utils/Configuration');

exports.main_handler = async (event, context) => {
    main()
    return event;
};
function main() {
    //向日葵请求
    request(OrayConfig, (orayData) => {
        //console.log("向日葵接口：", orayData)
        /**
         * 电流(curr)	小于	175000 [175mA(毫安)]
         * 功率(power)	小于	处于22000[22W(瓦)]
         * status   -1:异常 0正常
         * email    0:无需发送 1:已发送 2:已到最大发送次数
         */
        let current = { time: dateformat(), status: null, email: null, message: null, log: orayData };
        let message = '';
        const { curr, power } = orayData;
        if (curr < 175000 || power < 22000) {
            current.status = -1;
            message += '当前状态[异常] ';
        } else {
            current.status = 0;
            message += '当前状态[正常] ';
        }
        //请求Log
        request({ ...CloudConfig, method: 'GET', path: '/log.json' }, (logData) => {
            //新Log
            let oldLen = logData.length;
            let data = logData.slice(oldLen - 59, oldLen);// 4个小时60个Log  60*4/4
            //
            let newLen = data.length;
            let sendList = data.slice(newLen - 3, newLen);// 发送队列 最后4个
            let isSend = sendList.every(d => d.status === -1); // 4个-1发送一次
            let repeatList = data.slice(newLen - 2, newLen);// 检测发送状态
            let isRepeat = repeatList.every(d => d.email === 1 || d.email === 2); // 是否已经达到最大次数(2次)

            if (isSend && current.status === -1) {
                message += '可以发送 ';
                if (isRepeat) {
                    current.email = 2; // 已到最大发送次数
                    message += '已过最大发送次数 End';
                } else {
                    current.email = 1; // 已发送
                    message += '已发送 End';
                    SendEmail(() => { });
                }
            } else {
                message += '无需发送 End';
            }
            data.push({ ...current, message });
            //写入对象储存
            requestPut({ ...CloudConfig, method: 'PUT', path: '/log.json' }, data, () => { })
        });
    });
}
