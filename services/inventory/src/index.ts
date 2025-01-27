import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

app.get('/', (req, res)=>{
    res.status(200).json({status: 'UP'})
})

// 404 handler
app.use("/", (req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Error handler
app.use("/", (err, req, res, next) => {
  res.status(500).json({ message: "Internal Server Error" });
});

const port = process.env.PORT || 4002
const serviceName = process.env.SERVICE_NAME || 'inventory-service';

app.listen(port, ()=>{
    console.log(`${serviceName} is running on port ${port}`)
})

