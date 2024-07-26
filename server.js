const legoData = require("./modules/legoSets");
const path = require("path");

const express = require('express');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render("home")
});

app.get('/about', (req, res) => {
  res.render("about");
});

app.get("/lego/sets", async (req,res)=>{

  let sets = [];

  try{    
    if(req.query.theme){
      sets = await legoData.getSetsByTheme(req.query.theme);
    }else{
      sets = await legoData.getAllSets();
    }

    res.render("sets", {sets})
  }catch(err){
    res.status(404).render("404", {message: err});
  }
  
});

app.get("/lego/sets/:num", async (req,res)=>{
  try{
    let set = await legoData.getSetByNum(req.params.num);
    res.render("set", {set})
  }catch(err){
    res.status(404).render("404", {message: err});
  }
});

app.get('/lego/addSet', (req, res) => {
  legoData.getAllThemes().then(themeData => {
    res.render('addSet', { themes: themeData });
  }).catch(err => {
    res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
  });
});

app.post('/lego/addSet', (req, res) => {
  legoData.addSet(req.body).then(() => {
    res.redirect('/lego/sets');
  }).catch(err => {
    res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
  });
});

app.get('/lego/editSet/:num', (req, res) => {
  let setNum = req.params.num;
  Promise.all([legoData.getSetByNum(setNum), legoData.getAllThemes()]).then(([setData, themeData]) => {
    res.render('editSet', { set: setData, themes: themeData });
  }).catch(err => {
    res.status(404).render('404', { message: err });
  });
});

app.post('/lego/editSet', (req, res) => {
  legoData.editSet(req.body.set_num, req.body).then(() => {
    res.redirect('/lego/sets');
  }).catch(err => {
    res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
  });
});

app.get('/lego/deleteSet/:num', (req, res) => {
  let setNum = req.params.num;
  legoData.deleteSet(setNum).then(() => {
    res.redirect('/lego/sets');
  }).catch(err => {
    res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
  });
});

app.use((req, res, next) => {
  res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
});

legoData.initialize().then(()=>{
  app.listen(HTTP_PORT, () => { console.log(`server listening on: ${HTTP_PORT}`) });
});