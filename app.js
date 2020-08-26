var express = require("express");
var expressSanitizer = require("express-sanitizer");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");

mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.connect("mongodb://localhost:27017/spansucksatmusic", { useNewUrlParser: true });
app.use(expressSanitizer());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: { type: Date, default: Date.now }
});

var Blog = mongoose.model("blog", blogSchema);

/* Blog.create(
    {
        title: "John Mayer sucks ass",
        image: "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
        body: "John Mayer sucks big mongo dick"
    }
);*/

app.get("/", function (req, res) {
    res.redirect("/posts");
})

app.get("/posts", function (req, res) {

    Blog.find({}, function (err, blogs) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("index", { blogs: blogs });
        }
    })
})

app.get("/posts/new", function (req, res) {
    res.render("new");
})

app.post("/posts", function (req, res) {

    req.body.blog.body = req.sanitize(req.body.blog.body);

    Blog.create(req.body.blog, function (err, newblog) {
        if (err) {
            console.log(err);
            res.render("new");
        }
        else {
            res.redirect("/");
        }
    })
})

app.get("/posts/:id", function (req, res) {
    Blog.findById(req.params.id, function (err, foundBlog) {
        if (err) {
            console.log(err);
            res.redirect("/posts");
        }
        else {
            res.render("show", { blog: foundBlog });
        }
    })
})

app.get("/posts/:id/edit", function (req, res) {

    Blog.findById(req.params.id, function (err, foundBlog) {
        if (err) {
            res.redirect("/posts");
        }
        else {
            res.render("edit", { blog: foundBlog });
        }
    })

})

app.put("/posts/:id", function (req, res) {

    req.body.blog.body = req.sanitize(req.body.blog.body);

    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, editedBlog) {
        if (err) {
            res.redirect("/posts");
        }
        else {
            res.redirect("/posts/" + req.params.id);
        }
    })
})

app.delete("/posts/:id", function (req, res) {

    Blog.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/posts");
        }
        else {
            res.redirect("/posts");
        }
    })
})

app.listen(3000, function () {
    console.log("Listening at port 3000.");
})