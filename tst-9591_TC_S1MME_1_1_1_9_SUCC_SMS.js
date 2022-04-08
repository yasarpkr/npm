// IMPORTS
const argv = require('minimist')(process.argv.slice(2));
const parameters = require('./parameters');
const config = require('../services/config');
const node_ssh = require('node-ssh');
let ssh = new node_ssh();
global.param=parameters;
const {testFlow,notFind,getText, getAttribute, click, rClick, select, sendKeys, find, getdriver, goWindow, getParameters, errorHandle, wait, successHandle, now, log, scrollY, setDownloadPath, deleteFolderRecursive,tableValidate,updateReservationStatus,execQuery,sendPostRequest,sendPostRequestSlient,sendGetRequestSlient,sendPutRequest,sendDeleteRequest,sendGetRequest} = require('../services/sente');
const {Builder, By, Key, until, webdriver,WebDriver,contextClick} = require('selenium-webdriver');
const {testParameters,btkreport,btkreportControl,btkreportControl2,reportValidator} = require('../services/npm-services');

// _____________________________________________________________________________________________________________________
// VARIABLES DEFINATIONS


// _____________________________________________________________________________________________________________________
// TEST-SPECIFIC PARAMETER DEFINATIONS
param.noDriver = 'true' ;


// _____________________________________________________________________________________________________________________
// TEST FLOW


let test = async() =>{

    let masterBtk=`2016-02-12 11:01:13,2016-02-12 11:01:13,8128,276505498,12,581,6000513,905550000001,,,,10.83.98.26,10.201.49.1,2,0,419,565,,905598008000,,1,,,,0,0,,,,,21,`;

    let data = await btkreport('TC_S1MME_1_1_1_9_SUCC_SMS', 'S1MME','Service_1301/xdr/LTE_SMS' )

    await reportValidator(data,masterBtk);

}

testFlow(argv,test,testParameters);




