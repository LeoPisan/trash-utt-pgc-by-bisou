class EDT {
    constructor(name, sessions = []) {
        this.name = name;
        this.sessions = Array.isArray(sessions) ? sessions : [sessions];
    }
}

module.exports = EDT;