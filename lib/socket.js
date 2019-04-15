const connections  = require('./common/connectionManager');
const DB = require('./shapes');

class Socket {
    constructor(connection) {
        this.socket = connection;
        connections.push(this);
        this.db = new DB();

        this.methods = {
            'add-room': this.addRoom.bind(this),
            'get-rooms': this.getRooms.bind(this),
            'set-room': this.setRoom.bind(this),
            'login': this.login.bind(this),
            'set-color': this.setColor.bind(this)
        }
    }

    init() {
        this.socket.on('message', this.execute.bind(this));
        this.socket.on('close', this.closeConnection.bind(this));
        this.socket.on('error', this.handleError.bind(this));
    }

    closeConnection() {
        connections.close(this)
    }

    handleError(err) {
        console.log(`Connection error for peer ${this.socket.remoteAddress} : ${err}`)
    }

    execute(message) {
        if (message.type !== 'utf8') return;

        const data = message.utf8Data.split(';');
        const method = data.shift();

        const exec = this.methods[method];

        if(!exec) {
            console.error(`Method ${method} is not defined`);
            return
        }

        exec(data);
    }

    send (data){
        this.socket.send(JSON.stringify(data), err => {
            if (err) console.error('send error: ' + err);
        });
    }

    async setColor (data) {
        const [room] = data;
        const newColor = await this.db.updateRoomColor(room);

        this.broadcast({
            cmd: 'set-color',
            data: {
                room: room,
                color: newColor
            }
        });
    };

    async getRooms() {
        const rooms = await this.db.getRooms();

        this.send({
            cmd: 'set-rooms',
            data: {
                ...rooms
            }
        })
    }

    async addRoom() {
        const roomName = await this.db.addRoom();
        const roomColor = await this.db.getRoomColor(roomName);

        this.broadcast({
            cmd: 'add-room',
            data: {
                room: roomName,
                color: roomColor
            }
        });
    }

    async login(data) {
        const [ userName, roomName ] = data;
        const currentRoom = await this.db.login(userName);

        if(!currentRoom && roomName) {
            this.db.setUserRoom(userName, roomName);
        }

        this.send({
            cmd: 'login',
            data: { currentRoom }
        });
    }

    setRoom(data) {
        const [userName, room] = data;
        if(!userName) return;

        this.db.setUserRoom(userName, room);
    }


    broadcast(data) {
        connections.broadcast(data);
    }

}

module.exports = Socket;
