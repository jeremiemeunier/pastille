const { version } = require('../package.json');
const tag = `pastille[${version}] `;

let channelConsole, channelDebug;

const logsTester = async () => {
    // try {
    //     const test = await channelConsole.send({ content: 'Testing logger' });
    //     if (test) {
    //         await test.delete();
    //         return true;
    //     }
    // }
    // catch(error) {
    //     console.log(error);
    //     return false;
    // }
}

const logsEmiter = async (content) => {
    try { console.log(tag + content); }
    catch(error) { console.log(error); }

    try {
        channelConsole.messages.fetch().then(async (messages) => {
            const lastLogMessage = messages.first();

            if(lastLogMessage !== undefined) {
                let lastLogContent = lastLogMessage.content.slice(0, -3);
                let newLogContent = `${lastLogContent}\r\n${tag + content + '```'}`;

                if(newLogContent.length >= 2000) {
                    try { await channelConsole.send({ content: '```' + tag + content + '```' }); }
                    catch(error) { console.log(error); }
                }
                else {
                    try { await lastLogMessage.edit(newLogContent); }
                    catch(error) { console.log(error); }
                }
            }
            else { await channelConsole.send({ content: '```' + tag + content + '```' }); }
        });
    }
    catch(error) {
        console.log(error);
    }
}

const logsBooter = async (client, console, debug) => {
    channelConsole = console;
    channelDebug = debug;
};

module.exports = { logsBooter, logsEmiter, logsTester };