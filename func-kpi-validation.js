    let indexofArray_gtpcprobekvals = ['4,21','5,21']
    let preKpiValues = await kpiValueArrayPre('gtpcprobekval',indexofArray_gtpcprobekvals)

    // await uploadPcapShReadFile('create_session_gtpc','/argela/deploy/MONITORING_GATEWAY/pcaps/GTPC',param.sshServerForBTKReports)

    let doneKpiValues = await kpiValueArrayDone('gtpcprobekval',indexofArray_gtpcprobekvals)

    
    await kpiBeforeAfterComp(indexofArray_gtpcprobekvals,preKpiValues,doneKpiValues,1,true)
