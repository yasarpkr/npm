     // Upload pcaps 
     let pcapName = 'TC_SIP_VOLTE_1_1_2_2_UNSUCC_REGISTER'
     let remotePcapFolder = '/argela/deploy/MONITORING_GATEWAY/pcaps/SIP_VOLTE' 
     await uploadPcapFile(pcapName,remotePcapFolder,param.sshServerForBTKReports)
  
     // Upload ShFile
     let shFile = 'madCliRunCommands'
     let remoteShFolder = '/argela/deploy/MONITORING_GATEWAY/scripts/'
     await uploadShFile(shFile,remoteShFolder,param.sshServerForBTKReports)
