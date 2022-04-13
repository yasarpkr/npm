// IMPORTS
const config = require('./config');
const {Builder, By, Key, until, webdriver,WebDriver} = require('selenium-webdriver');
const _http = require('selenium-webdriver/http');
const sql = require('mssql');
const dateTime = require('node-datetime');
const random = require('random');
const {getText,pgExec,log,select,find,click,sendKeys,wait,now,execQuery,sendPostRequest,sendPostRequestSlient} = require('./sente');
const node_ssh = require('node-ssh');
const fs = require('fs');
const readline = require('readline');
const os = require('os');
const lang = require('./i118');
const { t } = require('tar');
const { rejects } = require('assert');
const { count } = require('console');



// _____________________________________________________________________________________________________________________
// VARIABLES DEFINATIONS
let ns = {};
let ssh = new node_ssh();

// _____________________________________________________________________________________________________________________
// FUNCTION DEFINATIONS

ns.testParameters = () => {
    if(param.sshServer) param.sshServer = param.sshServer.split(';');
    if(param.sshServerForBTKReports) param.sshServerForBTKReports = param.sshServerForBTKReports.split(';');
    if(param.sshServerForBTKReportsBSSAP) param.sshServerForBTKReportsBSSAP = param.sshServerForBTKReportsBSSAP.split(';');
    if(param.aveaConfDbConfig) param.aveaConfDbConfig=param.aveaConfDbConfig.split(';');
    if(param.cdr_DbConfig) param.cdr_DbConfig=param.cdr_DbConfig.split(';');
    if(param.avea_lte_cdr_DbConfig) param.avea_lte_cdr_DbConfig=param.avea_lte_cdr_DbConfig.split(';');
    if(param.avea_ui_conf_db) param.avea_ui_conf_db=param.avea_ui_conf_db.split(';');
    if(param.sshServerForMadCli) param.sshServerForMadCli=param.sshServerForMadCli.split(';');



};
ns.login = async (loginInfo={})=>{


    if(!loginInfo.userInfo) loginInfo.userInfo = param.user;
    if(!loginInfo.url) loginInfo.url = param.dmuUrl;
    if(!loginInfo.language){
        if(param.language)   loginInfo.language = param.language;
        else loginInfo.language ='en';
    }
    if(!loginInfo.applicationName) loginInfo.applicationName = 'OTAK DMU';

    let username = loginInfo.userInfo[0];
    let password = loginInfo.userInfo[1];


    console.log('______________________________________________');
    console.log(`Trying to login to the ${loginInfo.applicationName} \n`);
    await param.drv.get(loginInfo.url); await wait(5000); await ns.waitIfBlockUI();

    await find(`//input[@name='email']`,'xpath',30000);await wait(5000);
    if(loginInfo.language !=='en') {
        await click(`//div[@class='lang-selector']//button[@data-toggle='dropdown']`);
        await click(`//div[@class='lang-selector']//span[@lang='${loginInfo.language}']`);        
    }

    await sendKeys(`//input[@name='email']`,[username]);
    await sendKeys(`//input[@name='password']`,[password,Key.RETURN]);await(5000);


    await param.drv.wait(until.elementLocated(By.xpath(`//li[@id='m_quicksearch']`)),10000);

    console.log(`\nLogin to the ${loginInfo.applicationName}  is successful`);
    console.log('______________________________________________');

    await wait(5000);
    return true;

};
ns.waitIfBlockUI=  ()=> {

    let overlayStatus=0;

    return new Promise(async resolve => {
        do{
            try {
                let modal = await param.drv.wait(until.elementLocated(By.xpath(`//div[@class='m-page-loader m-page-loader--base m-page-loader--non-block']`)),10000);
                let display = await modal.getCssValue('display');
                if(display==='block') {
                    console.log('Wait until display unlock');
                    await wait(1000);
                    overlayStatus++;
                } else {
                    overlayStatus = 2000;
                    break;
                }

            }
            catch (e) { overlayStatus = 121; }
        } while(overlayStatus<120)

        resolve();

    })


}
ns.waitTableLoading=  ()=> {

    let loadingCounter=0;

    return new Promise(async resolve => {
        do{
            try {
                await find(`//p-table//div[@class='p-datatable-loading-overlay p-component-overlay ng-star-inserted']`,5000);
                loadingCounter++;
                console.log('Wait until the table is loaded')
                await wait(5000);
                
            }
            catch (e) { 
                loadingCounter = 25; 
                }
        } while(loadingCounter<25)

        resolve();

    })


}

