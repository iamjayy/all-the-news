const express = require("express");
const router = express.Router();
const path = require("path");

const request = require("request");
const cheerio = require("cheerio");

const Comment = require("../models/Comment");
const Article = require("../models/Article");

router.get("/", function (req, res) {
    res.redirect("/Articles");
});

router.get("/scrape", function (req, res) {
    request("http://www.theverge.com", function (error, response, html) {
        var $ = cheerio.load(html);
        var titlesArray = [];

        $(".c-entry-boc--compact__title").each(function (i, element) {
            var result = []

            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            if (result.title !== "" && result.link !== "") {
                if (titlesArray.push(result.title) == -1) {
                    titlesArray.push(result.title);

                    Article.count({ title: result.title }, function (err, test) {
                        if (test === 0) {
                            var entry = new Article(result);

                            entry.save(function (err, doc) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(doc);
                                }
                            })
                        }
                    })
                } else {
                    console.log("Article already exists");
                }
            } else {
                console.log("not saved to database, missing data")
            }

        });
        res.redirect("/");
    });
});

router.get("/articles", function (req, res) {
    Article.find().sort({ _id: -1 }).exec(function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            var artcl = { article: doc };
            res.render("index", artcl);
        }
    });
});

router.get("/articles-json", function (req, res) {
    Article.find({}, function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            res.render(doc);
        }
    });
});

router.get("clearAll", function (req, res) {
    Article.remove({}, function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log("delete all articles");
        }
    });
    res.redirect("/aricles-json")
});

router.get("/readArticle/id", function (req, res) {
    var articleId = req.params.id;
    var hbsObj = {
        article: [],
        body: []
    };

    Article.findOne({ _id: articleId })
        .populate("comment")
        .exec(function (err, doc) {
            if (err) {
                console.log("error: " + err);
            } else {
                hbsObj.article = doc;
                var link = doc.link;
                request(link, function(error, response, html){
                    var $ = cheerio.load(html);
                    $(".l-col__main").each(function(i, element){
                        hbsObj.body = $(this)
                        .children(".c-entry-content")
                        .children("p")
                        .text();

                        res.render("article", hbsObj);
                        return false;
                    })
                })
            }
        })
});

router.post("/comment/:id", function(req, res){
    var user = req.body.name;
    var content = req.body.comment;
    var articleId = req.params.id;

    var commentObj = {
        name: user,
        body: content
    };

    var newComment = new Comment(commentObj);

    newComment.save(function(err, doc){
        if (err) {
            console.log(err);
        } else {
            console.log(doc._id);
            console.log(articleId);

            Article.findOneAndUpdate(
                { _id: req.params.id },
                { $push: { comment: doc._id } },
                { new: true }
            ).exec(function(err, doc){
                if (err) {
                    console.log(err)
                } else {
                    res.redirect("/readArticle/" + articleId)
                }
            });
        }
    });
});





module.exports = router;
