import { convert, pick } from "../src";

const options = {
  context: {
    name: "John Dou",
    gender: null,
    email: "context@mail.com",
    hobbies: null,
  },
  contextPrefix: "$",
};

const src = {
  name: "Bird Ramsey",
  gender: "male",
  email: "john@mail.com",
  hobbies: {
    football: false,
    reading: false,
  },
};

describe("With context", () => {
  test("with context values", () => {
    const schema = {
      name: pick("$.name"),
    };

    const expected = {
      name: "John Dou",
    };

    expect(convert(schema, src, options)).toEqual(expected);
  });

  test("with context and current values", () => {
    const schema = {
      name: pick("$.name"),
      gender: pick(),
    };

    const expected = {
      name: "John Dou",
      gender: "male",
    };

    expect(convert(schema, src, options)).toEqual(expected);
  });

  test("pick both context and current values", () => {
    const schema = {
      emails: pick("email", "$.email").pipe((...all) => all),
    };

    const expected = {
      emails: ["john@mail.com", "context@mail.com"],
    };

    expect(convert(schema, src, options)).toEqual(expected);
  });

  test("pick both context and current values in any order", () => {
    const schema = {
      emails: pick("$.email", "email").pipe((...all) => all),
    };

    const expected = {
      emails: ["context@mail.com", "john@mail.com"],
    };

    expect(convert(schema, src, options)).toEqual(expected);
  });

  test("compare current with context values", () => {
    const isModified = (val1, val2) => val1 !== val2;

    const schema = {
      isEmailChanged: pick("email", "$.email").pipe(isModified),
    };

    const expected = {
      isEmailChanged: true,
    };

    expect(convert(schema, src, options)).toEqual(expected);
  });

  test("get full context when key is not specified", () => {
    const schema = {
      context: pick("$"),
    };

    const expected = {
      context: {
        name: "John Dou",
        gender: null,
        email: "context@mail.com",
        hobbies: null,
      },
    };

    expect(convert(schema, src, options)).toEqual(expected);
  });

  test("context value in pipe handler", () => {
    const schema = {
      "hobbies.football": pick("hobbies.football", "$.hobbies").pipe(
        (football, $hobbies) => {
          if (football || $hobbies) return football;
        }
      ),
      "hobbies.reading": pick("hobbies.reading", "$.hobbies").pipe(
        (reading, $hobbies) => {
          if (reading || $hobbies) return reading;
        }
      ),
      name: pick(),
    };

    const expected = {
      name: "Bird Ramsey",
    };

    expect(convert(schema, src, options)).toEqual(expected);
  });

  test("apply with context", () => {
    const fromBoolToString = (bool) => (bool ? "Y" : "N");

    const hobbiesSchema = {
      football: pick().pipe(fromBoolToString),
      reading: pick().pipe(fromBoolToString),
      hasChange: pick(
        "football",
        "reading",
        "$.hobbies.football",
        "$.hobbies.reading"
      ).pipe((football, reading, $football, $reading) => {
        return football !== $football || reading !== $reading;
      }),
    };

    const schema = {
      mappedHobbies: pick("hobbies").apply(hobbiesSchema),
    };

    const expected = {
      mappedHobbies: {
        football: "N",
        reading: "N",
        hasChange: true,
      },
    };

    expect(convert(schema, src, options)).toEqual(expected);
  });
});
