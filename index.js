const WebSocketRouter = require('websocket').router;
const WebSocketServer = require('./lib/common/websocketServer');
const Socket = require('./lib/socket');

const wsHost = process.env.WS_HOST;
const wsPort = process.env.WS_PORT;

const wsServer = WebSocketServer(wsHost, wsPort);
const router = new WebSocketRouter();

router.attachServer(wsServer);

const originIsAllowed = origin => {
    // check whether the specified origin is allowed
    return true;
};

router.mount('*', 'shapes-protocol', req => {
    if(!originIsAllowed(req.origin)) {
        req.reject();
        return
    }

    const connection = req.accept(req.origin);
    const socket = new Socket(connection);
    socket.init();
});
