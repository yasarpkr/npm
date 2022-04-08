    // Retrieving colums needed from db
    let queryXdr = `SELECT * FROM xdr_sip_volte WHERE sip_session_start_time = '2015-08-17 10:07:47' AND response_code = 403 AND prm_cause=403 AND prm_time=396 ORDER BY xdr_insert_time DESC;`
    let xdrResponse = await execQuery(queryXdr,param.avea_lte_cdr_DbConfig);  
    let xdrArrayProps = xdrResponse[0]

    // Array definitions , preparing to match
    let xdrArray = [xdrArrayProps.from_address,xdrArrayProps.to_address,xdrArrayProps.normal_from_address,xdrArrayProps.normal_to_address,xdrArrayProps.reversed_from_address,xdrArrayProps.reversed_to_address,xdrArrayProps.original_to_address,xdrArrayProps.reversed_original_to_address,xdrArrayProps.imsi,xdrArrayProps.from_imei,xdrArrayProps.to_imei] 
    let masterArray= [null,null,null,null,null,null,null,null,'286039590000001','0044024540000001',null]
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
