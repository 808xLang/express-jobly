const { sqlForPartialUpdate } = require("./sql")

describe("Checks to make sure data comes in correct", function() {
    test("works: data matches", function() {
        const result = sqlForPartialUpdate(
            { f1: "v1" },
            { f1: "f1", fF2: "f2" });
            expect(result).toEqual({
                setCols: "\"f1\"=$1",
                values: ["v1"],
              });
    })
})
