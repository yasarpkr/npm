    // Execute command SETEX control
    let commandGrep= `\
    kill -9 $(ps -ef | grep 'redis-cli -p 30001 monitor' | grep -v grep | awk '{print $2}')  2>/dev/null; \
    sleep 1; \
    grep '"SETEX" "\\\\x00\\\\x00\\\\x00\\\\xd2\\\\xd1]\\\\xb9\\\\x89" "20000" "\\\\x00\\\\x01\\\\x04\`8e\\\\xed\\\\xce"' redis_30001.txt | wc -l  \
    `
    resultData = await executeBashCommandNoLog(commandGrep,remoteLogFolder,param.sshServerForBTKReportsBSSAP)
    resultData=resultData.split('\n')
    let countOfGrep = parseInt(resultData[0])
    if(countOfGrep > 0){
        console.log(`\n[${now()}] Monitor içeriğinde istenilen setting ${countOfGrep} lineda görüldü`)
    } else {
        throw new Error(`\n[${now()}] Monitor içeriğinde istenilen SETEX değeri görülememiştir`)
    }
