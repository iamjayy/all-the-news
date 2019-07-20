const mongoose = require("mongoose");

var Schema = mongoose.Schema;
const ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    comment: [{
        type: String,
        ref: "Comment"
    }]
})

const Article = mongoose.model("Article", ArticleSchema);
module.exports = Article;