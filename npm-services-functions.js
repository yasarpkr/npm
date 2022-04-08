ns.uploadFiles_runSh =async (pcapname,pcap,shFile='telnetBashScript') => {

    let remote_shFolder= '/argela/deploy/MONITORING_GATEWAY/scripts/';
    let chmodComand= 'chmod +x '+remote_shFolder+shFile+'.sh'
    let command=`ln -sf pcaps/${pcap}/${pcapname}.pcap offline.pcap ; ls -ltr | grep *offline* `;
    let telnet_run = `./`+shFile+`.sh`;
    let ssh_ = new node_ssh();
    let shData = "";

    let sshConfig = {
        host: param.sshServerForBTKReports[0],
        user: param.sshServerForBTKReports[1],
        password: param.sshServerForBTKReports[2]
    };

    let uploadPcapFileList = [];
    uploadPcapFileList.push({local:config.filePath+'pcaps'+config.folderSlash+pcapname+'.pcap', remote: '/argela/deploy/MONITORING_GATEWAY/pcaps/'+pcap+'/'+pcapname+'.pcap'});

    let uploadShFileList = [];
    uploadShFileList.push({local:config.filePath+'sh'+config.folderSlash+shFile+'.sh', remote: remote_shFolder+shFile+'.sh'});


    await ssh_.connect( sshConfig )
        .then( async ()=> {
            console.log(`\n[${now()}] Uploading `+pcapname+'.pcap to ' + sshConfig.host)
            await ssh_.putFiles(uploadPcapFileList).then(() => {
                console.log(`[${now()}] Upload Success`)
            }, (error) => {
                console.log(`[${now()}] Upload Failed`)
                console.log(error)
                ssh_.dispose();
                throw new Error(error);
            });await wait(5000);
        })
        .then( async ()=> {
            console.log(`\n[${now()}] Uploading `+shFile+'.sh to '+ sshConfig.host)
            await ssh_.putFiles(uploadShFileList).then(() => {
                console.log(`[${now()}] Upload Success`)
                ssh_.execCommand(chmodComand)
                console.log(`[${now()}] `+chmodComand)
            }, (error) => {
                console.log(`[${now()}] Upload Failed`)
                console.log(error)
                ssh_.dispose();
                throw new Error(error);
            });await wait(5000);
        })
        .then(async() => {
            console.log(`\n[${now()}] [Command: ${command}] [Host: ${sshConfig.host}]`)
            await ssh_.execCommand(command, {cwd:'/argela/deploy/MONITORING_GATEWAY'}).then(function(result) {
                console.log(result.stdout)
                console.log(result.stderr)
                if (result.stderr) {
                    throw new Error(result.stderr)
                }
            });
        })
        .then(async() => {
            console.log(`\n[${now()}] [Command: ${telnet_run}] [Host: ${sshConfig.host}]`)
            await ssh_.execCommand(telnet_run, {cwd:remote_shFolder}).then(function(result) {
                console.log(result.stdout)
                shData = result.stdout
                if (result.stderr) {
                    throw new Error(result.stderr)
                }
                return shData
            });await wait(10000);
        })
        .then(_ => { ssh_.dispose(); }).catch(_ => {
            console.log(_)
            ssh_.dispose();
            throw new Error(_);
        });

    await wait(1000);

}
ns.uploadShFile =async (localFile,remoteFolder,dbConnectionParameters = param.sshServerForBTKReports) => {

    let ssh_ = new node_ssh();
    let chmodComand= 'chmod +x '+remoteFolder+localFile+'.sh'

    let sshConfig = {
        host: dbConnectionParameters[0],
        user: dbConnectionParameters[1],
        password: dbConnectionParameters[2]
        };

    let uploadShFileList = [];
    uploadShFileList.push({local:config.filePath+'sh'+config.folderSlash+localFile+'.sh', remote: remoteFolder+localFile+'.sh'});

    await ssh_.connect( sshConfig )
        .then( async ()=> {
            console.log(`\n[${now()}] Uploading `+localFile+'.sh to '+ sshConfig.host + ':' + remoteFolder)
            await ssh_.putFiles(uploadShFileList).then(() => {
                console.log(`[${now()}] Upload Success`) 
                ssh_.execCommand(chmodComand)
                console.log(`[${now()}] `+chmodComand)
            }, (error) => {
                console.log(`[${now()}] Upload Failed`)
                console.log(error)
                ssh_.dispose();
                throw new Error(error);
            });await wait(5000);
        })
        .then(_ => { ssh_.dispose(); }).catch(_ => {
            console.log(_)
            ssh_.dispose();
            throw new Error(_);
        });
}
ns.runShFile =async (shFile,remoteFoler, dbConnectionParameters = param.sshServerForBTKReports) => {

    // Predefinitions
    let telnet_run = `./`+shFile+`.sh`;
    let ssh_ = new node_ssh();
    let data = "";

    // Ssh parameters
    let sshConfig = {
    host: dbConnectionParameters[0],
    user: dbConnectionParameters[1],
    password: dbConnectionParameters[2]
    };

await ssh_.connect( sshConfig )

.then(async() => {
    console.log(`\n[${now()}] [Command: ${telnet_run}] [Host: ${sshConfig.host}]`)
    await ssh_.execCommand(telnet_run, {cwd:remoteFoler})
        .then(function(result) {
            //console.log(result.stdout)
        if (result.stderr) {
            throw new Error(result.stderr)
        }
        data = result.stdout;
        return data
    });await wait(10000);
})

.then(_ => { ssh_.dispose(); }).catch(_ => {
    console.log(_)
    ssh_.dispose();
    throw new Error(_);
});

return data;

}
ns.findMatches =async (text,pattern) => {
    let returnData;
    let matchingLines = [];
    let allLines = text.split("\n");

    for (let i = 0; i < allLines.length; i++) {
        if (allLines[i].includes(pattern)) {
            matchingLines.push(allLines[i]);
        }
    }
    returnData = matchingLines[0]
    await wait(1000); // satır sayısı artarsa, for bitmeden return etmesin diye wait(1000) yapıldı.
    return returnData;
}
ns.executeBashCommand =async (command,remoteFolder,dbConnectionParameters = param.sshServerForBTKReports) => {

    // Predefinitions
    let ssh_ = new node_ssh();
    let data = "";

    // Ssh parameters
    let sshConfig = {
    host: dbConnectionParameters[0],
    user: dbConnectionParameters[1],
    password: dbConnectionParameters[2]
    };

await ssh_.connect( sshConfig )

.then(async() => {
    console.log(`\n[${now()}] [Command: ${command}] [Host: ${sshConfig.host}]`)
    await ssh_.execCommand(command, {cwd:remoteFolder})
        .then(function(result) {
        console.log(result.stdout)
        if (result.stderr && !result.stderr.includes('log4j2')) {
            throw new Error(result.stderr)
        }
        data = result.stdout;
        return data
    });await wait(10000);
})

.then(_ => { ssh_.dispose(); }).catch(_ => {
    console.log(_)
    ssh_.dispose();
    throw new Error(_);
});

return data;

}

