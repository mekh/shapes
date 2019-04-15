# Installation
```
# Seed the database
$ psql -d <DB_NAME> -a -f db.sql

# Install dependencies
$npm i

# Set the environment variables
$ export WS_HOST=ws.example.com \
         WS_PORT=4000 \
         PGHOST=pg.example.com \
         PGPORT=5432 
         PGUSER=user \
         PGPASSWORD=123 \
         PGDATABASE=test
         
# Start the WebSocket Server
$ node index.js

# Optionally: start the React-app dev server
$ export REACT_APP_WS_HOST=wss://ws.example.com \
         REACT_APP_WS_POST=443

$ npm start

```

## Environment variables
### WebSocket server configuration
- WS_HOST - **required** - the host on which the WebSocket will be listening
- WS_PORT - **required** - the port on which the WebSocket will be listening

### PostgreSQL configuration
See [node-postgres](https://node-postgres.com/features/connecting) documentation for more details.

- PGDATABASE - optional, default is **process.env.USER**
- PGHOST - optional, default is **localhost**
- PGPORT - optional, default **5432**
- PGUSER - optional, default is **process.env.USER**
- PGPASSWORD - optional, default is **null**

### React-app configuration
- REACT_APP_WS_HOST - **required** - The WebSocket server's address the client should connect to
- REACT_APP_WS_PORT - **required** - The WebSocket server's port

_REACT_APP_WS_HOST should be defined with either **ws://** or **wss://** prefix!_
