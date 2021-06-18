var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

const Geocodio = require('geocodio-library-node');
const geocoder = new Geocodio('d53ff5b8b4dbdc5bfd34c2db8c0bb4bf1f8bd3f');

let collection, people, currentID, option, update;
const url = 'mongodb+srv://*********@cluster0.rwzqt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

//an array to store all our contacts from database
var peopleArray = [];

var ensureLoggedIn = function(req, res, next) {
	if ( req.user ) {
		next();
	}
	else {
		res.redirect("/login");
	}
}

/* GET home page. */
router.get('/mailer', function(req, res, next) {
  connectMongo();
  res.render('index', { title: 'Contacts', loginStatus: req.user });
});

router.get('/', function(req, res, next) {
  connectMongo();
  res.render('index', { title: 'Contacts', loginStatus: req.user });
});


/* Record the data from POST */
router.post('/thankyou', function(req, res){
  var location = req.body.street + ", " + req.body.city + ", " + req.body.state + ", " + req.body.zip
  var loc;
  connectMongo();
  geocoder.geocode(location)
  .then(response => {
    loc = response.results[0].location;
    if(dataExists(req.body) == false){
      req.body.lat = loc.lat;
      req.body.lng = loc.lng;
      collection.insertOne(req.body);
      currentID = req.body;
      res.render("thankyou", {title:"Thank You", current: currentID});
    }
    else{
      res.render("errorMsg"), {title: "Error", themsg : "Sorry. We couldn't sign you up because your email or phone number is already registered."}
    }
  })
  .catch(err => {
    console.error(err);
  }
);
  
});

//function to connect to the mongodb server
const connectMongo = async() => {
  const connection = await MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
  peopleArray.splice(0, peopleArray.length);
  const db = connection.db('contacts');
  collection = db.collection('people');
  people = collection.find({});
  people.forEach(function(doc, err){
     peopleArray.push(doc);
  });
}


//function to check if the data already exists in the database. Check for email and phone number
const dataExists = (data)=>{
  //check if data exists
  var checkphone = data.phone;
  var checkemail = data.email;

  for(var i=0; i < peopleArray.length; i++){
    if(peopleArray[i].phone == checkphone || peopleArray[i].email == checkemail){
      return true;
    }
  }
  return false;
}


/* GET contacts page. */
router.get('/contacts',ensureLoggedIn ,function(req, res, next){   
  connectMongo();
  res.render('contacts', {title: 'Contacts', peoples: peopleArray});
}); 

router.post('/contacts', ensureLoggedIn ,function(req, res, next){
  option = req.body;
  if(check(option) == true){
    collection.deleteOne({ "_id" : ObjectId(option.deleteid) });
    for(var i=0; i<peopleArray.length; i++){
      if(peopleArray[i]._id == option.deleteid){
        peopleArray.splice(i, 1);
      }
    }
    res.render('contacts', {title: 'Contacts', peoples: peopleArray});
  }
  else{
    for(var i = 0; i < peopleArray.length; i++){
      if(peopleArray[i]._id == option.updateid){
        update = peopleArray[i];
      }
    }
    res.render('update', {title: 'Update', update: update});
  }
});

//function to delete the data from the database
const check = (obj) => {
  if('deleteid' in obj){
    return true;
  }
  return false;
}

router.post('/update', ensureLoggedIn ,function(req, res){
  connectMongo();
  updateData(req.body);
  res.render('thankyouUpdate', {title: 'Update', current: update});
});

const updateData = (data) =>{
  update.fname = data.fname;
  update.lname = data.lname;
  update.street = data.street;
  update.city = data.city;
  update.state = data.state;
  update.zip = data.zip;
  update.phone = data.phone;
  update.email = data.email;
  update.contactChk = data.contactChk;

  var location = data.street + ", " + data.city + ", " + data.state + ", " + data.zip
  var loc;
  geocoder.geocode(location)
  .then(response => {
    loc = response.results[0].location;
    for(var i = 0; i < peopleArray.length; i++){
      if(peopleArray[i]._id.toString() == update._id.toString()){
        peopleArray[i] = update;
        collection.update({_id: ObjectId(update._id)},{
          fname : data.fname,
          lname : data.lname,
          street : data.street,
          city: data.city,
          state: data.state,
          zip: data.zip,
          phone: data.phone,
          email: data.email,
          contactChk: data.contactChk,
          lat: parseFloat(loc.lat),
          lng : parseFloat(loc.lng)
        })
      }
    }
  })
}

router.get('/login', function(req, res, next){
  connectMongo();
  if(req.user){
    res.render('contacts', {title: 'Contacts', peoples: peopleArray});
  }
  else{ 
    res.render('login', {title: 'Login'});
  }
});

router.get('/login_failed', function(req, res, next){
  res.render('login_failed', {title: 'Failed'});
});

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/mailer');
});

module.exports = router;
