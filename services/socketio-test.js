/**
* Yesbee-Socketio
*
* MIT LICENSE
*
* Copyright (c) 2014 PT Sagara Xinix Solusitama - Xinix Technology
*
* Permission is hereby granted, free of charge, to any person obtaining
* a copy of this software and associated documentation files (the
* "Software"), to deal in the Software without restriction, including
* without limitation the rights to use, copy, modify, merge, publish,
* distribute, sublicense, and/or sell copies of the Software, and to
* permit persons to whom the Software is furnished to do so, subject to
* the following conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
* LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
* OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
* WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
* @author Farid Hidayat <e.faridhidayat@gmail.com>
* @copyright 2014 PT Sagara Xinix Solusitama
*/

module.exports = function() {

	var socketsId = {},
		serverTAG = 'SOCKETIO SERVER::';

	// run as Server whinch open socket to client
	this.from('socketio://localhost:4004?eventName=waiting&exchangePattern=inOut') // #1
		.to(function(exchange) {
			console.log(serverTAG, 'hi waiting for you.');
			exchange.headers['socketio-session-id'] = exchange.body.socket_id;
			console.log(serverTAG, 'immediately hit / emit socket event.');
		})
		.to('socketio-emit://localhost:4004/checkoutEngine?eventName=hello');

	var TAG = 'SOCKETIO CLIENT::',
		socket = require('socket.io-client')('http://localhost:4004');

	// run as client which listen socket
	setImmediate(function() {

		socket.on('connect', function() {

			console.log(TAG, "connected");
			console.log(TAG, socket.io.engine.id);

			socket.emit('waiting', { // #1
				socket_id: socket.io.engine.id
			});

			socket.on('hello', function() {
				console.log(TAG, 'hello !.');
			});

			socket.on('disconnect', function(){
				console.log(TAG, 'disconnected');
			});
		});

	});


};