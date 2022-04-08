 // Deleting xdrs from db before test
    let query_DeleteXdr = `DELETE FROM xdr_csfb_corr WHERE b_number LIKE '0505671411205%';`
    await execQuery(query_DeleteXdr,DbChoice)