ns.lang = (keyword,language=param.language) => {
    if(!language && !param.language) language='en';
    return lang[keyword][language];
}
ns.multiSelect =async (target_id,option=[],clickAfterSelection=true) => {
    await click.id(target_id);await wait(2000);
    await click(`//li[@aria-label='${option}']`)
    if(clickAfterSelection===true) await click.id(target_id);
}
ns.singleSelect =async (pdropdownId, value) => {
    await click(`//p-dropdown[@id='${pdropdownId}']/div`);
    await click(`//*[contains(text(),'${value}')]`);
}
ns.searchTextInAllPages=  (text)=> {

    let newPage=false;
    

    return new Promise(async (resolve,reject) => {
        
        do{
            try {
                newPage=false
                await find.text(text,5000);
                resolve();
            }
            catch (e) { 

                await find.xpath(`//p-paginator//button[contains(@class,'p-paginator-next') and contains(@class,'p-disabled')]`,5000)
                .then(_=>{newPage=false}).catch(e=>{newPage=true});
            
                if(newPage===false) reject(`${text} not found!`)
                else {
                    console.log('Go to next page');
                    await click(`//p-paginator//button[contains(@class,'p-paginator-next')]`);
                   
                }
            }
        } while(newPage===true)

        

    })


}
ns.logout = async ()=>{   

    await click(`//*[@class="m-topbar__userpic"]`);
    await click.text('Çıkış Yap');
    await click.text('Evet'); await wait(5000);

    return true

};

