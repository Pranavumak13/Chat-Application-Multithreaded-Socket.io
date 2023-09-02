const express = require('express');
const http = require('http');
const app = express();
const path = require('path');
const cluster = require('cluster');

// Serve the Socket.io client-side library as a static file
app.use('/socket.io', express.static(path.join(__dirname, 'node_modules', 'socket.io-client', 'dist')));
// http server for socket.io | no need to install it's inbuilt
app.use(express.static(path.join(__dirname, '../client/index.html')));
const server = http.createServer(app); // Create an HTTP server using 'app'


const port = process.env.PORT || 3001;
// const localIP = '192.168.213.139';

const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }


    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {



    // attach http server to socket.io
    const io = require('socket.io')(server);


    // const originalPath = path.join(__dirname, '../client/index.html');
    // console.log('Original path:', originalPath);

    //route
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/index.html'))
    })

    // create a connection from the server side
    // .on(event, eventListner)


    io.on('connection', socket => {
        console.log(`Worker ${process.pid} handling connection`);
        console.log('a user connected');
        console.log(socket.id);

        socket.on('disconnect', () => {
            console.log(`Worker ${process.pid} handling disconnection`);
        });

        // get message from client
        // socket.on("message", (msg)=>{
        //     console.log("Clinet's Message: "+ msg); 
        // })

        // A SINGLE CLIENT
        // socket.emit('server', "hello from server");
        // Multiple CLIENT
        // socket.emit('server1', "hello from server1"); 

        // Broadcasting to multiple clients
        socket.on("message", msg => {
            console.log("Client's Message: " + msg);
            // Broadcast the received message to all connected clients
            io.emit('broadcastMessage', msg);
        });


    })

    // listen to http
    server.listen(port, () => {
        console.log(`Worker ${process.pid} listening on port ${port}`)
    });

    //listen to 'app'
    // app.listen(port , ()=>{
    //     console.log(`server has started on port ${port}`)
    // } )

}
