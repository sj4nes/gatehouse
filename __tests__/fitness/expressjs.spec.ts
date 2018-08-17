// Fitness checks are nagging little things that ensure that the components you
// think that you are using are in fact available.
test(`Do we have ExpressJS`, () => {
    const express = require("express");
    expect(express).toBeDefined();
});
