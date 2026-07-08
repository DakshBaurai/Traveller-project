const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")
const path = require("path");
const { get } = require("http");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema , reviewSchema} = require("./schema.js");
//joi is used for schema validation of the data that is being sent to the server
const Review = require("./models/review.js");



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



const validateListing = (req , res , next ) =>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(result.error,400); }
    else{
        next();
    }
};


const validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(result.error,400); }
    else{
        next();
    }
}


app.get("/" , (req,res)=> {
    res.send("hi,I am root");
});

app.get("/listings" , wrapAsync(async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

//create new listing , this must be kept above listings/:id in order to over come ambiguity but why ?
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})

app.get("/listings/:id" , wrapAsync(async (req,res) => {
    let {id} = req.params; // this line extracts the value named id inside the parameters that triggered the get request 
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
}));

//create new listings in the data base
app.post("/listings", validateListing ,wrapAsync(async(req,res)=>{
    //here we are adding a new listing as new Listing helps to but it into the format aand req.nody.listing takes
    // the data from the page and put it into the new object and the we save it into DB
    // if(!req.body.listing) throw new ExpressError("Invalid Listing Data",400);
    // if(!req.body.listing.title) throw new ExpressError("Invalid Title",400);
    // if(!req.body.listing.description) throw new ExpressError("Invalid Description",400);
    // if(!req.body.listing.price) throw new ExpressError("Invalid Price",400);
    // if(!req.body.listing.location) throw new ExpressError("Invalid Location",400);
    // if(!req.body.listing.country) throw new ExpressError("Invalid Country",400);
    // if(!req.body.listing.image.url) throw new ExpressError("Invalid Image URL",400);    


    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("listings");
}));

app.get("/listings/:id/edit" , wrapAsync(async (req,res) =>{
    let {id} = req.params; // this line extracts the value named id inside the parameters that triggered the get request 
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//update route 
app.put("/listings/:id" , validateListing ,wrapAsync(async (req,res) =>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

app.delete("/listings/:id",wrapAsync(async (req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));


app.delete("/listings/:id/reviews/:reviewId" , wrapAsync( async(req,res)=>{
    let {id,reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: {reviews: reviewId }});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}));

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


//post route for reviews
app.post("/listings/:id/reviews" , validateReview , wrapAsync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));


app.use((req, res, next) => {
    next(new ExpressError("Page Not Found!",404));
});


app.use(( err , req , res , next )=>{
    let {statusCode = 500 , message = "Something went wrong"} = err;
    console.log(err.stack);
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});
