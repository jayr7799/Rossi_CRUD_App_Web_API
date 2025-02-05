const mongoose = require("mongoose");
const itemSchema = new mongoose.Schema({
        GameName:String,
        Publisher:String,
        Developer:String
    });

const Item = mongoose.model("Item", itemSchema, "videoGames");
module.exports = Item;