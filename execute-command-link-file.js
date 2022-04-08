     // Command-1 execute
     let commandforLink = `ln -sf ${remotePcapFolder}/${pcapName}.pcap offline.pcap ; ls -ltr | grep -i offline`    
     let remoteCommandFolder = '/argela/deploy/MONITORING_GATEWAY/'
     await executeBashCommand(commandforLink,remoteCommandFolder)
