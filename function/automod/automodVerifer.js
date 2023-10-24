const { moderation } = require('../../config/settings.json');
const { logsEmiter } = require('../logs');
const { PORT, BOT_ID } = require('../../config/secret.json');
const axios = require("axios");

const automodVerifier = async (clientItem) => {
    const client = clientItem;
    const now = Date.parse(new Date());
    
    try {
        const allSanctions = await axios({
            method: "get",
            url: "/sanction",
            baseURL: `http://localhost:${PORT}`,
            headers: {
                "pastille_botid": BOT_ID
            }
        });

        if(allSanctions) {
            const { items } = allSanctions.data;
            
            items.map((item, index) => {
                const { sanction, user_id } = item;
                const ending = Date.parse(new Date(sanction.ending));

                if(ending <= now) {  }
                else {
                    const newTimer = ending - now;

                    setTimeout(() => {
                        console.log('finito');
                    }, newTimer);
                }
            })
        }
        else { logsEmiter('No sanction in database'); }
    }
    catch(error) { logsEmiter(error); }
}

module.exports = { automodVerifier }