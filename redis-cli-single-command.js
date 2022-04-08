    // Redis cli (delete keys in 94)
    let remoteFolder = '/argela/deploy/MONITORING_GATEWAY/scripts/';
    let commandDelete = 'redis-cli -p 30001 FLUSHDB'
    console.log(`[${now()}] `+'Var olan keyler siniliyor  .......')
    dataResult = await executeBashCommandNoLog(commandDelete,remoteFolder,param.sshServerForMadCli)

    if (dataResult.includes('OK')) {
        console.log(`[${now()}] `+'Test öncesi keyler başarıyla silinmiştir\n')
    } else {
        throw new Error (`[${now()}] `+'Cache silmede hata meydana gelmiştir. Kontrol ediniz' )
    }
