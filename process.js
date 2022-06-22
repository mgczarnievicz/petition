const {
    getRowById,
    countRowsInTable,
    registerUser,
    getUserByEmail,
} = require("./db");

const bcrypt = require("./encryption");

module.exports.getSignerByIdAndTotalSigners = (id) => {
    return new Promise((resolve, reject) => {
        Promise.all([getRowById(id), countRowsInTable()])
            .then((result) => {
                const newResult = [];
                newResult.push(result[0].rows);
                newResult.push(result[1].rows[0]);
                resolve(newResult);
            })
            .catch((error) => reject(error));
    });
};

exports.verifyingInputs = (obj) => {
    for (let key in obj) {
        if (obj[key].trim().length === 0) {
            return false;
        }
    }
    return true;
};

exports.registerNewUser = (newUser) => {
    // First hash the pass.
    // then write in db.
    return bcrypt
        .hash(newUser.password)
        .then((hashpass) => {
            // Saved input in the db.
            console.log("hashpass", hashpass);
            return registerUser(
                newUser.name,
                newUser.surname,
                newUser.email,
                hashpass
            )
                .then((dbresult) => dbresult.rows[0])
                .catch((err) => err);
        })
        .catch((hasherr) => hasherr);
};

exports.logInVerify = (userLogIn) => {
    return getUserByEmail(userLogIn.email)
        .catch((err) => err)
        .then((result) => {
            // See what we recived and if there is a result, then se
            // if its empty or not.
            console.log("result.rows", result.rows);
            console.log("result.rows.lenght", result.rows.length);

            if (result.rows.length === 0) {
                console.log("Email not register");
                return "Email not register";
            }
            return bcrypt
                .compare(userLogIn.password, result.rows[0].password)
                .catch((err) => err)
                .then((isCorrect) => {
                    let answer = "";
                    if (isCorrect) {
                        return result.rows;
                    } else {
                        return "Password Incorrect";
                    }
                });
        });
};
