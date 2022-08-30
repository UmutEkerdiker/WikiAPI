const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({extended: false}));

app.set("view engine", "ejs");

app.use(express.static("public"));

main().catch(function(err) {
  console.log(err);
});

async function main() {
  await mongoose.connect("mongodb://localhost:27017/wikiDB");
};


////Set mongoose schema and model////

const articleSchema = new mongoose.Schema({
  title: String,
  content: String
});

const Article = mongoose.model("Article", articleSchema)

////Requests targeting all articles////

app.route("/article")

  .get(function(req, res) {
    Article.find(function(err, foundArticles) {
      if (!err) {
        res.send(foundArticles);
      } else {
        res.send(err);
      }
    });
  })

  .post(function(req, res) {

    const newArticle = new Article({
      title: req.query.title,
      content: req.query.content
    });

    newArticle.save(function(err) {
      if (!err) {
        res.send("Successfully added a new article.");
      } else {
        res.send(err);
      }
    });
  })

  .delete(function(req, res) {
    Article.deleteMany(function(err) {
      if (!err) {
        res.send("Successfully deleted all articles.");
      } else {
        res.send(err);
      }
    });
  });


////Requests targeting a specific article////

app.route("/articles/:articleTitle")

  .get(function(req, res) {
    Article.findOne({title: req.params.articleTitle}, function(err, foundArticle){
      if(foundArticle){
        res.send(foundArticle);
      }else{
        res.send("No articles matching that title was found.");
      }
    });
  })

  .put(function(req, res){
    Article.findOneAndUpdate(
      {title: req.params.articleTitle},
      {title: req.body.title, content: req.body.content},
      {overwrite: true},
      function(err){
        if(!err){
          res.send("Successfully updated article.");
        }
      });
  })

////$set is required in patch so it can check which key has been changed and only update that one.////
  .patch(function(req, res) {
    Article.findOneAndUpdate(
      {title: req.params.articleTitle},
      {$set: req.body},
      function(err) {
        if(!err){
          res.send("Article updated successfully.");
        } else {
          res.send(err);
        }
      }
    );
  })

  .delete(function(req, res) {
    Article.findOneAndDelete(
      {title: req.params.articleTitle},
      function(err){
        if(!err){
          res.send("Article successfully deleted.");
        } else{
          res.send(err);
        }
      }
    );
  });


app.listen(3000, function() {
  console.log("Server has started on port 3000.");
});
