# Socket_distributed_system

## Real-time Communication in a Distributed System using Socket.io

- This project demonstrates the effective use of socket programming to create a distributed system application that enables real-time communication between multiple clients.
- The application is able to handle multiple connections and relay messages between clients in real time, allowing for instant communication and improved collaboration between users.
- Laptop View:
  
  ![alt text](https://github.com/Pranavumak13/Socket_distributed_system/blob/main/src/images/Laptop%20View.png "Laptop View" )

- Mobile View:

  <img src="https://github.com/Pranavumak13/Socket_distributed_system/blob/main/src/images/Mobile%20View.jpg" alt="Mobile View" height="400">


Redis is used to store the messages.


## How to run the application

- Clone the repository
- Install the dependencies using `npm install`
- First, start the redis server using `redis-server`
- Then, run the server using `npm start`
- Open the application in the browser using `localhost:3000`
- To run the application on a different port, use `PORT=3001 npm start`

## How to use the application

- You can start the group convserion session directly by accessing the application using `localhost:3000`

## To remove the redis data

- Run `redis-cli flushall` to remove all the data stored in redis
- Run `redis-cli shutdown` to stop the redis server 