const {sqlForPartialUpdate} = require("./sql")

describe("partial update", () =>{
    test("update 1 item", () => {
        const result = sqlForPartialUpdate(
            {Name: "test1"},
            {Name: "name"});
        expect(result).toEqual({
            setCols: "\"name\"=$1",
            values: ["test1"]

        });
    });

    test("update 2 items", function () {
        const result = sqlForPartialUpdate(
            {Name: "test1", Age: 25},
            {Name: "name", Age: "age"});
        expect(result).toEqual({
            setCols: "\"name\"=$1, \"age\"=$2",
            values: ["test1", 25]

        });
      });
});