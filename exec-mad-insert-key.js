    // Execute command, Key insert , sshServerForBTKReportsBSSAP, Count: 1
    let command = `./${localFile}.sh 'map-cache-opr msisdn insert key=905455712649 value=286286286286286'`
    let commandResultData = await executeBashCommandNoLog(command,remoteFolder,param.sshServerForBTKReportsBSSAP); await wait(7000)
    if(commandResultData.includes('Operation succeded')){
        console.log(`\n[${now()}] Key başarıyla insert edilmiştir`)
    } else {
        throw new Error(`\n[${now()}] Komut hata almıştır:\n ${commandResultData}`)
    }
