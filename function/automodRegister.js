const fs = require('node:fs');

const automodRegister = (user, warn) => {
    const userId = user.user.id;

    console.log(userId);
}

module.exports = { automodRegister }