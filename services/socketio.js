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