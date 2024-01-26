const express = require('express')
const cors = require('cors')

const app = express()

app.options("*",cors())
app.use(cors())
const io=require('socket.io')(8800,{
    cors:{
        origin:["https://client-reachtheworld.vercel.app/","https://client-reachtheworld.vercel.app/","http://localhost:3000"]
    }
})



let activeUsers=[]

//for notificatioons
let onlineUsers=[]
const addNewUser=(username,socketId)=>{
    !onlineUsers.some((user)=>user.username===username)&&onlineUsers.push({username,socketId})

}
const removeUser=(username,socketId)=>{
    onlineUsers=onlineUsers.filter((user)=>user.socketId !==socketId)
}


const getUser=(username)=>{
   return onlineUsers.find((user)=> user.username===username)
//    console.log(username,"erererererere")
 

//    console.log(fet,"fetttttttt")
    
}



io.on("connection",(socket)=>{

    //add new user
    socket.on('new-user-add',(newUserId)=>{
        //if user is not added previously
        if(!activeUsers.some((user)=>user.userId === newUserId)){
            activeUsers.push({
                userId:newUserId,
                socketId:socket.id
            })
        }
        console.log("connected users",activeUsers)
        io.emit('get-users',activeUsers)
    })
    
    //send message
    socket.on("send-message",(data)=>{
        const {receiverId}=data
        console.log(data,"new data of recieverId")
        const user=activeUsers.find((user)=>user.userId===receiverId)
        console.log(user,"sending from sockt jto")
       
        if(user){
            io.to(user.socketId).emit("receive-message",data)
        }
    })


    //for like notifications
   // io.emit("firstEvent","hell this is test!")
   socket.on('newUser',(username)=>{
    addNewUser(username,socket.id)
    //io.emit('getUser',onlineUsers)

   })

   socket.on('sendNotification',({senderName,receiverName})=>{
    console.log(receiverName,"recieverName")
    const receiver= getUser(receiverName)
    console.log(receiver,"recieving")
    console.log(senderName,"senderrrrrrrrrr")
    io.to(receiver?.socketId).emit("getNotification",
        senderName
    )
   })

   socket.on("disconnects",()=>{
    removeUser(socket.id)
   })

    socket.on("disconnect",()=>{
        activeUsers=activeUsers.filter((user)=>user.socketId!== socket.id)
        console.log("user disconnected",activeUsers)
        io.emit('get-users',activeUsers)
        
    })
})