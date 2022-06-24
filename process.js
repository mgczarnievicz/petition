const {
    getUserById,
    countSignatures,
    registerUser,
    getUserByEmail,
    addUserInfo,
    getSignatureBySignatureId,
} = require("./db");

const bcrypt = require("./encryption");

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function allStringsAreEmpty(obj) {
    for (let key in obj) {
        if (obj[key].trim().length != 0) {
            return false;
        }
    }
    return true;
}

module.exports.getSignatureByIdAndTotalSigners = (signatureId) => {
    return Promise.all([
        getSignatureBySignatureId(signatureId),
        countSignatures(),
    ])
        .then((result) => {
            const newResult = [];
            newResult.push(result[0].rows[0]);
            newResult.push(result[1].rows[0]);
            return newResult;
        })
        .catch((error) => error);
};
// false -> input empty.
// true -> input with stuf.
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
                capitalizeFirstLetter(newUser.name),
                capitalizeFirstLetter(newUser.surname),
                newUser.email.toLowerCase(),
                hashpass
            )
                .then((dbresult) => dbresult.rows[0])
                .catch((err) => err);
        })
        .catch((hasherr) => hasherr);
};

exports.logInVerify = (userLogIn) => {
    return getUserByEmail(userLogIn.email.toLowerCase())
        .catch((err) => err)
        .then((result) => {
            // See what we recived and if there is a result, then se
            // if its empty or not.

            if (result.rows.length === 0) {
                console.log("Email not register");
                return "Email not register";
            }
            return bcrypt
                .compare(userLogIn.password, result.rows[0].password)
                .catch((err) => err)
                .then((isCorrect) => {
                    if (isCorrect) {
                        console.log("You Are In!");
                        return result.rows[0];
                    } else {
                        console.log("Password Incorrect");
                        return "Password Incorrect";
                    }
                });
        });
};

exports.addMoreInfo = (moreInfo, userId) => {
    if (allStringsAreEmpty(moreInfo)) {
        // All input are empty so we dont save
        return;
    }
    let profilePage = null,
        city = null,
        age = null;

    // REVIEW. test to see that we dont need it
    // If not there was at least one input startsWith()
    // capitalizeFirstLetter
    // if (moreInfo.profilePage.length != 0) {
    //     profilePage = moreInfo.profilePage;
    //     console.log("profilePage", profilePage);
    //     if (
    //         profilePage.startsWith("http://") ||
    //         profilePage.startsWith("https://") ||
    //         profilePage.startsWith("//")
    //     ) {
    //         return "Profile Page Not accepted.";
    //     }
    // }
    profilePage = moreInfo.profilePage || null;
    city = moreInfo.city || city;
    age = moreInfo.age || age;

    // write in the data base.
    return addUserInfo(userId, age, capitalizeFirstLetter(city), profilePage)
        .then((result) => result)
        .catch((err) => err);
};
