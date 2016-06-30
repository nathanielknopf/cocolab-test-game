var express = require('express')
var http = require('http')

var app = express()
var server = http.createServer(app)
var io = require('socket.io').listen(server)
var database = require(__dirname + '/database')

var mysql = require('mysql')

var use_db = true

if(use_db){
	var connection = mysql.createConnection({
		host		: 'localhost',
		user		: 'root',
		password	: 'cocolab',
		database	: 'test'
	})
}

app.use(express.static(__dirname));

app.get('/', function(request, response){
	if(request.params[0] == 'game.html'){
		response.sendFile(__dirname + '/game.html')
	} else {
		response.sendFile(__dirname + '/index.html')
	}
})

app.get(/^(.+)$/, function(req, res){ 
     console.log('static file request : ' + req.params);
     console.log("ACCESS: " + req.params[0])
     res.sendFile(__dirname + req.params[0])
 });

io.on('connection', function(socket){

	var socket_id = socket.id.slice(2)

	console.log("Connection from: " + socket_id)
	console.log(socket_id)
	
	var hs = socket.handshake
	var query = require('url').parse(socket.handshake.headers.referer, true).query
	var user = (query.user) ? query.user : 'Undefined'

	console.log("Connection from user: " + user + ".")

	database.addPlayer(user, socket_id)

	var timer = function(seconds){
		setTimeout(function(){
			if (seconds >= 1){
				socket.emit('timer', seconds - 1)
				timer(seconds - 1)
			} else {
				socket.emit('redirect', 'http://localhost:8000/chatroom.html?role=teacher')
				console.log("Redirecting " + user + ".")
			}
		}, 1000)
	}

	timer(15)

	socket.on('apples', function(apples){
		if(use_db){
			database.updatePlayer(socket_id, 'apples', apples)
		}
	})

	socket.on('rocks', function(rocks){
		if(use_db){
			database.updatePlayer(socket_id, 'rocks', rocks)
		}
	})
})

server.listen(8080, function(){
	console.log("Game server listening port 8080")
})