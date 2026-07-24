const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup",(req,res) =>{
    res.render("users/signup.ejs");
});

//here wrapAsync is not used as we need some different functionality more than just handling the error
router.post("/signup", async (req,res)=>{
    try{
        let {username , email , password} = req.body;
        const newUser = new User({email,username});
        const registeredUser = await User.register(newUser,password);
        req.login(registeredUser, (err)=> {
            if(err){
                return next(err);
            }else{
                req.flash("success" , "Welcome to Wanderlust");
                res.redirect("/listings");
            }
        });
    }catch(err){
        req.flash("error" , err.message);
        res.redirect("/signup");
    }
});

router.get("/login",(req,res) =>{
    res.render("users/login.ejs");
});

//here passport authenticate is used as middlewear to authenticate the user from the database and then on success perform further task
router.post("/login", saveRedirectUrl ,passport.authenticate("local" , {failureRedirect: '/login' , failureFlash: true}) ,async (req,res)=>{
    req.flash("success","Welcome to Travellers");
    if( !res.locals.redirect){
        res.redirect("/listings");
    }else{
        res.redirect(res.locals.redirect);
    }
    
});


router.get("/logout" , (req,res) =>{
    req.logout((err)=>{
        if(err){
            next(err);
        }
        req.flash("success" , "You were logged out ");
        res.redirect("/listings");
    })
});

module.exports = router;