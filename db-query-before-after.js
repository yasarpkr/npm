    // Db check xdr before test
    let queryBefore = `SELECT COUNT(*) as COUNT FROM xdr_sip_volte WHERE sip_session_start_time = '2015-08-17 10:07:47' AND response_code = 403 AND prm_cause=403 AND prm_time=396;`
    let dataBefore = await execQuery(queryBefore,param.avea_lte_cdr_DbConfig);
    let countBefore = dataBefore[0].COUNT;
    console.log(countBefore);
    
        // Db execute query
    let dataLast = await execQuery(queryBefore,param.avea_lte_cdr_DbConfig);
    let countLast = dataLast[0].COUNT;
    console.log(countLast);

    if (countLast !== countBefore + 1){
        throw new Error('Db de yapılan kontrollerde offline.pcap read edildikten sonra herhangi bir xdr oluşmamıştır')
    }
