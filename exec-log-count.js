    // Some Definitions before run command
    let logPath = '/argela/LOGS/'
    const date = new Date();
    let grepPattern = 'Exporting'
    let logFileName = 'DIAMETER_HSS_PROBE_H95_I0.log'
    let currentDate = date.toLocaleDateString('en-GB').split('/').reverse().join('-')
    let command = `grep -a -i ${grepPattern} ${logFileName} | grep -a ${currentDate} | wc -l`
    console.log(command)

    // Ssh connect , run command
    await ssh.connect(sshConfig)
    .then(async() => {
        console.log(`\n[${now()}] [Command: ${command}] [Host: ${sshConfig.host}]`)
        await ssh.execCommand(command, {cwd:logPath}).then(function(result) {
            // console.log(result.stdout)
            console.log(result.stderr)
            let allLines = result.stdout.split("\n")
            let logCount = parseInt(allLines[0])
            console.log(`${grepPattern} kelimesine log içerisinde ${logCount} kez rastlanıldı. `)
            if (logCount !== 0) {
                throw new Error(`${grepPattern} kelimesine log içerisinde ${logCount} kez rastlanıldı`)
            }
            if (result.stderr) {
                throw new Error(result.stderr)
            }
        });
    })
}
