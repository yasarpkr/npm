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
    

     
    // Redis cli (role control)    
    let remoteFolder = '/argela/deploy/MONITORING_GATEWAY/scripts/';
    let commandRole = 'redis-cli -p 45000 ROLE'
    console.log(`[${now()}] `+'Role kontrol ediliyor  .......')
    dataResultRole = await executeBashCommandNoLog(commandRole,remoteFolder,param.sshServerForBTKReports)

    if (dataResultRole.includes('master')) {
        console.log(`[${now()}] `+'Redis kontrol: Role master [PASS]')
    } else {
        throw new Error (`[${now()}] `+'Redis kontrol: Role master [FAIL]' )
    }

    // Redis cli (delete keys)    
    let commandDelete = 'redis-cli -p 45000 FLUSHDB'
    console.log(`[${now()}] `+'Keyler delete ediliyor  .......')
    dataResultDelete = await executeBashCommandNoLog(commandDelete,remoteFolder,param.sshServerForBTKReports)
    console.log(dataResultDelete)

    if (dataResultDelete.includes('OK')) {
        console.log(`[${now()}] `+'Delete key kontrol: [PASS]')
    } else {
        throw new Error (`[${now()}] `+'Delete key kontrol:  [FAIL]' )
    }
    
    // Redis cli (delete keys)    
    let commandKeys = `redis-cli -p 45000 KEYS \\*`
    console.log(`[${now()}] `+'Keyler listeleniyor  .......')
    let dataResultKeys = await executeBashCommandNoLog(commandKeys,remoteFolder,param.sshServerForBTKReports)
    console.log(dataResultKeys)

    if (dataResultKeys == 'logout') {
        console.log(`[${now()}] `+'Key list kontrol: [PASS]')
    } else {
        throw new Error (`[${now()}] `+'Key list kontrol: [FAIL]' )
    }
