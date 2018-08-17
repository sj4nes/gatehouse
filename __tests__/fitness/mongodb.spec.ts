// Fitness checks are nagging little things that ensure that the components you
// think that you are using are in fact available.
import * as mongodb from "mongodb";
test(`Do we have a workable MongoDB API?`, () => {
    expect(mongodb).toBeDefined();
});
test(`Do we have a working test database instance?`, (done) => {
    const cl = connectDatabase();
    disconnectDatabase();
    done();
});

let theMongoClient;

const connectDatabase = (cont?) => {
    const mongoDatabase = "mongodb://localhost:27017/gatehouse";
    const mongoOptions = {
        appname: "jest-mongodb.spec.ts",
    };
    theMongoClient = new mongodb.MongoClient(mongoDatabase, mongoOptions);
    expect(theMongoClient).toBeDefined();
    const connectionHandler = (err, client) => {
        expect(err).toBeFalsy();
        expect(client).toBeDefined();
        expect(client.isConnected()).toBe(true);
        if (cont) {
            cont();
        }
    };
    theMongoClient.connect(connectionHandler);
};

const disconnectDatabase = (cont?) => {
    // I'm not happy with these psuedo-fixtures but not every test needs a setup
    // and teardown here.
    theMongoClient.close();
    if (cont) {
        cont();
    }
};

test(`How about doing some kind of database work?`, (done) => {
    connectDatabase(() => {
        const db = theMongoClient.db("test_mongodb");
        expect(db).toBeDefined();
        disconnectDatabase();
        done();
    });
});

test(`How about doing some kind of collection work?`, (done) => {
    connectDatabase(() => {
        const db = theMongoClient.db("test_mongodb");
        expect(db).toBeDefined();
        const xyz = db.collection("xyz");
        expect(xyz).toBeDefined();
        disconnectDatabase();
        done();
    });
});
