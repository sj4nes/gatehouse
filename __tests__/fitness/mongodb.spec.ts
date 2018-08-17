// Fitness checks are nagging little things that ensure that the components you
// think that you are using are in fact available.
import * as mongodb from "mongodb";
test(`Do we have a workable MongoDB API?`, () => {
    expect(mongodb).toBeDefined();
});
