const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const User = require("./models/user");
const Item = require("./models/Item");

const app = express();
const port = process.env.port || 3000;

app.use(express.static(path.join(__dirname, "public")));

//set up middleware to parse json requests
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));

//sets up the session variable
app.use(session({
    secret:"12345",
    resave:false,
    saveUninitialized:false,
    cookie:{secure:false}// Set to true is using https
}));

function isAuthenticated(req,res, next){
    if(req.session.user)return next();
    return res.redirect("/login");
}

//mongoDB connection setup
const mongoURI = "mongodb://localhost:27017/crudVideoGames";
mongoose.connect(mongoURI);
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB Connection Error"));
db.once("open", ()=>{console.log("Connected to MongoDB database")});

//set up mongoose schema


app.get("/", (req, res)=> {res.sendFile("index.html")}); //app routes

app.get("/users",isAuthenticated, (req,res)=>{
    res.sendFile(path.join(__dirname, "public","users.html"));
});
app.get("/update",isAuthenticated, (req,res)=>{
    res.sendFile(path.join(__dirname, "public","update.html"));
});
app.get("/login", (req,res)=>{
    res.sendFile(path.join(__dirname  + "/public/login.html"));
});

app.get("/logout", (req, res)=>{
    req.session.destroy(()=>{
        res.redirect("/login");
    });
});

app.get("/register", (req, res)=>{
    res.sendFile(path.join(__dirname + "/public/register.html"))
});

//read routes
app.get("/videoGames", async (req,res)=>{
    try
    {
        const item = await Item.find();
        res.json(item);
    }
    catch(err)
    {
        res.status(500).json({error:"Failed to get items from database"});
    }
});

app.get("/videoGames/:id", async (req, res)=>{ 
    try
    {
        const item = await Item.findById(req.params.id);
        if(!item)
        {
            return res.status(404).json({error:"{Item Not Found}"});
        }
        res.json(item);
    }catch(err)
    {
        res.status(500).json({error:"failed to get items."});
    }
});


//Create routes
app.post("/addItem", async (req, res)=>{
    try
    {
        const newItem = new Item(req.body);
        const saveItem = await newItem.save();
        //res.status(201).json(savePerson);
        res.redirect("/users.html");

        console.log(saveItem);
    }
    catch(err)
    {
        res.status(501).json({error:"{Failed to add new item}"});
    }
});

app.post("/login", async (req,res)=>{
    const {username, password} = req.body;
    console.log(req.body);
    const user = await User.findOne({username});
    if(user && bcrypt.compareSync(password, user.password)){
        req.session.user = username;
        return res.redirect("/users");
    }
    req.session.error = "Invalid User";
    return res.redirect("/login")
});

app.post("/register", async (req, res)=>{
    try
    {
        const {username, password, email} = req.body;
        const existingUser = await User.findOne({username});
        if(existingUser) return res.send("Username already taken. Try Again.");
        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = new User({username, password:hashedPassword, email});
        await newUser.save();
        res.redirect("/login");
    }catch(err)
    {
        res.status(500).send("Error: Failed to register user.");
    }
});

//update routes
app.post("/update", (req,res)=>{
    //example of promise statement for async function
    Item.findByIdAndUpdate(req.body.id, req.body, {new:true, runValidators:true}).then((updatedItem)=>{
        if(!updatedItem)
        {
            return res.status(404).json({error:"{Failed to find item}"});
        }
        res.redirect("/users.html");
        //res.json(updatedItem);
    }).catch((err)=>{
        console.log(err);
        res.status(400).json({error:"{Failed to Update item}"});
    });
});

//delete route
app.delete("/deleteItem/GameName", async (req,res)=>{
    try
    {
        const itemName = req.query;
        const item = await Item.find(itemName);
        if(item.length === 0) //exactly equal too, info and data type are equal
        {       
            return res.status(404).json({error:"{Failed to find item}"});
        }
        const deletedPerson = await Item.findOneAndDelete(itemName);
        res.json({message:"Item Deleted!"});
    }
    catch(err)
    {
        console.log(err);
        res.status(404).json({error:"{Failed to find item}"});
    }
});

app.listen(port, ()=>{console.log(`Server is Running On port ${port}`)}); //Starts server