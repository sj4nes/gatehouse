// Fitness checks are nagging little things that ensure that the components you
// think that you are using are in fact available.
import * as mongodb from "mongodb";
test(`Do we have a workable MongoDB API?`, () => {
    expect(mongodb).toBeDefined();
});
test(`Do we have a working test database instance?`, () => {
    const mongoDatabase = "mongodb://localhost:27017/gatehouse";
    const mongoOptions = {
        appname: "jest-mongodb.spec.ts",
    };
    const theMongoClient = new mongodb.MongoClient(mongoDatabase, mongoOptions);
    expect(theMongoClient).toBeDefined();
});
