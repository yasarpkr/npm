 // Configure CSFB test tool and run it
    let command= "\
    printf 'IUCS_QUEUE = 3,5,28603000000,500,400,1,1,0506714110,0505671411205056714112050567141120505671411205056714112,servinglac,servingcor,25,50,1,1,2,3,4,5,6,tmsi,imeiimei,1,2,5,null,null,null,1\n'  > x_corr_offline.txt;\
    printf 'S1MME_QUEUE = 1,7,8,28603000000,558617,24794679,2063,87412245,286_03_1_4_c01c4c11,null,2,10.54.2.132,10.201.49.13,20\n' >> x_corr_offline.txt;\
    printf 'SGS_QUEUE = 2,6,28603000000,msc_ip ,mme_ip,1,1\n' >> x_corr_offline.txt"

    remoteFolder = '/argela/deploy/CSFB_TEST_TOOL/'
    let runTestTool = 'timeout 10s ./run.sh'
    await executeBashCommand(command,remoteFolder,sshChoice)
    await executeBashCommand(runTestTool,remoteFolder,sshChoice)
