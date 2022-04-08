    // Array definitions , preparing to match
    let dataXdr = await findLastXdr('Service_1306/xdr/BTK_SIP_VOLTE_CALL_VOWIFI')
    dataXdr = dataXdr.split(',')
    let resultValues = ['2015-08-17 11:22:36','2015-08-17 11:22:37','1','2','905079854255','905079854255','217.174.34.52','10.248.128.129','286039590000001','0044024540000001','0044024540000001']
    let indexes = ['0','1','2','3','4','5','6','7','22','23','24']

    // Match xdr arrays from Server
    console.log('\n~~~~Sunucudan alınan 1. Sonuçlar~~~~\n')
    let validation = true
    let countForArray = 0
    for (let i of indexes) {
        // console.log(dataXdr[i])
        if(dataXdr[i]==resultValues[countForArray]){
            console.log(`[`+countForArray+`]. OK`)
            countForArray ++
        } else {
            console.log(`[`+countForArray+`]. FAIL`)
            validation = false
            countForArray ++
        }
    }
    if (validation===false) throw new Error('Sunucudan alınan değerler istenildiği gibi değildir')
