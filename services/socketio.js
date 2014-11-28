/**
* socketio.js services/socketio.js
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

var url = require('url'),
    logger,
    Exchange,
    Channel,
    socketio = require('socket.io');

var IOWrapper = function(context, uri) {
    var that = this;

    var parsed = url.parse(uri);

    this.handlers = {};
    this.context = context;
    this.sockets = {};

    uri = uri.replace(/^socketio:/g, "http:");
    uri = uri.replace(/^socketios:/g, "https:");
    var httpService = this.context.getService('http'),
        httpWrapper = httpService.get(uri);

    this.io = socketio(httpWrapper.server);
    this.io.on('connection', function (socket) {
        logger.i('SOCKETIO:: connection established');
        that.context.sockets[socket.id] = socket;
        socket.on('disconnect', function() {
            console.log('SOCKETIO:: disconnected');
        });
    });
};

IOWrapper.prototype = {

    addHandler: function(pathname, eventName, handler) {
        this.handlers[pathname] = handler;
        var that = this;
        this.io.on('connection', function (socket) {
            socket.on(eventName, function(data) {
                var exchange = new Exchange();
                exchange.body = data;
                exchange.body.socket_id = socket.id;
                exchange.headers['socketio-session-id'] = socket.id;
                that.context.send(Channel.IN, handler, exchange, that);
            });
        });

    }

};

module.exports = function(yesbee) {

    logger = yesbee.logger;
    Exchange = yesbee.Exchange;
    Channel = yesbee.Channel;

    // dependencies: [
    //     'http',
    // ],
    this.handlers = {};
    this.servers = {};
    this.sockets = {};

    this.normalizePath = function(pathname) {
        pathname = pathname.trim();
        if (pathname === '/') {
            return pathname;
        }
        return pathname.replace(/\/+$/, '');
    };

    this.get = function(uri) {

        var that = this,
            parsed = url.parse(uri),
            pathname = parsed.pathname,
            ioWrapper = this.servers[pathname];

        if (!this.servers[pathname]) {
            ioWrapper = new IOWrapper(this, uri);
            this.servers[pathname] = ioWrapper;
        }

        return ioWrapper;
    };

    this.attach = function(uri, component) {
        var parsed = url.parse(uri);
        this.get(uri).addHandler(parsed.pathname || '/', component.options.eventName, component);
    };

    // this.detach = function(uri, component) {
    //     var parsed = url.parse(uri);
    //     this.get(uri).removeHandler(parsed.pathname || '/', component.options.eventName, component);
    // };

    this.getSocketById = function(id) {

        return this.sockets[id];
    };

    this.removeHandler = function(pathname, eventName, handler) {
        pathname = this.normalizePath(pathname);
        var existingHandler = this.servers[pathname];
        if (existingHandler === handler) {
            delete this.servers[pathname];
        }
        logger.i(this.context.id, 'delete handler ' + pathname + ' on ' + this.hostname + ':' + this.port);
    };
};