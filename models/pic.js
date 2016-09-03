var mongoose=require('mongoose');

var picSchema = new mongoose.Schema({
   url: String,
   description: String,
   userimg: String,
   user: String,
   votes: Number,
   voters: [String]
});

var Pic = mongoose.model("Pic", picSchema);
module.exports=Pic;