ns.executeBashCommandNoLog =async (command,remoteFoler,dbConnectionParameters = param.sshServerForBTKReports) => {

    // Predefinitions
    let ssh_ = new node_ssh();
    let data = "";

    // Ssh parameters
    let sshConfig = {
    host: dbConnectionParameters[0],
    user: dbConnectionParameters[1],
    password: dbConnectionParameters[2]
    };

await ssh_.connect( sshConfig )

.then(async() => {
    console.log(`\n[${now()}] [Command: ${command}] [Host: ${sshConfig.host}]`)
    await ssh_.execCommand(command, {cwd:remoteFoler})
        .then(function(result) {
        if (result.stderr && !result.stderr.includes('log4j2')) {
            throw new Error(result.stderr)
        }
        data = result.stdout;
    });await wait(10000);
})

.then(_ => { ssh_.dispose(); }).catch(_ => {
    console.log(_)
    ssh_.dispose();
    throw new Error(_);
});

return data;

}

ns.uploadPcapFile =async (pcapname,remoteFolder,shConnectionParameters = param.sshServerForBTKReports) => {

    let ssh_ = new node_ssh();

    let sshConfig = {
        host: param.sshServerForBTKReports[0],
        user: param.sshServerForBTKReports[1],
        password: param.sshServerForBTKReports[2]
    };

    let uploadPcapFileList = [];
    uploadPcapFileList.push({local:config.filePath+'pcaps'+config.folderSlash+pcapname+'.pcap', remote: remoteFolder +pcapname+'.pcap'});

    await ssh_.connect( sshConfig )
        .then( async ()=> {
            console.log(`\n[${now()}] Uploading `+pcapname+'.pcap to ' + sshConfig.host + ':' + remoteFolder)
            await ssh_.putFiles(uploadPcapFileList).then(() => {
                console.log(`[${now()}] Upload Success`)
            }, (error) => {
                console.log(`[${now()}] Upload Failed`)
                console.log(error)
                ssh_.dispose();
                throw new Error(error);
            });await wait(5000);
        })
        .then(_ => { ssh_.dispose(); }).catch(_ => {
            console.log(_)
            ssh_.dispose();
            throw new Error(_);
        });

    await wait(1000);

}

