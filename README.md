# onlinedarts
This  tool allows you to play a game of cricket online with your friends.

It uses node.js, express.js and socket.io for the dart app and Jitsi api for the visio.



## How to set up dev environment
On a debian with node 8.10.
If you don't have node installed already `sudo apt install nodejs npm` should work.

1. clone the repo: `git clone https://github.com/cspaier/onlinedarts.git`
2. go into the directory: `cd onlinedarts`
3. install dependencies: `npm install`
4. run the server: `nodemon index.js`. You should expect the following output:
```
[nodemon] to restart at any time, enter `rs`
[nodemon] watching dir(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node index.js
```
Visit http://localhost:8000/ and you are good to go!
