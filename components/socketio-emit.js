/**
* socketio-emit.js components/socketio-emit.js
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
module.exports = {
    schedule: null,
    start: function() {
        this.constructor.prototype.start.apply(this, arguments);
    },

    stop: function() {
        this.constructor.prototype.stop.apply(this, arguments);
    },

    process: function(exchange) {

        if(!this.options.eventName) {
            throw new Error("Socketio need event name to emit event.");
        }

        var uri = this.uri.replace('socketio-emit', 'socketio');
        exchange.headers['socketio::session-id'] = exchange.headers['socketio::session-id'] || exchange.headers['http::socketio-session-id'] || null;
        var id = exchange.headers['socketio::session-id'];
        var socket = this.context.getService('socketio');

        socket.getSocketById(id).emit(this.options.eventName, exchange.body);
    }
};