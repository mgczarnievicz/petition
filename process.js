const {
    countSignatures,
    registerUser,
    getUserByEmail,
    addUserInfo,
    getUserNameAndSignatureBySignatureId,
    getPasswordByUserId,
    updatePasswordByUserId,
    deleteUserByUserId,
    deleteProfileByUserId,
    deleteSignatureByUserId,
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

function compareInputAndSavedPassByUserId(userId, inputPass) {
    return getPasswordByUserId(userId)
        .catch((err) => err)
        .then((result) => {
            console.log("results in set new pass:", result.rows[0].password);

            return bcrypt
                .compare(inputPass, result.rows[0].password)
                .catch((err) => err)
                .then((isCorrect) => isCorrect);
        });
}

module.exports.getSignatureByIdAndTotalSigners = (signatureId) => {
    return Promise.all([
        getUserNameAndSignatureBySignatureId(signatureId),
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
                        return "Password Incorrect";
                    }
                });
        });
};

// FIXME!
exports.validateProfileInputs = function validateProfileInputs(obj) {
    const profileObj = {
        age: null,
        city: null,
        profilePage: null,
    };

    if (obj.profilePage.trim().length != 0) {
        const profilePage = obj.profilePage;
        console.log("profilePage", profilePage);
        if (
            profilePage.startsWith("http://") ||
            profilePage.startsWith("https://") ||
            profilePage.startsWith("//")
        ) {
            return "Profile Page Not accepted.";
        } else {
            profileObj.profilePage = profilePage;
        }
    }
    // Not working with "" now...
    profileObj.age = obj.age || null;
    // profilePage = moreInfo.profilePage || null;
    profileObj.city = obj.city || null;

    return profileObj;
};

exports.addMoreInfo = (moreInfo, userId) => {
    return new Promise((resolve, reject) => {
        if (allStringsAreEmpty(moreInfo)) {
            // All input are empty so we dont save
            resolve();
        }

        // REVIEW. test to see that we dont need it
        // If not there was at least one input startsWith()
        // capitalizeFirstLetter
        const profileobj = validateProfileInputs(moreInfo);

        // write in the data base.
        return addUserInfo(
            userId,
            profileobj.age,
            profileobj.city,
            profileobj.profilePage
        )
            .then((result) => resolve(result))
            .catch((err) => reject(err));
    });
};

exports.setNewPassword = (userId, oldPassword, newPassword) => {
    return compareInputAndSavedPassByUserId(userId, oldPassword)
        .then((isCorrect) => {
            if (isCorrect) {
                console.log("You Are In!");
                // hash new password and save it.
                return (
                    bcrypt
                        .hash(newPassword)
                        //
                        .then((hashpass) => {
                            // Saved input in the db.
                            console.log("hashpass", hashpass);
                            return updatePasswordByUserId(hashpass, userId);
                        })
                        .catch((err) => err)
                );
            } else {
                return "Password Incorrect";
            }
        })
        .catch((err) => err);
};

exports.deleteUser = (userId, password) => {
    return compareInputAndSavedPassByUserId(userId, password)
        .then((isCorrect) => {
            if (isCorrect) {
                console.log("Pass correct");
                return Promise.all([
                    deleteProfileByUserId(userId),
                    deleteSignatureByUserId(userId),
                ])
                    .then(() => deleteUserByUserId(userId))
                    .catch((err) => err);
            } else {
                return "Password Incorrect";
            }
        })
        .catch((err) => err);
};
