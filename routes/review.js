const express = require("express");
const router = express.Router({ mergeParams: true});
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema , reviewSchema} = require("../schema.js");

//joi is used for schema validation of the data that is being sent to the server
const Review = require("../models/review.js");
const {validateReview , isLoggedIn , isReviewAuthor} = require("../middleware.js");


router.delete("/:reviewId" ,  isLoggedIn , isReviewAuthor ,wrapAsync( async(req,res)=>{
    let {id,reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: {reviews: reviewId }});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success" , "Review Deleted!");
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
router.post("/" , isLoggedIn ,validateReview , wrapAsync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    newReview.author = req.user._id;
    await newReview.save();
    await listing.save();
    req.flash("success" , "Review created!");
    res.redirect(`/listings/${listing._id}`);
}));


module.exports = router;