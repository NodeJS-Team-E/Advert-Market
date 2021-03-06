/* globals Promise */
'use strict';
const encryption = require('../utilities/encryption');



module.exports = function(User) {
    function create(options) {
        const salt = encryption.generateSalt(),
            hashPass = encryption.generateHashedPassword(salt, options.password);

        const user = new User({
            username: options.username,
            email: options.email,
            pictureUrl: options.pictureUrl,
            phoneNumber: options.phoneNumber,
            salt: salt,
            password: options.password,
            hashPass: hashPass,
            messages: options.messages,
            adverts: options.adverts
        });

        return new Promise((resolve, reject) => {
            user.save((err) => {
                if (err) {
                    return reject(err);
                }

                return resolve(user);
            });
        });
    }

    function getUserById(id) {
        return new Promise((resolve, reject) => {
            User.findOne({ _id: id }, (err, user) => {
                if (err) {
                    return reject(err);
                }

                return resolve(user);
            }).populate("adverts").populate("messages");
        });
    }

    function findByUsername(username) {
        return new Promise((resolve, reject) => {
            User.find({ username }, (err, user) => {
                if (err) {
                    return reject(err);
                }

                return resolve(user);
            }).populate("adverts").populate("messages");
        });
    }

    function all() {
        return new Promise((resolve, reject) => {
            User.find((err, users) => {
                if (err) {
                    return reject(err);
                }

                return resolve(users);
            }).populate("adverts").populate("messages");
        });
    }

    function allUsersWithPagination(pageNumber = 0, pageSize = 5) {
        const getPage = new Promise((resolve, reject) => {
            User.find().populate("adverts").populate("messages")
                .skip(pageNumber * pageSize)
                .limit(pageSize)
                .exec((err, users) => {
                    if (err) {
                        return reject(err);
                    }

                    return resolve(users);
                });
        });

        const getCount = new Promise((resolve, reject) => {
            User.count((err, size) => {
                if (err) {
                    return reject(err);
                }

                const pageCount = Math.ceil(size / pageSize);
                return resolve(pageCount);
            });
        });

        return Promise.all([
            getPage,
            getCount
        ]);
    }

    function updateUserImage(user, newImageUrl) {
        return new Promise((resolve, reject) => {
            User.update({
                _id: user._id
            }, {
                $set: {
                    pictureUrl: newImageUrl
                }
            }, (err, updatedUser) => {
                if (err) {
                    return reject(err);
                }

                return resolve(updatedUser);
            });
        });
    }

    function updateUserPhoneNumber(user, newPhoneNumber) {
        return new Promise((resolve, reject) => {
            User.update({
                _id: user._id
            }, {
                $set: {
                    phoneNumber: newPhoneNumber
                }
            }, (err, updatedUser) => {
                if (err) {
                    return reject(err);
                }

                return resolve(updatedUser);
            });
        });
    }

    function updateUser(id, settings) {
        return new Promise((resolve, reject) => {
            User.findOne({ _id: id })
                .then(user => {
                    user.email = settings.email || user.email;
                    user.phoneNumber = settings.phoneNumber || user.phoneNumber;
                    user.pictureUrl = settings.pictureUrl || user.pictureUrl;

                    user.save();

                    resolve(user);

                }).catch(err => reject(err));
        });
    }

    function addAdvert(id, settings) {
        return new Promise((resolve, reject) => {
            User.findOne({ _id: id })
                .then(user => {
                    user.adverts.push(settings);

                    user.save();

                    resolve(user);
                }).catch(err => reject(err));
        });
    }


    function addMessage(username, message) {
        return new Promise((resolve, reject) => {
            User.findOne({ username: username })
                .then(user => {
                    console.log("IN USER ADD MESSAGE");
                    console.log(message);
                    user.messages.push(message);
                    user.save();

                    resolve(user);
                }).catch(err => reject(err));
        });
    }


    function getAllUsernames() {
        return new Promise((resolve, reject) => {
            User.find({}, "username", (err, usernames) => {
                if (err) {
                    return reject(err);
                }

                return resolve(usernames);
            });
        });
    }



    return {
        create,
        getUserById,
        findByUsername,
        all,
        updateUserImage,
        updateUserPhoneNumber,
        updateUser,
        addAdvert,
        addMessage,
        allUsersWithPagination,
        getAllUsernames
    };
};