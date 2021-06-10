const mongoose= require('mongoose');
mongoose.connect("mongodb://localhost:27017/notes_app",{useNewUrlParser:true ,useUnifiedTopology:true});
var conn=mongoose.Collection;
var notesSchema= new mongoose.Schema({
    uname:{
        type:String
        },
    title:{
        type:String,
    },
    body:{
        type:String,
        required:true
    }

})
var Note= mongoose.model('Note',notesSchema)
module.exports=Note;