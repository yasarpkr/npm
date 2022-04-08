    // Command-3 execute 
    let command_volteProbeVal = `./madCliRunCommands.sh sip_volteprobekval`
    let response_volteProbeVal = await executeBashCommandNoLog(command_volteProbeVal,remoteShFolder)
    let indexofArray = ['4,21','5,21']
    let failedLines = [];
    
    for(i=0; i<indexofArray.length ; i++){
        if(response_volteProbeVal.match(' '+indexofArray[i]+' (.*)=[0-9]+;')){
            console.log(response_volteProbeVal.match(' '+indexofArray[i]+' (.*)=[0-9]+;')[0])
        } else {
            failedLines.push(indexofArray[i])
            }
    }

    if (failedLines.length > 1){
        console.log(`[${now()}] Bulunamayan bazı linelar vardır: \n`)
        for(let i of failedLines) console.log(`- ${i}`)
    }
