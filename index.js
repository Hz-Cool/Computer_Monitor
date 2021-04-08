
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
         * 电流(curr)	小于	200000 [180mA(毫安)]
         * 功率(power)	小于	处于22500[23W(瓦)]
         * status   -1:异常 0正常
         * email    0:正常 1:已发送 2:已到最大发送次数
         */
        let current = { time: dateformat(), log: orayData, email: 0 };
        const { curr, power } = orayData;
        if (curr < 200000 || power < 22500) {
            current.status = -1;
        } else {
            current.status = 0;
        }
        //console.log("当前数据：", current)
        //请求Log
        request({ ...CloudConfig, method: 'GET', path: '/log.json' }, (logData) => {
            //逻辑判断
            let oldLen = logData.length;
            let data = logData.slice(oldLen - 100, oldLen);// 每次只保存100个
            let newLen = data.length;
            let sendList = data.slice(newLen - 3, newLen);// 发送队列 监测最后4个
            let repeatList = data.slice(newLen - 2, newLen);// 重复发送最大次数
            let isSend = sendList.every(d => d.status === -1); // 是否发送
            let isRepeat = repeatList.every(d => d.email === 1 || d.email === 2); // 是否重复发送
            if (isSend) {
                if (isRepeat) {
                    current.email = 2; // 已到最大发送次数
                } else {
                    current.email = 1; // 已发送
                    SendEmail(() => { });
                }
            }
            //写入对象储存
            data.push(current);
            requestPut({ ...CloudConfig, method: 'PUT', path: '/log.json' }, data, () => { })
        });
    });
}
