#!/usr/bin/expect -f
set ip 0
set port 1800
set username "admin"
set password "admin123*"
set prompt "telnet>"
set argsCount [llength $argv];
set i 0

#telnet
spawn telnet $ip $port

#login
expect "login :"
send "$username\r\n"
expect "password :"
send "$password\r\n"

while {$i < $argsCount } {
    expect "$prompt"
    send "[lindex $argv $i]\r\n"
    incr i
}

expect "$prompt"
send "exit\r\n"

expect eof
