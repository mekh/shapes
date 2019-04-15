const WebSocketServer = require('websocket').server;
const http = require('http');

module.exports = (wsHost, wsPort, params = {}) => {
    const server = http.createServer((req, res) => {
        res.writeHead(404);
        res.end();
    });

    server.listen(wsPort, wsHost);

    return new WebSocketServer({
        httpServer: server,
        ...params
    });
};
