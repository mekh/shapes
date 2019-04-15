import Events from 'events';

const Emitter = new Events();

const wsHost = process.env.REACT_APP_WS_HOST;
const wsPort = process.env.REACT_APP_WS_PORT;

const ws = window['MozWebSocket'] ? window['MozWebSocket'] : window['WebSocket'];
const socket = new ws(`${wsHost}:${wsPort}`, 'shapes-protocol');

socket.onopen = () => {
    Emitter.emit('connected');
};

socket.onmessage = msg => {
    const { cmd, data } = JSON.parse(msg.data);

    Emitter.emit(cmd, data);
};

export {
    socket,
    Emitter
};
