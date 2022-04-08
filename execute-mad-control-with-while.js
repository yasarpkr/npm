    // Check madCli every 3 seconds 
    let count = 1;
    while((!lineMatch1 || !lineMatch2) && count < 10){
        console.log('\n['+now()+'] Deneme: '+count+'\ncsfb_corrkval command çıktısında istenilen kpilar görülememiştir\n')
        count +=1
        await wait(3000)
    }
    if(count<10 && (lineMatch1 && lineMatch2)){
        console.log('\n['+now()+'] Deneme: '+count+'\ncsfb_corrkval command çıktısında istenilen kpilar alındı\n')
        console.log(lineMatch1 + '\n' + lineMatch2)
    } else {
        throw new Error('Madcli -> csfb_corrkval çıktısında istenilen kpilar görüntülenemedi.Test failed etmiştir')
        }
