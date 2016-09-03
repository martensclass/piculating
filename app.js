var mongoose=require('mongoose'),
    bodyParser=require('body-parser'),
    express=require('express'),
    passport=require('passport'),
    app=express();
    
var Strategy = require('passport-twitter').Strategy;
var Pic = require('./models/pic');
mongoose.connect("mongodb://localhost/piculator");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

//passport twitter stuff
passport.use(new Strategy({
    consumerKey: 'zhulyz5JBShC4S2GsdZHTI4rS',
    consumerSecret: 'zdzo8CFwAdQjczHfdmWpfiaL0qXEOmtm8fFvwc6pWst0o2xEgi',
    callbackURL: 'https://piculating-martensclass.c9users.io/auth/twitter/callback'
  },
  function(token, tokenSecret, profile, cb) {
    // In this example, the user's Twitter profile is supplied as the user
    // record.  In a production-quality application, the Twitter profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    return cb(null, profile);
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

app.use(require('express-session')({ secret: 'this is going to kill me', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());


app.get('/', function(req, res){
    var user=req.user;
    Pic.find( {}, function(err,pics) {
        if(err) console.log(err);
        else{
           res.render('index.ejs',{user: user, pics: pics});    
        }
    });
    
});

app.get('/mypics', function(req, res){
   var user=req.user;
    Pic.find( {'user': user.id}, function(err,pics) {
        if(err) console.log(err);
        else{
           res.render('mypics.ejs',{user: user, pics: pics});    
        }
    });
});

//for all pics to show on idex via angular
app.get('/api/allpics', function(req,res){
    Pic.find( {}, function(err,pics) {
        if(err) console.log(err);
        else{
            res.json(pics);    
        }
    });
});

//for just user pics to show on mypics page via angular
app.get('/api/userpics/:user', function(req,res){
    var userid=req.params.user;
    Pic.find( {'user':userid}, function(err,pics) {
   if(err) console.log(err);
   else{
        res.json(pics);    
   }
});
});

app.post('/api/pics/new', function(req,res){
   Pic.create({
     url: req.body.imageField,
     description: req.body.commentsField,
     userimg: req.body.userimgField,
     user: req.body.useridField,
     votes: 0
   },function(err,newPic){
       if(err)console.log(err);
       else{
           res.redirect('/mypics');
       }
   }) 
});


app.delete('/api/pics/:id', function(req,res){
    var id=req.params.id;
     Pic.remove({_id:id},function(err,item){
         if(err) console.log(err);
      else
         res.sendStatus(200);
     })
});

app.post('/api/vote/:id/:user', function(req,res){
     Pic.findById(req.params.id,function(err,pic){
     if(err)console.log(err);
     else
     {
         var loc=-1;
         for(var i=0; i<pic.voters.length; i++){
             if(req.params.user==pic.voters[i]){
                 loc=i;
                 break;
             }
         }
         if(loc==-1){
          pic.voters.push(req.params.user);
          pic.votes = pic.votes + 1;
         }
         else{
          pic.voters.splice(loc,1);
          pic.votes = pic.votes - 1;
         }
         pic.save(function(err,pic){
            if(err)
               console.log(err);
         });
         res.sendStatus(200);
     }
    })
});




//to compile less at command line for this project:
// $ lessc bootstrap/bootstrap.less public/stylesheets/bootstrap.css
//to minify js 
//minify public/sylesheets/bootstrap.css public/stylesheets/bootstrap.min.css

//twitter auth routes

app.get('/auth/twitter',
        passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect(307, '/');
  });

app.get('/logout', function(req,res){
  req.logout();
  res.redirect('/');
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server started");
});