    // Execute command SETEX control 21.95
    let command_setex95_3005= `\
    printf '"SETEX" "286286286286286" "20000" "123456789123456"' > temp.redisCmds; \
    redis-cli -p 30005 < temp.redisCmds \
    `
    commandResultData_setex95_3005 = await executeBashCommandNoLog(command_setex95_3005,remoteFolder,param.sshServerForBTKReports)
    if(commandResultData_setex95_3005.includes('OK')){
        console.log(`\n[${now()}] Redis komutları başarıyla run edilmiştir`)
    } else {
        throw new Error(`\n[${now()}] Komut çalıştırılırken hata alındı \n' + ${commandResultData_setex95_3005}`)
    }

    // with FlushDb
    let command_setex94= `\
    printf 'FLUSHDB\\n"SETEX" "\\\\x00\\\\x00\\\\x00\\\\xd2\\\\xd1]\\\\xb9\\\\x89" "20000" "\\\\x00\\\\x01\\\\x04\`8e\\\\xed\\\\xce"' > temp.redisCmds; \
    redis-cli -p 30001 < temp.redisCmds \
    `
    commandResultData_setex94 = await executeBashCommandNoLog(command_setex94,remoteFolder,param.sshServerForMadCli)
    if(commandResultData_setex94.includes('OK\nOK')){
        console.log(`\n[${now()}] Redis komutları başarıyla run edilmiştir`)
    } else {
        throw new Error(`\n[${now()}] Komut çalıştırılırken hata alındı \n' + ${commandResultData_setex94}`)
    }
