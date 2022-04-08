     // Command-2 execute
     let commandforReadFile = `./madCliRunCommands.sh rf`
     let responseReadFile = await executeBashCommandNoLog(commandforReadFile,remoteShFolder); await wait(12000)
     let ReadFileResult = await findMatches(responseReadFile,'File read successfully')
     if(ReadFileResult){
         console.log (`[${now()}] `+`Pcap başarıyla okutulmuştur`)
     } else {
         throw new Error(`[${now()}] `+`Pcap read edilememiştir`)
     }
