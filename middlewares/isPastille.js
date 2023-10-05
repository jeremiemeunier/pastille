const { BOT_ID } = require("../config/secret.json");

const isPastille = async (req, res, next) => {

    if(req.headers.pastille_botid === BOT_ID) {
        next();
    }
    else {
        res.status(403).json({ message: "Not authorized" });
    }
}

module.exports = isPastille;