import { pick, convert } from "../mapper";
import {toError} from "../utils"

const src = {
  name: "Bird Ramsey",
  age: 23,
  contacts: {
    hasEmail: true,
    email: "birdramsey@nimon.com",
    phone: ["537-21-34-121", "532-21-34-333"],
  },
  balance: null,
  picture: "http://placehold.it/32x32",
};


describe("Runtime type check", () => {
  test("all valid", () => {
    const schema = {
      name: pick().type("string"),
      age: pick().type("number"),
      contacts: pick()
        .type("object")
        .apply({
          hasEmail: pick().type("boolean"),
          email: pick().type("string"),
          phone: pick().type("array"),
        }),
      balance: pick().type("null"),
      picture: pick().type("any"),
    };

    expect(() => convert(schema, src)).not.toThrow();
  });

  test("fail first level", () => {
    const schema = {
      name: pick().type("object"),
      age: pick().type("string"),
      balance: pick().type("boolean"),
    };

    const expected = {
      name: "Expected object, Received string",
      age: "Expected string, Received number",
      balance: "Expected boolean, Received null",
    };

    expect(() => convert(schema, src)).toThrow(toError(expected));
  });
});
