    let xdrArrayProps = await queryXdrGetLast(query)
    let arrayRaw = ['imsi','imei','msisdn','reversed_msisdn','b_number','reversed_b_number','direction']
    let masterArray = ['286039540000001','3556710770000001','905055055050','050550550509','905460000001','100000064509','1']

    await xdrDbValidator(arrayRaw,masterArray,xdrArrayProps)
