const Database = require('./common/database');

class Shapes extends Database {
    getRooms() {
        const sql =
            'SELECT A.room,B.color FROM rooms AS A ' +
            'LEFT JOIN colors AS B ' +
            'ON A.color = B.id ' +
            'ORDER BY A.id';

        return new Promise((resolve, reject) => {
            this.query(sql, (err, res) => {
                if(err) reject(err);
                resolve(res.rows.reduce((a,r) => {
                    // [ { room: 'room1', color: 'red' }, { room: 'room2', color: 'blue' } ]
                    // =>
                    // { room1: 'red', room2: blue }
                    return Object.assign(a, {[r.room]: r.color})
                }, {}))
            })
        });
    }

    getColors() {
        return this
            .select('colors')
            .col('color')
            .order('id')
    }

    getRoomColor(room) {
        const sql =
            'SELECT A.room,B.color FROM rooms AS A ' +
            'LEFT JOIN colors AS B ' +
            'ON A.color = B.id WHERE A.room = $1';

        return new Promise((resolve, reject) => {
            this.query(sql, [room], (err, res) => {
                if(err) reject(err);
                resolve(res.rows[0].color)
            })
        });
    }

    getUserRoom(user) {
        const sql =
            'SELECT A.name,B.room FROM users AS A ' +
            'LEFT JOIN rooms AS B ' +
            'ON A.room = B.id WHERE A.name = $1';

        return new Promise((resolve, reject) => {
            this.query(sql, [user], (err, res) => {
                if(err) reject(err);
                resolve(res.rows[0].room)
            })
        });
    }

    async setUserRoom(user, room) {
        const roomId = await this.select('rooms').where({ room }).fields(['id']).value();
        const sql = 'UPDATE users SET room = $2 WHERE name = $1';

        return new Promise((resolve, reject) => {
            this.query(sql, [user, roomId], (err, res) => {
                if(err) reject(err);
                resolve(res)
            })
        });

    }

    async updateRoomColor(room) {
        const colors = await this.getColors();
        const currentColor = await this.select('rooms').where({ room }).fields(['color']).value();
        const nextColor = (currentColor + 1) % (colors.length + 1) || 1;

        const sql = `UPDATE rooms SET color = $1 WHERE room = $2`;

        return new Promise((resolve, reject) => {
            this.query(sql, [nextColor, room], (err, res) => {
                if(err) reject(err);
                resolve(colors[nextColor - 1])
            })
        });
    }

    addRoom(name) {
        return new Promise(async (resolve, reject) => {
            if(!name) {
                const count = await this.select('rooms').count();
                name = `room${count + 1}`;
            }

            this.insert('rooms', ['room'], [name], (err, res) => {
                if(err) reject(err);
                resolve(name)
            })
        })
    }

    login(user) {
        const sql =
            'INSERT INTO users(name) VALUES($1) '  +
            'ON CONFLICT (name) DO NOTHING';

        return new Promise((resolve, reject) => {
            this.query(sql, [user], async (err, res) => {
                if(err) reject(err);
                resolve(await this.getUserRoom(user))
            })
        })
    }
}

module.exports = Shapes;