ns.findLastXdr =async (reportfilepath) => {

    let ssh_ = new node_ssh();
    let btk_report_data = "";

    let sshConfig = {
        host: param.sshServerForBTKReports[0],
        user: param.sshServerForBTKReports[1],
        password: param.sshServerForBTKReports[2]
    };

    await ssh_.connect( sshConfig )
        .then(async() => {
            console.log(`\n[${now()}] [Command: find ./ -size +0 -type f -exec ls -lt {} + | awk 'NR==1{print $9}' | xargs tail -1] [Host: ${sshConfig.host}]`)
            await ssh_.execCommand(`find ./ -size +0 -type f -exec ls -lt {} + | awk 'NR==1{print $9}' | xargs tail -1`, {cwd:'/argela/xdr/'+reportfilepath}).then(function(result) {
                console.log(result.stderr)
                if (result.stderr) {
                    throw new Error(result.stderr)
                }
                btk_report_data = result.stdout;
            });
        })
        .then(_ => { ssh_.dispose(); }).catch(_ => {
            console.log(_)
            ssh_.dispose();
            throw new Error(_);
        });

    await wait(1000);
    console.log(`\n[${now()}] - Generated Report:\n--------------------------------------------------------------`);
    console.log(btk_report_data)
    console.log('--------------------------------------------------------------\n')
    return btk_report_data;
}

ns.entityUp =async (entityName,remoteServer=param.sshServerForBTKReportsBSSAP,madCliScript='madCliRunCommands',remoteFolder='/argela/deploy/MONITORING_GATEWAY/scripts') => {

    // Define all indexes here
    let entityIndexNumber = [] 
    entityIndexNumber['MAP_PROBE'] = '232' 
    // ....... List must goes down with new entities

    // Execute shenstat with madCliScript
    let command = `./${madCliScript}.sh shenstat`
    let shenResultData = await ns.executeBashCommandNoLog(command,remoteFolder,remoteServer)
    console.log(shenResultData)

    // Entity Up if it is down
    let lineofEntity = await ns.findMatches(shenResultData,entityName)
    console.log(lineofEntity)

    if (lineofEntity.includes('ENTITY_DOWN')) {
        console.log (`[${now()}] ${entityName} entitysi ENTITY_DOWN durumdadır.`)
        let command = `./${madCliScript}.sh 'startent ${entityIndexNumber[entityName]}' `
        let dataForMatches = await ns.executeBashCommandNoLog(command,remoteFolder,remoteServer);await wait(5000)
        let lineofEntity = await ns.findMatches(dataForMatches,entityName)
        if(lineofEntity.includes('created')){
            console.log (`[${now()}] ${entityName} entitysi hazır hale getirildi.`)
        } else {
            throw new Error (`[${now()}] ${entityName} entitysi teste hazır hale getirilememiştir. Sunucu üzerinden kontrol ediniz`)
            }
    }
}
