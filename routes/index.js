var express= require('express');
var router= express.Router();
var userModule= require('../modules/user')
var bcrypt= require('bcryptjs')
var jwt = require('jsonwebtoken')
var notesModule=require('../modules/notes_model');
const bodyParser = require('body-parser');
var getnotes=notesModule.find()

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

function checkLoginUser(req,res,next) {
    var usertoken= localStorage.getItem('usertoken')
    try{
        decoded=jwt.verify(usertoken,'logintoken')
    }catch(err){
        res.redirect('/');
    }
    next();
}

function checkuname(req,res,next) {
    var uname=req.body.uname;
    var unameexists= userModule.findOne({uname:uname})
    unameexists.exec((err,data)=>{
        if(err) throw err;
        if(data)
        {
        return res.render('register',{title:"Register", msg:'Username already exists'});
        }
        next();
    })    
}


router.get('/',function(req,res,next)
{    
    var uname= localStorage.getItem('uname')
    if(uname)
    {
        res.redirect('notes') 
    }
    else
        res.render('index',{title:"Login", msg:''})
           
})
router.post('/',function(req,res,next)
{
    var uname=req.body.uname;
    var password=req.body.password;
    var checkUser= userModule.findOne({uname:uname});
    checkUser.exec((err,data)=>{
        if(err) throw err;   
        else if(data) {
        var getpw= data.password;
        var getid= data._id;
        if(bcrypt.compareSync(password,getpw)){
            var token = jwt.sign({ userid: getid }, 'logintoken');
            localStorage.setItem('usertoken', token);
            localStorage.setItem('uname', uname);
            res.redirect('notes')
        }else{
            res.render('index',{title:"Login",msg:'Invalid password'})
        }
        }
        else{
            res.render('index',{title:"Login",msg:'Invalid username'})
        }
    })
})

router.get('/register',function(req,res,next)
{
    var uname= localStorage.getItem('uname')
    if(uname)
    {
        res.redirect('notes') 
    }
    else
        res.render('register',{title:"Register", msg:''})
})
router.post('/register',checkuname, function(req,res,next)
{
    var uname= req.body.uname;
    var password= req.body.password;
    password= bcrypt.hashSync(password,10)
    var userDetails=new userModule({
        uname:uname,
        password:password
    });
    userDetails.save((err,doc)=>{
        if(err) throw err;
        res.render('register',{title:"Register", msg:'User registered successfully'})
    })
})

router.get('/notes',checkLoginUser,function(req,res,next)
{    
    var uname= localStorage.getItem('uname')   
    getnotes.exec(function(err,data){
    if(err) throw err;
    else
        res.render('notes',{title:"Notes",uname:uname,records:data})        
    })      
});
router.get('/notes/delete/:id',checkLoginUser,function(req,res,next)
{    
    var uname= localStorage.getItem('uname')   
    var note_id=req.params.id;
    var note_del= notesModule.findByIdAndDelete(note_id)
    note_del.exec(function(err){
    res.redirect('../../')
    })
     
});
router.get('/notes/edit/:id',checkLoginUser,function(req,res,next)
{    
    var uname= localStorage.getItem('uname')   
    var note_id=req.params.id;
    var note_del= notesModule.findById(note_id)
    note_del.exec(function(err,data){
    if(err) throw err;
    res.render('edit',{title: 'Edit Note', uname:uname, result:data,id:note_id})
    })
     
});
router.post('/notes/edit/',checkLoginUser,function(req,res,next)
{    
    var uname= localStorage.getItem('uname')
    var id=req.body.id;
    var title=req.body.title;
    var body= req.body.body;
    var update= notesModule.findByIdAndUpdate(id,{uname:uname,title:title,body:body})
    update.exec((err,docs)=>{
    if(err) throw err;
    else
    res.redirect('../../');
    })
})
router.get('/notes/view/:id',checkLoginUser,function(req,res,next)
{    
    var uname= localStorage.getItem('uname')   
    var note_id=req.params.id;
    var note_details= notesModule.findById(note_id)
    note_details.exec(function(err,data){
    if(err) throw err;
    res.render('viewnote',{title: 'View Note', uname:uname, result:data})
    })
     
});

router.get('/createnew',checkLoginUser,function(req,res,next)
{    
    var uname= localStorage.getItem('uname')
    res.render('createnew',{title:"Add new note",uname:uname})
})
router.post('/createnew',checkLoginUser,function(req,res,next)
{    
    var uname= localStorage.getItem('uname')
    var title=req.body.title;
    var body= req.body.body;
    var newnote=new notesModule({
        uname:uname,
        title:title,
        body:body
    });
    newnote.save((err,doc)=>{
        if(err) throw err;
        res.redirect('notes');
    })
})
router.get('/logout',function(req,res,next)
{
    localStorage.removeItem('usertoken')
    localStorage.removeItem('uname')
    res.redirect('/')
})

module.exports=router;