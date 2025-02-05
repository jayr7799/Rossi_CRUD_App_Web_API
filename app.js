const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = process.env.port || 3000;

app.use(express.static(path.join(__dirname, "public")));

//set up middleware to parse json requests
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));

//mongoDB connection setup
const mongoURI = "mongodb://localhost:27017/crudVideoGames";
mongoose.connect(mongoURI);
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB Connection Error"));
db.once("open", ()=>{console.log("Connected to MongoDB database")});

//set up mongoose schema
const itemSchema = new mongoose.Schema({
        GameName:String,
        Publisher:String,
        Developer:String
    });

const Item = mongoose.model("Item", itemSchema, "videoGames");

app.get("/", (req, res)=> {res.sendFile("index.html")}); //app routes

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