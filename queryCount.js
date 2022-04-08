    // Insert volte_corr_identity
    let query_identityConfCountA = "SELECT COUNT(*) AS COUNT FROM `volte_corr_identity` WHERE service_id = 48 AND identifier = 'topon.s5s8gn-pgwth02.ugwth02.lab.node'"
    let query_identityConfCountB = await execQuery(query_identityConfCountA,param.dbConnPar)
    let query_identityConfCountC = query_identityConfCountB[0].COUNT