    // Start redis monitoring
    let commandRedis_3001 = "kill -9 $(ps -ef | grep 'redis-cli -p 30001 monitor'| grep -v grep | awk '{print $2}') 2>/dev/null ; sleep 1 ; redis-cli -p 30001 monitor > redis_30001.txt &"
    let remoteLogFolder = '/argela/deploy/MONITORING_GATEWAY/scripts/logs'
    await executeBashCommand(commandRedis_3001,remoteLogFolder,param.sshServerForBTKReportsBSSAP)
