    // Command-3 execute 
    let command_voltekVal = `./madCliRunCommands.sh sip_voltekval`
    let response_voltekVal = await executeBashCommandNoLog(command_voltekVal,remoteShFolder)
    let indexofArray_voltekVal = ['112,55','30,55','6,55','60,55','56,55','110,55','32,55','28,55','20,55','16,55','12,55','8,55','66,55','62,55']
    failedLines_ = [];   
    for(i=0; i<indexofArray_voltekVal.length ; i++){
        if(response_voltekVal.match(' '+indexofArray_voltekVal[i]+' (.*)=[0-9]+;')){
            console.log(response_voltekVal.match(' '+indexofArray_voltekVal[i]+' (.*)=[0-9]+;')[0])
        } else {
            failedLines_.push(indexofArray_voltekVal[i])
            }
    }
    if (failedLines_.length > 0){
        console.log(`[${now()}] Bulunamayan bazı linelar vardır: \n`)
        for(let i of failedLines_) console.log(`- ${i}`)
    }
