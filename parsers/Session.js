class Session {
    constructor(id, sessionType, capacity, time, subgroup, room) {
        this.id = id;
        this.sessionType = sessionType;
        this.capacity = capacity;
        this.time = time;
        this.subgroup = subgroup;
        this.room = room;
    }
}

module.exports = Session;