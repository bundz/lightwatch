const os = require('os');
const mongo = require('mongodb').MongoClient;
const format = require('util').format;

class Lightwatch {

    constructor(config) {
        this.config = config;
        this.config.database.url = `${this.config.database.address}:${this.config.database.port}/${this.config.database.name}`;
    };

    start() {

        const log = {};
        log.cpu = this.getCpuUsage();
        log.memory = this.getMemoryUsage();
        log.date = Date.now();


        this.saveLog(log);

    };

    getCpuUsage() {

        const cpu = {
            used: 0,
        };

        cpu.cores = [];
        const cpus = os.cpus();

        for(let core of cpus) {

            const used = core.times.user + core.times.nice + core.times.sys + core.times.irq;
            const total = used + core.times.idle;

            cpu.cores.push({
                user: core.times.user,
                nice: core.times.nice,
                sys: core.times.sys,
                idle: core.times.sys,
                irq: core.times.irq,
                used: used/total
            });

            cpu.used += used/total;

        }

        cpu.used = cpu.used / cpu.cores.length;

        return cpu;
    };

    getMemoryUsage() {

        const memory = {
            total: os.totalmem(),
            free: os.freemem()
        };

        memory.used = memory.total - memory.free;
        memory.percentage =  {
            used: memory.used / memory.total,
            free: memory.free / memory.total
        };

        return memory;

    };

    connectToMongo(next) {

        const user = encodeURIComponent(this.config.database.user);
        const password = encodeURIComponent(this.config.database.password);
        const authMechanism = 'DEFAULT';

        // Connection URL
        const url = format(`mongodb://%s:%s@localhost:${this.config.database.port}/${this.config.database.name}?authMechanism=%s`,
        user, password, authMechanism);

        // Use connect method to connect to the Server
        mongo.connect(url, function(err, db) {

            if(err) {
                throw `Error: Failed to connect to database`;
            }

            return next(db);

        });

    }

    saveLog(log) {

        this.connectToMongo(function (db) {

            const logs = db.collection('logs');


            logs.insert(log, function (err, result) {

                if(err) {
                    throw `Error: Failed to insert document in database`;
                }

                db.close();

            });

        });

    }
}

module.exports = Lightwatch;