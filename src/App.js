import React, { Component } from 'react';
import { socket, Emitter } from './websocket';

class App extends Component {
    state = {
        rooms: {},
        currentRoom: '',
        user: '',
        loggedIn: false
    };

    componentDidMount() {
        this.emitter = Emitter;
        this.socket = socket;

        this.emitter.on('connected', this.init);
    }

    init = () =>{
        this.emitter.on('set-color', this.setColor);
        this.emitter.on('set-rooms', this.setRooms);
        this.emitter.on('add-room', this.addRoom);
        this.emitter.on('login', data => this.setRoom(data.currentRoom));

        this.socket.send('get-rooms;');
    };

    setRooms = data => {
        this.setState({ rooms: data })
    };

    updateRoom = data => {
        const { room, color } = data;
        const rooms = { ...this.state.rooms};
        rooms[room] = color;

        this.setState({ rooms });
    };

    addRoom = data => {
        if(!data) { // user has clicked the 'Add room' button
            this.socket.send('add-room;');
            return
        }

        this.updateRoom(data);
    };

    setColor = data => {
        if(!data) { // user has clicked a shape
            const { currentRoom } = this.state;
            this.socket.send('set-color;' + currentRoom);
            return
        }

        this.updateRoom(data)
    };

    setRoom = currentRoom => {
        if(!currentRoom) {
            return
        }

        const { user } = this.state;

        this.socket.send(`set-room;${user};${currentRoom}`);
        this.setState({ currentRoom })
    };

    logIn = e => {
        e.preventDefault();
        const { user, currentRoom } = this.state;
        if(!user) return;
        this.setState({ loggedIn: true });

        this.socket.send(`login;${user};${currentRoom}`)
    };

    logOut = e => {
        e.preventDefault();
        this.setState({ user: '', loggedIn: false })
    };


    handleInput = e => {
        const { value } = e.target;
        this.setState({ user: value });
    };

    render() {
        const { user, loggedIn, rooms, currentRoom } = this.state;
        const currentColor = rooms[currentRoom];

        return (
            <div className="container">
                { loggedIn ?
                    <div className="form-row align-items-center">
                        <div className="col-11">
                            <h4 style={{ marginBottom: 20, marginTop: 20 }}>Logged in as {user}</h4>
                        </div>
                        <div className="col">
                            <button className="btn btn-primary" onClick={this.logOut}>Log out</button>
                        </div>
                    </div>
                    :
                    <form onSubmit={this.logIn}>
                        <div className="form-row align-items-center">
                            <div className="col-11">
                                <input
                                    className="form-control my-3"
                                    placeholder="Enter your name"
                                    onChange={this.handleInput}
                                    value={user}
                                />
                            </div>
                            <div className="col-auto">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={!user}
                                >
                                    { loggedIn ? 'Logout' : 'Login' }
                                </button>
                            </div>
                        </div>
                    </form>
                }
                <div className="row">
                    <div className="col-3">
                        <button
                            className="btn btn-secondary"
                            onClick={() => this.addRoom()}
                            style={{ marginBottom: 20 }}
                        >
                            Add room
                        </button>

                        <ul className="list-group">
                            {Object.keys(rooms).map(room => (
                                <li
                                    onClick={() => this.setRoom(room)}
                                    key={room}
                                    className={
                                        room === currentRoom ? "list-group-item active" : "list-group-item"
                                    }
                                >
                                    {room}
                                </li>
                            ))}
                        </ul>
                    </div>
                        <div className="col align-middle text-center">
                            {currentRoom ?
                                <svg height="100" width="100">
                                    <circle cx="50" cy="50" r="40" fill={currentColor} onClick={() => this.setColor()}/>
                                </svg>
                                :
                                <h2>Select a Room</h2>
                            }
                        </div>
                </div>
            </div>
        );
    }
}

export default App;
