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