ns.btkreport =async (pcapname,pcap, reportfilepath,shFile='telnetBashScript') => {

    let remote_shFolder= '/argela/deploy/MONITORING_GATEWAY/scripts/';
    let chmodComand= 'chmod +x '+remote_shFolder+shFile+'.sh'
    let command=`ln -sf pcaps/${pcap}/${pcapname}.pcap offline.pcap | ls -ltr`;
    let telnet_run = `./`+shFile+`.sh`;
    let ssh_ = new node_ssh();
    let btk_report_data = "";

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
                console.log(result.stderr)
                if (result.stderr) {
                    throw new Error(result.stderr)
                }
            });await wait(10000);
        })
        .then(async() => {
            console.log(`\n[${now()}] [Command: find ./ -size +0 -type f -exec ls -lt {} + | awk 'NR==1{print $9}' | xargs less] [Host: ${sshConfig.host}]`)
            await ssh_.execCommand(`find ./ -size +0 -type f -exec ls -lt {} + | awk 'NR==1{print $9}' | xargs less`, {cwd:'/argela/xdr/'+reportfilepath}).then(function(result) {
                console.log(result.stdout)
                console.log(result.stderr)
                if (result.stderr) {
                    throw new Error(result.stderr)
                }

                btk_report_data = result.stdout;
                console.log(btk_report_data);
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
ns.btkreportBSSAP =async (pcapname,pcaptype, reportfilepath,shFile='telnetBashScriptBssap.sh') => {

    let command=`ln -sf pcaps/${pcapname}.pcap offline.pcap | ls -ltr`;
    let telnet_run = `./`+shFile;
    let ssh_ = new node_ssh();
    let btk_report_data = "";

    let sshConfig = {
        host: param.sshServerForBTKReportsBSSAP[0],
        user: param.sshServerForBTKReportsBSSAP[1],
        password: param.sshServerForBTKReportsBSSAP[2]
    };

    let uploadPcapFileList = [];
    uploadPcapFileList.push({local:config.filePath+'pcaps'+config.folderSlash+pcapname+'.pcap', remote: '/argela/deploy/MONITORING_GATEWAY/pcaps/'+pcapname+'.pcap'});

    let uploadShFileList = [];
    uploadShFileList.push({local:config.filePath+'sh'+config.folderSlash+shFile, remote: '/argela/deploy/MONITORING_GATEWAY/scripts/'+shFile});


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
            console.log(`\n[${now()}] Uploading `+shFile+' to '+ sshConfig.host)
            await ssh_.putFiles(uploadShFileList).then(() => {
                console.log(`[${now()}] Upload Success`)
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
            await ssh_.execCommand(telnet_run, {cwd:'/argela/deploy/MONITORING_GATEWAY/scripts'}).then(function(result) {
                console.log(result.stdout)
                console.log(result.stderr)
                if (result.stderr) {
                    throw new Error(result.stderr)
                }
            });await wait(10000);
        })
        .then(async() => {
            console.log(`\n[${now()}] [Command: find ./ -size +0 -type f -exec ls -lt {} + | awk 'NR==1{print $9}' | xargs less] [Host: ${sshConfig.host}]`)
            // await ssh_.execCommand(`find ./ -size +0 -type f -name "AVEA_CC_${pcaptype}Cdr*" -exec ls -lt {} + | awk 'NR==1{print $9}' | xargs less`, {cwd:'/argela/xdr/'+reportfilepath}).then(function(result) {
            await ssh_.execCommand(`find ./ -size +0 -type f -name "${pcaptype}*" -exec ls -lt {} + | awk 'NR==1{print $9}' | xargs less`, {cwd:'/argela/xdr/'+reportfilepath}).then(function(result) {

                    console.log(result.stdout)
                console.log(result.stderr)
                if (result.stderr) {
                    throw new Error(result.stderr)
                }

                btk_report_data = result.stdout;
                console.log(btk_report_data);
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
ns.btkreportControl =async (reportfilepath) => {
    let ssh_ = new node_ssh();
    let btk_report_data = "";

    let sshConfig = {
        host: param.sshServerForBTKReports[0],
        user: param.sshServerForBTKReports[1],
        password: param.sshServerForBTKReports[2]
    };

    await ssh_.connect( sshConfig )
        .then(async() => {
            let command=`find ./ -size +0 -type f -exec ls -lt {} + | awk 'NR==1{print $9}' | xargs less`;
            console.log(`\n[${now()}] [Command: ${command}] [Host: ${sshConfig.host}]`)
            await ssh_.execCommand(command, {cwd:'/argela/xdr/'+reportfilepath}).then(function(result) {
                console.log(result.stdout)
                console.log(result.stderr)
                if (result.stderr) {
                    throw new Error(result.stderr)
                }
                btk_report_data = result.stdout;
                console.log(btk_report_data);
            });
        })
        .then(_ => { ssh_.dispose(); }).catch(_ => {
            ssh_.dispose();
            throw new Error(_);
        });

    await wait(1000);
    console.log(`\n[${now()}] - Generated Report:\n--------------------------------------------------------------`);
    console.log(btk_report_data)
    console.log('--------------------------------------------------------------\n')
    return btk_report_data;
}
ns.btkreportControl2 =async (reportfilepath) => {
    let ssh_ = new node_ssh();
    let btk_report_data = "";

    let sshConfig = {
        host: param.sshServerForBTKReports[0],
        user: param.sshServerForBTKReports[1],
        password: param.sshServerForBTKReports[2]
    };

    await ssh_.connect( sshConfig )
        .then(async() => {
            let command=`find ./ -size +0 -type f -exec ls -lt {} + | awk 'NR==2{print $9}' | xargs less`;
            console.log(`\n[${now()}] [Command: ${command}] [Host: ${sshConfig.host}]`)
            await ssh_.execCommand(command, {cwd:'/argela/xdr/'+reportfilepath}).then(function(result) {
                console.log(result.stdout)
                console.log(result.stderr)
                if (result.stderr) {
                    throw new Error(result.stderr)
                }
                btk_report_data = result.stdout;
                console.log(btk_report_data);
            });
        })
        .then(_ => { ssh_.dispose(); }).catch(_ => {
            ssh_.dispose();
            throw new Error(_);
        });

    await wait(1000);
    console.log(`\n[${now()}] - Generated Report:\n--------------------------------------------------------------`);
    console.log(btk_report_data)
    console.log('--------------------------------------------------------------\n')
    return btk_report_data;
}
ns.reportValidator = async (report,masterReport) => {
    console.log(`\nAranan BTK Raporu Satırı:\n${masterReport}`);
    console.log(`\nÜretilen BTK Raporu:\n${report}`)
    let isValidate=false;
    if (Array.isArray(masterReport))
    {
        for(let i of masterReport){
            if(report.indexOf(i)>-1) {
                isValidate=true;
                break;
            }
        }
    }
    else {
        if(report.indexOf(masterReport)>-1) isValidate=true;
    }

    await wait(1000);

    if(isValidate) console.log('\nBTK report validation success')
    else throw new Error(`\nBTK report validation failed!`);

}
ns.pcapReadBSSAP =async (pcapname, shFile='telnetBashScriptBssap.sh') => {

    let command=`ln -sf pcaps/${pcapname}.pcap offline.pcap | ls -ltr`;
    let telnet_run = `./`+shFile;
    let ssh_ = new node_ssh();

    let sshConfig = {
        host: param.sshServerForBTKReportsBSSAP[0],
        user: param.sshServerForBTKReportsBSSAP[1],
        password: param.sshServerForBTKReportsBSSAP[2]
    };

    let uploadPcapFileList = [];
    uploadPcapFileList.push({local:config.filePath+'pcaps'+config.folderSlash+pcapname+'.pcap', remote: '/argela/deploy/MONITORING_GATEWAY/pcaps/'+pcapname+'.pcap'});

    let uploadShFileList = [];
    uploadShFileList.push({local:config.filePath+'sh'+config.folderSlash+shFile, remote: '/argela/deploy/MONITORING_GATEWAY/scripts/'+shFile});


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
            console.log(`\n[${now()}] Uploading `+shFile+' to '+ sshConfig.host)
            await ssh_.putFiles(uploadShFileList).then(() => {
                console.log(`[${now()}] Upload Success`)
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
            await ssh_.execCommand(telnet_run, {cwd:'/argela/deploy/MONITORING_GATEWAY/scripts'}).then(function(result) {
                console.log(result.stdout)
                console.log(result.stderr)
                if (result.stderr) {
                    throw new Error(result.stderr)
                }
            });await wait(10000);
        }).then(_ => { ssh_.dispose(); }).catch(_ => {
            console.log(_)
            ssh_.dispose();
            throw new Error(_);
        });
    return true;
}
ns.pcapRead =async (pcapname, shFile='telnetBashScript.sh') => {

    let command=`ln -sf pcaps/${pcapname}.pcap offline.pcap | ls -ltr`;
    let telnet_run = `./`+shFile;
    let ssh_ = new node_ssh();

    let sshConfig = {
        host: param.sshServerForBTKReports[0],
        user: param.sshServerForBTKReports[1],
        password: param.sshServerForBTKReports[2]
    };

    let uploadPcapFileList = [];
    uploadPcapFileList.push({local:config.filePath+'pcaps'+config.folderSlash+pcapname+'.pcap', remote: '/argela/deploy/MONITORING_GATEWAY/pcaps/'+pcapname+'.pcap'});

    let uploadShFileList = [];
    uploadShFileList.push({local:config.filePath+'sh'+config.folderSlash+shFile, remote: '/argela/deploy/MONITORING_GATEWAY/scripts/'+shFile});


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
            console.log(`\n[${now()}] Uploading `+shFile+' to '+ sshConfig.host)
            await ssh_.putFiles(uploadShFileList).then(() => {
                console.log(`[${now()}] Upload Success`)
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
            await ssh_.execCommand(telnet_run, {cwd:'/argela/deploy/MONITORING_GATEWAY/scripts'}).then(function(result) {
                console.log(result.stdout)
                console.log(result.stderr)
                if (result.stderr) {
                    throw new Error(result.stderr)
                }
            });await wait(10000);
        }).then(_ => { ssh_.dispose(); }).catch(_ => {
            console.log(_)
            ssh_.dispose();
            throw new Error(_);
        });
    return true;
}
ns.pcapRead_diffPath =async (pcapname, pcap_path, shFile) => {

    let command=`ln -sf pcaps/${pcap_path}/${pcapname}.pcap offline.pcap | ls -ltr`;
    let telnet_run = `./`+shFile;
    let ssh_ = new node_ssh();

    let sshConfig = {
        host: param.sshServerForBTKReports[0],
        user: param.sshServerForBTKReports[1],
        password: param.sshServerForBTKReports[2]
    };

    let uploadPcapFileList = [];
    uploadPcapFileList.push({local:config.filePath+'pcaps'+config.folderSlash+pcapname+'.pcap', remote: '/argela/deploy/MONITORING_GATEWAY/pcaps/'+pcap_path +'/'+pcapname+'.pcap'});

    let uploadShFileList = [];
    uploadShFileList.push({local:config.filePath+'sh'+config.folderSlash+shFile, remote: '/argela/deploy/MONITORING_GATEWAY/scripts/'+shFile});


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
            console.log(`\n[${now()}] Uploading `+shFile+' to '+ sshConfig.host)
            await ssh_.putFiles(uploadShFileList).then(() => {
                console.log(`[${now()}] Upload Success`)
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
            await ssh_.execCommand(telnet_run, {cwd:'/argela/deploy/MONITORING_GATEWAY/scripts'}).then(function(result) {
                console.log(result.stdout)
                console.log(result.stderr)
                if (result.stderr) {
                    throw new Error(result.stderr)
                }
            });await wait(10000);
        }).then(_ => { ssh_.dispose(); }).catch(_ => {
            console.log(_)
            ssh_.dispose();
            throw new Error(_);
        });
    return true;
}
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

// ns.entityUp =async (entityName,remoteServer=param.sshServerForBTKReportsBSSAP,madCliScript='madCliRunCommands',remoteFolder='/argela/deploy/MONITORING_GATEWAY/scripts') => {

//     // Define all indexes here
//     let entityIndexNumber = [] 
//     entityIndexNumber['MAP_PROBE'] = '232'
//     entityIndexNumber['SGS_PROBE'] = '260'
//     // ....... List must goes down with new entities

//     // Execute shenstat with madCliScript
//     let command = `./${madCliScript}.sh shenstat`
//     let shenResultData = await ns.executeBashCommandNoLog(command,remoteFolder,remoteServer)
//     console.log(shenResultData)

//     // Entity Up if it is down
//     let lineofEntity = await ns.findMatches(shenResultData,entityName)
//     console.log(lineofEntity)

//     if (lineofEntity.includes('ENTITY_DOWN')) {
//         console.log (`[${now()}] ${entityName} entitysi ENTITY_DOWN durumdadır.`)
//         let command = `./${madCliScript}.sh 'startent ${entityIndexNumber[entityName]}' `
//         let dataForMatches = await ns.executeBashCommandNoLog(command,remoteFolder,remoteServer);await wait(5000)
//         let lineofEntity = await ns.findMatches(dataForMatches,entityName)
//         if(lineofEntity.includes('created')){
//             console.log (`[${now()}] ${entityName} entitysi hazır hale getirildi.`)
//         } else {
//             throw new Error (`[${now()}] ${entityName} entitysi teste hazır hale getirilememiştir. Sunucu üzerinden kontrol ediniz`)
//             }
//     }
// }

ns.entityUp =async (entityName,remoteServer=param.sshServerForBTKReportsBSSAP,madCliScript='madCliRunCommands',remoteFolder='/argela/deploy/MONITORING_GATEWAY/scripts') => {

    // Define all indexes here
    let entityIndexNumber = [] 
    entityIndexNumber['MAP_PROBE'] = '232'
    entityIndexNumber['SGS_PROBE'] = '260'
    entityIndexNumber['GTPC_PROBE'] = '246'
    // ....... List must goes down with new entities

    // Execute shenstat with madCliScript
    console.log (`[${now()}] ${entityName} ayakta değil ise çalışır duruma getirilecek...`)
    let command = `./${madCliScript}.sh shenstat`
    let shenResultData = await ns.executeBashCommandNoLog(command,remoteFolder,remoteServer)

    // Entity Up if it is down
    let lineofEntity = await ns.findMatches(shenResultData,entityName)
    console.log(lineofEntity)

    if (!lineofEntity.includes('ENTITY_OPERATIONAL')) {
        console.log (`[${now()}] ${entityName} entitysi ENTITY_DOWN durumdadır.`)
        let commandStop = `./${madCliScript}.sh 'stopent ${entityIndexNumber[entityName]}' `
        await ns.executeBashCommandNoLog(commandStop,remoteFolder,remoteServer);await wait(3000)
        let commandStart = `./${madCliScript}.sh 'startent ${entityIndexNumber[entityName]}' `
        let dataForMatches = await ns.executeBashCommandNoLog(commandStart,remoteFolder,remoteServer);await wait(5000)
        let lineofEntity = await ns.findMatches(dataForMatches,entityName)
        if(lineofEntity.includes('created')){
            console.log (`[${now()}] [${entityName}] entitysi başlatıldı. Operational state bekleniyor...`)
        } else {
            throw new Error (`[${now()}] ${entityName} entitysi bir sebepten dolayı start edilemedi. Sunucu üzerinden kontrol ediniz`)
            }
    }
    let i = 0
    let shenResultData_ = await ns.executeBashCommandNoLog(command,remoteFolder,remoteServer)
    let lineofEntity_= await ns.findMatches(shenResultData_,entityName)
    while (i<10 && !lineofEntity_.includes('ENTITY_OPERATIONAL')) {
    let shenResultData_ = await ns.executeBashCommandNoLog(command,remoteFolder,remoteServer)
    lineofEntity_ = await ns.findMatches(shenResultData_,entityName)
    i++
    console.log (`[${now()}] [Deneme:${i}] ${entityName} entitysi henüz aktif görünmemektedir...`)
    console.log (`[${now()}] ${lineofEntity_} `)
    await wait(5000)
    }

    if (lineofEntity_.includes('ENTITY_OPERATIONAL')){ 
    console.log (`[${now()}] ${entityName} entitysi OPERATIONAL durumdadır...\n`)
    console.log (`[${now()}] ${lineofEntity_} `)
    } else {
        throw new Error (`[${now()}] ${entityName} Hazır hale getirilemedi. Sistem adminden destek talep ediniz...\n`)
    }

}

ns.uploadPcapShReadFile =async (pcapName,remotePcapFolder='/argela/deploy/MONITORING_GATEWAY/pcaps/SIP_VOLTE',dbConnectionParameters=param.sshServerForBTKReports) => {

    
    // Upload pcaps 
    await ns.uploadPcapFile(pcapName,remotePcapFolder,dbConnectionParameters)
    
    // Upload ShFile
    let shFile = 'madCliRunCommands'
    let remoteShFolder = '/argela/deploy/MONITORING_GATEWAY/scripts/'
    await ns.uploadShFile(shFile,remoteShFolder,param.dbConnectionParameters)

    // Execute command for link pcap
    let commandforLink = `ln -sf ${remotePcapFolder}/${pcapName}.pcap offline.pcap ; ls -ltr | grep -i offline`    
    let remoteCommandFolder = '/argela/deploy/MONITORING_GATEWAY/'
    await ns.executeBashCommand(commandforLink,remoteCommandFolder)

    // Execute command for read file
    let commandforReadFile = `./madCliRunCommands.sh rf`
    let responseReadFile = await ns.executeBashCommandNoLog(commandforReadFile,remoteShFolder); await wait(12000)
    let readFileResult = await ns.findMatches(responseReadFile,'File read successfully')
    if(readFileResult){
        console.log (`[${now()}] `+`Pcap başarıyla okutulmuştur`)
    } else {
        throw new Error(`[${now()}] `+`Pcap read edilememiştir`)
    }

}

ns.queryXdrCount = async (selectQuery,dbConnPar=param.avea_lte_cdr_DbConfig) => {

    var countQuery = selectQuery.replace('SELECT *','SELECT COUNT(*) as COUNT')
    let data = await execQuery(countQuery,dbConnPar);
    let count = data[0].COUNT;
    console.log(`[${now()}] Db deki satır sayısı : ${count}`);
    return count

}

ns.queryXdrGetLast = async (selectQuery,dbConnPar=param.avea_lte_cdr_DbConfig) => {

    var findLastQuery = selectQuery+' ORDER BY xdr_insert_time DESC LIMIT 1'
    let data = await execQuery(findLastQuery,dbConnPar);
    let data_ = data[0];
    return data_
}

ns.xdrDbValidator = async (arrayRaw,masterArray,xdrArrayProps) => {

    let xdrArray = [];
    for(let i of arrayRaw){
        xdrArray.push(xdrArrayProps[i])
    }
    console.log('\n['+masterArray+']  <---- Beklenen değerler')
    console.log('['+xdrArray+']  <---- DB den alınan değerlerler')

    // Match arrays xdr arrays from db
    console.log('\n~~~~Db den alınan Sonuçlar~~~~\n')
    let serviceStatus = true
    for (i=0; i < masterArray.length ; i++) {
        if(xdrArray[i]==masterArray[i]){
            console.log(`[`+i+`]. OK`)
        } else {
            console.log(`[`+i+`]. FAIL`)
            serviceStatus = false   
        }
    }
    if (serviceStatus==false) throw new Error('Db den alınan değerler istenildiği gibi değildir')
}

ns.kpiValidatorPos = async (kpiSet,indexofArray,shConnectionParameters=param.sshServerForBTKReports,remoteShFolder='/argela/deploy/MONITORING_GATEWAY/scripts/') => {

    let command_volteProbeVal = `./madCliRunCommands.sh ${kpiSet}`
    let response_volteProbeVal = await ns.executeBashCommandNoLog(command_volteProbeVal,remoteShFolder,shConnectionParameters)
    failedLines_volteProbeVal= [];
    console.log(`[${now()}] .... Yandaki kpi dizisinin durumu kontrol ediliyor:  [${indexofArray}]`)
    console.log(`[${now()}] ---- Aşağıdaki kpi lar görüntülenmiştir :\n`)
    for(i=0; i<indexofArray.length ; i++){
        if(response_volteProbeVal.match(' '+indexofArray[i]+' (.*)=[0-9]+;')){
            console.log(response_volteProbeVal.match(' '+indexofArray[i]+' (.*)=[0-9]+;')[0])
        } else {
            failedLines_volteProbeVal.push(indexofArray[i])
            }
    }
    if (failedLines_volteProbeVal.length > 0){
        console.log(`[${now()}] ---- Bulunamayan bazı kpilar vardır :\n`)
        for(let i of failedLines_volteProbeVal) console.log(`- ${i}`)
    }

    
}

ns.kpiValueArrayDone = async (kpiSet,indexofArray,shConnectionParameters=param.sshServerForBTKReports,remoteShFolder='/argela/deploy/MONITORING_GATEWAY/scripts/') => {

    doneKpiValues = [];
    let controlStatus = true;
    let exitCount = 0;
    let command = `./madCliRunCommands.sh ${kpiSet}`
    while(controlStatus == true && exitCount < 4){
        failedLines= [];
        let response = await ns.executeBashCommandNoLog(command,remoteShFolder,shConnectionParameters)
        console.log(`[${now()}] Kpi dizisinin durumu kontrol ediliyor:  [${indexofArray}]`)
        for(i=0; i<indexofArray.length ; i++){
            if(response.match(' '+indexofArray[i]+' .*=([0-9])+;')){
                doneKpiValues[indexofArray[i]] = parseInt(response.match(' '+indexofArray[i]+' .*=([0-9]+);')[1])
            } else {
                failedLines.push(indexofArray[i])
                }
        }
        if (failedLines.length > 0){
            console.log(`[${now()}] Test sonrasında oluşmayan bazı kpilar vardır :`)
            for(let i of failedLines) console.log(`- ${i}`) 
            await wait(10000)
            console.log(`[${now()}] 10 sn sonra tekrar kontrol edilecek.`)
            exitCount ++
        } else {
            console.log(`[${now()}] Test sonrası kpi değerleri :`)
            controlStatus = false
        }
    }

    if (exitCount == 4) throw new Error(`[${now()}] Read file sonrasında kpilar bulunamadı`)
    console.log(doneKpiValues)
    return doneKpiValues

}

ns.kpiValueArrayPre = async (kpiSet,indexofArray,shConnectionParameters=param.sshServerForBTKReports,remoteShFolder='/argela/deploy/MONITORING_GATEWAY/scripts/') => {

    let command = `./madCliRunCommands.sh ${kpiSet}`
    let response = await ns.executeBashCommandNoLog(command,remoteShFolder,shConnectionParameters)
    failedLines= [];
    console.log(`[${now()}] Kpi dizisinin durumu kontrol ediliyor:  [${indexofArray}]`)
    console.log(`[${now()}] Aşağıdaki kpi lar görüntülenmiştir :`)
    preKpiValues = [];
    for(i=0; i<indexofArray.length ; i++){
        if(response.match(' '+indexofArray[i]+' .*=([0-9])+;')){
            preKpiValues[indexofArray[i]] = parseInt(response.match(' '+indexofArray[i]+' .*=([0-9]+);')[1])
        } else {
            preKpiValues[indexofArray[i]] = 0
            }
    }
    console.log(preKpiValues)
    return preKpiValues
}

ns.kpiBeforeAfterComp = async (indexofArray,preKpiValues,doneKpiValues,increase,equation = false) => {
    console.log(`[${now()}] Yeni değerleri test öncesin ile karşılaştırılıyor...`)
    console.log(`[${now()}] Öncesi:`)
    console.log(preKpiValues)
    console.log(`[${now()}] Sonrası:`)
    console.log(doneKpiValues)
    let validationStatus = true
    console.log(` ~~~~ Artış Sonuçları ~~~~ `)
    for(let i of indexofArray){
        if(doneKpiValues[i] == (preKpiValues[i] + increase)){
            console.log(`-[${i}] : [OK]`)
        } else {
            console.log(`-[${i}] : [FAIL]`)
            validationStatus = false
        }
    }
    if(!validationStatus) {
        throw new Error (`[${now()}] Kpi değerleri beklenildiği gibi artmamıştır`)
    } else {
        console.log(`[${now()}] Kpi artış validasyonu tamamlandı [OK]`)
    }
    let validationStatus_ = true
    if (equation == true){
        checkValueForAll = doneKpiValues[indexofArray[0]]
        console.log(`\n ~~~~ Eşitlik Sonuçları ~~~~ `)
        for(i = 0; i < indexofArray.length ;i++){
            if(doneKpiValues[indexofArray[i]] == checkValueForAll){
                console.log(`-[${indexofArray[i]}] : [OK]`)
            } else {
                console.log(-`[${indexofArray[i]}] : [FAIL]`)
                validationStatus_ = false
                }   
        }
    }
    if(!validationStatus_) {
        throw new Error (`[${now()}] Kpi değerleri birbirlerine eşit değildir`)
    } else {
        console.log(`[${now()}] Kpi eşitlik validasyonu tamamlandı [OK]`)
    }
}
ns.kpiValidatorNeg = async (kpiSet,indexofArray,shConnectionParameters=param.sshServerForBTKReports,remoteShFolder='/argela/deploy/MONITORING_GATEWAY/scripts/') => {

    let command = `./madCliRunCommands.sh ${kpiSet}`
    let response = await ns.executeBashCommandNoLog(command,remoteShFolder,shConnectionParameters)
    failedLines_voltekVal_ = [];
    console.log(`[${now()}] .... Yandaki kpi dizisinin durumu kontrol ediliyor:  [${indexofArray}]`)
    console.log(`[${now()}] ---- Aşağıdaki kpi ların artmaması gerekmektedir :\n`)
    for(i=0; i<indexofArray.length ; i++){
        if(kpiSet.match(' '+indexofArray[i]+' (.*)=[0-9]+;')){
            console.log(response.match(' '+indexofArray[i]+' (.*)=[0-9]+;')[0])
        }
    }
    
}
ns.xdrDbCountValidator = async (countBefore,countLast,queryXdrAll) => {

    let y = 0;
    while ( countLast < countBefore + 1 ){
        y++;
        if(y>=18) throw new Error('Timeout: Yeni insert olmadı!')
        countLast = await ns.queryXdrCount(queryXdrAll); 
        console.log(countLast);
        await wait(5000);
    }
    console.log(`[${now()}] Db de yeni xdr insert edildiği görüldü.`)
}

// _____________________________________________________________________________________________________________________
// EXPORT
module.exports=ns;

