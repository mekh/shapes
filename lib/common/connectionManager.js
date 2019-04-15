const connections = [];

module.exports = {
    push: connection => connections.push(connection),
    broadcast: data => connections.forEach(connection => connection.send(data)),
    close: connection => {
        const index = connections.indexOf(connection);
        if (index !== -1) connections.splice(index, 1);
    }
};
