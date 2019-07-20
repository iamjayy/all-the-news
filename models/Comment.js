const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const Commentchema = new Schema({
    name: {
        type: String,
    },
    body: {
        type: String,
        required: true
    }
});

const Comment = mongoose.model("Comment", Commentchema);
module.exports = Comment;