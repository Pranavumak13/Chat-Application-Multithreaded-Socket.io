const express = require('express');
const app = express();
const path = require('path');


// http server for socket.io | no need to install it's inbuilt
const http = require('http').Server(app); // attach the 'app' to http module


const port = process.env.PORT || 3001;

// attach http server to socket.io
const io = require('socket.io')(http);      


//route
app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname + '/client/index.html')  )
})

// create a connection from the server side
// .on(event, eventListner)


io.on('connection',socket=>{
    console.log('a user connected');
    console.log(socket.id);
    
    
    socket.on('disconnect',()=>{
        console.log('a user disconnected ----------');
    })


    // get message from client
    // socket.on("message", (msg)=>{
    //     console.log("Clinet's Message: "+ msg); 
    // })

    // // A SINGLE CLIENT
    // socket.emit('server', "hello from server");

    // Broadcasting to mmultiple clients
    socket.on("message", msg => {
        console.log("Client's Message: " + msg);
        // Broadcast the received message to all connected clients
        io.emit('broadcastMessage', msg);
    });
    
    // Multiple CLIENT
    // socket.emit('server1', "hello from server1"); 
})




// listen to http
http.listen(port, ()=>{
    console.log(`server has started on port ${port}`)
})



// //listen to 'app'
// app.listen(port , ()=>{
//     console.log(`server has started on port ${port}`)
// } )