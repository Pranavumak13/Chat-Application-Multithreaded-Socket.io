const express = require('express');
const http = require('http');
const port = 8001;

const path = require('path');
const cluster = require('cluster'); // cluster module for multi-threading
const numCPUs = require('os').cpus().length; // get the number of cpu cores

const process = require('process');  // process module for getting the process id
const {setupMaster, setupWorker} = require('@socket.io/sticky'); // Setting up the master and worker threads
const {createAdapter, setupPrimary} = require('@socket.io/cluster-adapter'); // socket.io cluster adapter
const {server} = require('socket.io'); // socket.io server
const {info} = require('console'); // log info to console

const Redis = require('ioredis'); // importing redis client




process.on('uncaughtException', (err) => {
    console.error('Unhandled Exception', err);
});
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection', err);
});



// Checking if the thread is a worker thread or primary thread.
if(cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);    
    
    const httpServer = http.createServer();
    httpServer.listen(3001)

    // setup sticky sessions
    setupMaster(httpServer, {
        loadBalancingMethod: "hash", // either "random", "round-robin" or "least-connection"
    });

    // setting up the communication between workers and primary 
    setupPrimary({
        serialization: "advanced", // either "advanced" or "clone"
    });

    // Launching workers based on number of CPU threads
    for(let i=0; i<2; i++) {
        cluster.fork();
    }

    cluster.on('exit',(worker, code, signal) =>{
        console.log(`worker ${worker.process.pid} died`);
    });
}else{

    // Setting up the worker threads
    console.log(`Worker ${process.pid} started`);
    const redisClient = new Redis(); // By default the redis client connects to redis instance running at localhost:6379
    // Creating the Express App and Socket.io Server and binding them to HTTP server
    const app = express();
    // http server for socket.io | no need to install it's inbuilt
    const http = require('http').Server(app); // attach the 'app' to http module
    // const localIP = '192.168.213.139';
    const io = require('socket.io')(http); // attach http server to socket.io
    
    

    // Using the cluster socket.io adapter
    io.adapter(createAdapter());

    //Setting up the worker connection with the primary thread
    setupWorker(io);

    
    // create a connection from the server side
    // .on(event, eventListner)    
    
    io.on('connection', async (socket) => {
        console.log(`Worker ${process.pid}: a user connected with Socket Id: ${socket.id}`);
        // console.log(`Worker ${process.pid}: Socket Id: ${socket.id}`)
        
         // Fetching all the messages from redis
         const existingMessages = await redisClient.lrange("chat_messages", 0, -1);

         // Parsing the messages to JSON
         const parsedMessages = existingMessages.map((item) => JSON.parse(item));
 
         // Sending all the messages to the user
         socket.emit("historical_messages", parsedMessages.reverse());

        socket.on('disconnect', () => {
            console.log(`Worker ${process.pid} : a user disconnected ----------`);  
        })
        
        // Broadcasting to mmultiple clients
        socket.on("message", data => {
            console.log(`Worker ${process.pid} has Client's message: ${data}`);
            redisClient.lpush("chat_messages", JSON.stringify(data)); // Push the received message to redis list
            io.emit('broadcastMessage', data); // Broadcast the received message to all connected clients
        });
    })
    
    // listen to http
    http.listen(port, () => {
        console.log(`Worker ${process.pid}: server has started on port ${port}`)
    })

    app.use(express.static(path.join(__dirname, '../client')))
  
    //route
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/index.html'));
    }) 
    

}
