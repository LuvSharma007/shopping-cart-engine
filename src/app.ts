import express from 'express'
import session from 'express-session'
import cors from 'cors'
import MongoStore from 'connect-mongo';

const app = express();
app.use(express.json());

app.use(cors());

app.use(session({
    secret: process.env.SECRET!,
    resave: false,
    saveUninitialized: false, 
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL!
    }),
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        secure: false, 
        httpOnly: true
    }
}));

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	limit: 100, 
	standardHeaders: 'draft-8', 
	legacyHeaders: false, 
	ipv6Subnet: 56, 
})

import itemRouter from "./routes/item.routes.js"
import cartRouter from "./routes/cart.routes.js"
import campaignRouter from "./routes/checkout.routes.js"
import rateLimit from 'express-rate-limit';

app.use("/api/v1/item",limiter,itemRouter);
app.use("/api/v1/cart",limiter,cartRouter)
app.use("/api/v1/checkout",limiter,campaignRouter)



export default app;