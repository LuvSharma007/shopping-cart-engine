import app from "./app.js"
import mongoose from 'mongoose'

const mongoDbURL = process.env.MONGODB_URL!
const port = process.env.PORT || 3000;

mongoose.connect(mongoDbURL)
.then(()=> console.log("Connected to MongoDB"))
.catch(error=> console.error("MongoDB connection error:",error))

app.get('/',(req,res)=>{
    res.send("Server is running");
})

app.listen(Number(port),"0.0.0.0",()=>{
    console.log(`Server is listening on http://localhost:${port}`);
})


