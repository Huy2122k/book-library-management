const db = require("../models");
const seq = db.sequelize;
const Account = db.account;
const Rating = db.rating;
const Comment = db.comment;
const Book = db.book;
const BookItem = db.bookItem;
const LendingList = db.lendingList;
const LendingBookList = db.lendingBookList;
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");

exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
    res.status(200).send("User Content.");
};
exports.uploadAvatar = (req, res) => {
    if (!req.file) {
        res.status(400).send(new Error("Cannot uploaded book image!"));
        return;
    }
    res.send(req.file);
};

exports.adminBoard = (req, res) => {
    res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
    res.status(200).send("Moderator Content.");
};

// Send Identity Card Info
exports.addIdentity = async(req, res) => {
    const accountid = req.params.id;
    try {
        const status = await Account.findOne({
            where: { AccountID: accountid },
            attributes: [
                "IdentityStatus"
            ],
        });
        if (status.IdentityStatus=="confirmed" || status.IdentityStatus=="waiting"){
            res.send({
                message: "Can't add identity info since IdentityStatus is confirmed or waiting",
            });
        }
        else{
            const result = await Account.update({
                IdentityNum: req.body.IdentityNum,
                FrontsideURL: req.body.FrontsideURL,
                BacksideURL: req.body.BacksideURL,
                FaceURL: req.body.FaceURL,
                IdentityStatus: "waiting"
            }, { where: { AccountID: accountid } });
            if (result == 1) {
                res.send({
                    message: "Add complete.",
                });
            } else {
                res.send({
                    message: `Cannot add Identity Images with id = $ { accountid }. Maybe Account was not found or req.body is empty!`,
                });
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: error.message || "Some error occurred while retrieving tutorials.",
        });
    }
};

// Get User Info
exports.getInfo = async(req, res) => {
    const accountid = req.params.id;
    const token = req.headers["x-access-token"];
    if (token) {
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err) {
                return;
            }
            req.userId = decoded.id;
            req.role = decoded.role;
        });
    }
    const userinfo =
        req.userId === req.params.id || req.role === "ADMIN" ?
        [
            "UserName",
            "Introduction",
            "Birthday",
            "Gender",
            "ImageURL",
            "Email",
            "Phone",
            "Address",
            "IdentityNum",
            "FrontsideURL",
            "BacksideURL",
            "FaceURL"
        ] :
        ["UserName", "Introduction", "Birthday", "Gender", "ImageURL"];
    try {
        const info = await Account.findOne({
            where: { AccountID: accountid },
            attributes: userinfo,
        });
        const bookRating = await Rating.findAll({
            where: { AccountID: accountid },
            include: [{
                model: Book,
                attributes: ["BookID", "BookName", "Author", "ImageURL"],
            }, ],
            attributes: ["Rating"],
        });
        const bookComment = await Comment.findAll({
            where: { AccountID: accountid },
            include: [{
                    model: Rating,
                    on: {
                        col1: seq.where(
                            seq.col("Comment.BookID"),
                            "=",
                            seq.col("Rating.BookID")
                        ),
                        col2: seq.where(
                            seq.col("Comment.AccountID"),
                            "=",
                            seq.col("Rating.AccountID")
                        ),
                    },
                    attributes: ["Rating"],
                },
                {
                    model: Book,
                    on: {
                        col1: seq.where(
                            seq.col("Comment.BookID"),
                            "=",
                            seq.col("Book.BookID")
                        ),
                    },
                    attributes: ["BookName", "ImageURL"],
                },
            ],
            attributes: ["CommentID", "BookID", "Comment", "CreateDate"],
        });
        const lendingList = await LendingList.findAll({
            where: { AccountID: accountid },
            include: [{
                model: LendingBookList,
                include: [{
                    model: BookItem,
                    include: [{
                        model: Book,
                        attributes: ["BookID", "BookName", "Author"],
                    }, ],
                    attributes: ["BookItemID"],
                }, ],
                attributes: ["LendingID"],
            }, ],
            attributes: ["LendingID", "CreateDate", "DueDate", "ReturnDate", "Status"],
        });
        res.status(200).send({
            accountInfo: info,
            ratingInfo: bookRating,
            commentInfo: bookComment,
            lendingInfo: lendingList,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving tutorials.",
        });
    }
};

// Update user info
exports.updateInfo = async(req, res) => {
    const accountid = req.params.id;
    try {
        const beforeChange = await Account.findOne({
            where: { AccountID: accountid },
            attributes: [
                "UserName",
                "Introduction",
                "Gender",
                "Birthday",
                "Address",
                "Email",
                "Phone",
                "ImageURL"
            ],
        });
        const result = await Account.update({
            UserName: req.body.UserName,
            Introduction: req.body.Introduction,
            Gender: req.body.Gender,
            Birthday: req.body.Birthday,
            Address: req.body.Address,
            Email: req.body.Email,
            Phone: req.body.Phone,
            ImageURL: req.body.ImageURL,
        }, { where: { AccountID: accountid } });
        if (result == 1) {
            if (beforeChange.Email != req.body.Email){
                res.send({
                    message: "Need email confirmation.",
                });
            }else{
                res.send({
                    message: "No need confirmation.",
                });
            }
        } else {
            if (
                JSON.stringify(req.body) === JSON.stringify(beforeChange.dataValues)
            ) {
                res.send({
                    message: `Update successfully.`,
                });
            } else {
                res.send({
                    message: `Cannot update Account with id = $ { accountid }. Maybe Account was not found or req.body is empty!`,
                });
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: error.message || "Some error occurred while retrieving tutorials.",
        });
    }
};
