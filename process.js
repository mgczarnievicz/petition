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
    searchProfileByUserId,
} = require("./db");

const bcrypt = require("./encryption");

// REVIEW!!
function capitalizeFirstLetter(string) {
    string = string.replace(/\s\s+/g, " ").trim();
    console.log("string.trim() in process:", string);
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

exports.cleanEmptySpaces = (obj) => {
    const returnObj = {};
    for (let key in obj) {
        returnObj[key] = obj[key].replace(/\s\s+/g, " ").trim();
    }
    return returnObj;
};
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
// false -> input with stuff.
// true -> input empty.
exports.verifyingEmptyInputs = (obj) => {
    for (let key in obj) {
        if (obj[key].trim().length !== 0) {
            console.log("verifyingEmptyInputs: \nFound sth", obj[key].trim());
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
                .catch(() => "Email already register.");
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

exports.validateProfileInputs = validateProfileInputs;
function validateProfileInputs(obj) {
    const profileObj = {
        age: null,
        city: null,
        profilePage: null,
    };

    if (obj.profilePage.trim().length != 0) {
        const profilePage = obj.profilePage.trim();
        console.log("profilePage", profilePage);
        if (
            profilePage.startsWith("http://") ||
            profilePage.startsWith("https://") ||
            profilePage.startsWith("//")
        ) {
            profileObj.profilePage = profilePage;
        } else {
            profileObj.profilePage = null;
            // return "Profile Page Not accepted.";
        }
    }
    // Not working with "" now...
    profileObj.age = obj.age || null;
    // profilePage = moreInfo.profilePage || null;
    profileObj.city = capitalizeFirstLetter(obj.city) || null;

    return profileObj;
}

exports.searchProfile = (userId) => {
    return searchProfileByUserId(userId).then((result) => {
        return result.rows[0].id ? true : false;
    });
};

exports.addMoreInfo = (moreInfo, userId, empty) => {
    // REVIEW. test to see that we dont need it
    // If not there was at least one input startsWith()
    // capitalizeFirstLetter
    let profileobj = moreInfo;
    if (!empty) {
        profileobj = validateProfileInputs(moreInfo);
        console.log("I am not empty", profileobj);
    }

    // write in the data base.
    return addUserInfo(
        userId,
        profileobj.age,
        profileobj.city,
        profileobj.profilePage
    )
        .then((result) => result)
        .catch((err) => err);
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
