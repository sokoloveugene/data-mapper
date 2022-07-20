import { pick, convert } from "../mapper";
import { toError } from "../utils";

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

  test("first level error", () => {
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

  test("nested level error", () => {
    const schema = {
      contacts: pick()
        .type("array")
        .apply({
          hasEmail: pick().type("string"),
          phone: pick().type("string"),
        }),
    };

    const expected = {
      contacts: "Expected array, Received object",
      "contacts.hasEmail": "Expected string, Received boolean",
      "contacts.phone": "Expected string, Received array",
    };

    expect(() => convert(schema, src)).toThrow(toError(expected));
  });

  test("optional types", () => {
    const schema = {
      name: pick("_userName_").type("string"),
      age: pick("_age_").type("?number"),
    };

    const expected = {
      _userName_: "Expected string, Received undefined",
    };

    expect(() => convert(schema, src)).toThrow(toError(expected));
  });

  test("union types", () => {
    const schema = {
      age: pick().type("string | number"),
    };

    expect(() => convert(schema, src)).not.toThrow();
  });

  test("union types error", () => {
    const schema = {
      age: pick().type("string | boolean"),
    };

    const expected = {
      age: "Expected string | boolean, Received number",
    };

    expect(() => convert(schema, src)).toThrow(toError(expected));
  });
});
