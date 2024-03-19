const isPastille = async (req, res, next) => {
  if (req.headers.pastille_botid === process.env.BOT_ID) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized" });
  }
};

module.exports = isPastille;
