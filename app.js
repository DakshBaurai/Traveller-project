const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")
const path = require("path");
const { get } = require("http");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("Connected to DB");
})
.catch((err)=>{
    console.log(err);
});


async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine" , "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));



app.get("/" , (req,res)=> {
    res.send("hi,I am root");
});

app.get("/listings" , async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
});

//create new listing , this must be kept above listings/:id in order to over come ambiguity but why ?
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})

app.get("/listings/:id" , async (req,res) => {
    let {id} = req.params; // this line extracts the value named id inside the parameters that triggered the get request 
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
});

//create new listings in the data base
app.post("/listings", async(req,res)=>{
    //here we are adding a new listing as new Listing helps to but it into the format aand req.nody.listing takes
    // the data from the page and put it into the new object and the we save it into DB
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("listings");
})

app.get("/listings/:id/edit" , async (req,res) =>{
    let {id} = req.params; // this line extracts the value named id inside the parameters that triggered the get request 
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
})

//update route 
app.put("/listings/:id" , async (req,res) =>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
})

app.delete("/listings/:id",async (req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
})

// app.get("/testListing" , async (re,res) => {
//     let sampleListing = new Listing({
//         title: "My new villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute , Goa", 
//         country: "India"
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});
