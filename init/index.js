const mongoose =  require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");

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

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: "6a5997755af435054957bd10"
    }));
    await Listing.insertMany(initData.data);
    console.log("Data was intialised ");
}

initDB();
//this code is used to store data in the mongoDB database which is stored in data.js
