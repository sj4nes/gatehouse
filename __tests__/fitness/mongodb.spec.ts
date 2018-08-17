// Fitness checks are nagging little things that ensure that the components you
// think that you are using are in fact available.
import * as mongodb from "mongodb";
test(`Do we have a workable MongoDB API?`, () => {
    expect(mongodb).toBeDefined();
});
test(`Do we have a working test database instance?`, () => {
    const cl = connectDatabase();
    disconnectDatabase();
});

let theMongoClient;

const connectDatabase = () => {
    const mongoDatabase = "mongodb://localhost:27017/gatehouse";
    const mongoOptions = {
        appname: "jest-mongodb.spec.ts",
    };
    theMongoClient = new mongodb.MongoClient(mongoDatabase, mongoOptions);
    expect(theMongoClient).toBeDefined();
    const connectionHandler = (err, client) => {
        expect(err).toBeFalsy();
        expect(client).toBeDefined();
    };
    theMongoClient.connect(connectionHandler);
};

const disconnectDatabase = () => {
    // I'm not happy with these psuedo-fixtures but not every test needs a setup
    // and teardown here.
    theMongoClient.close();
};

test(`How about doing some kind of collection work?`, () => {
    connectDatabase();
    disconnectDatabase();
});
