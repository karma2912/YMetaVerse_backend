const express = require("express")
const {Server, Socket} = require("socket.io")
const connectToMongo = require("./db.js")
const app = express()
const cors = require("cors")
connectToMongo()


// here are the api's which were made using express.js
app.use(express.json())
app.use(cors())

app.use("/api/auth", require("./routes/auth"))

app.get("/",(req,res)=>{
    res.send("Hello Karma I am from Backend")
})

const server = app.listen(4000,()=>{
    console.log("App is listening on port 4000")
})

const io = new Server(server,{
    cors:true
})

// here are the connection made by socket.io

const nameTosocketMapping = new Map()

const socketTonameMapping = new Map()

const nameToPositionMapping = new Map()

let players = {}
 
io.on("connection",(socket)=>{
    socket.on("new-player",(data)=>{
        const { name,x,y } = data
        let playerPositon = {x,y}
        players[name] = playerPositon
        console.log(players)
        nameToPositionMapping.set(name,playerPositon)
        nameTosocketMapping.set(name,socket.id)
        socketTonameMapping.set(socket.id,name)
        socket.broadcast.emit("User-joined",{name,x,y})
    })


    socket.on("Adding-player",(data)=>{
        const {name} = data
        const socketId = nameTosocketMapping.get(name)
        const fromName = socketTonameMapping.get(socket.id)
        const pos = nameToPositionMapping.get(fromName)
        socket.to(socketId).emit("Incoming-call",{name,fromName,pos})
    })

    socket.on("player-moved",(data)=>{
        const {finalName,x,y} = data
        console.log("this is finalname",finalName,x,y)
        let playerPositon = {x,y}
        const fromName = socketTonameMapping.get(socket.id)
        const socketId = nameTosocketMapping.get("Yash")
        console.log("this is fromname",fromName,x,y)
        socket.to(socketId).emit("position-changed",{fromName,playerPositon})
        

    })
    socket.on("disconnect",()=>{
        console.log("Disconnected")
        players = {}
        socket.disconnect()
    })
})

io.listen(5000,()=>{
    console.log("io is listening on port 5000")
})