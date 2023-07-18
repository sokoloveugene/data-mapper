import { convert, pick } from "../src";

const src = {
  name: "Bird Ramsey",
  position: "Developer",
  company: "NIMON",
  age: 23,
  contacts: {
    email: "birdramsey@nimon.com",
    phone: ["537-21-34-121", "532-21-34-333"],
  },
};

describe("Pick", () => {
  test("with no parameter bypass property", () => {
    const schema = {
      name: pick(),
    };

    const expected = {
      name: "Bird Ramsey",
    };

    expect(convert(schema, src)).toEqual(expected);
  });

  test("rename same level property", () => {
    const schema = {
      userName: pick("name"),
    };

    const expected = {
      userName: "Bird Ramsey",
    };

    expect(convert(schema, src)).toEqual(expected);
  });

  test("get nested property", () => {
    const schema = {
      mainPhone: pick("contacts.phone.0"),
    };

    const expected = {
      mainPhone: "537-21-34-121",
    };

    expect(convert(schema, src)).toEqual(expected);
  });

  test("set nested property", () => {
    const schema = {
      "mainInfo.contacts.phone": pick("contacts.phone"),
    };

    const expected = {
      mainInfo: {
        contacts: {
          phone: ["537-21-34-121", "532-21-34-333"],
        },
      },
    };

    expect(convert(schema, src)).toEqual(expected);
  });

  test("skip not existing property", () => {
    const schema = {
      hobby: pick(),
      age: pick(),
    };

    const expected = {
      age: 23,
    };

    expect(convert(schema, src)).toEqual(expected);
  });
});

describe("Fallback", () => {
  test("as primitive", () => {
    const schema = {
      hobby: pick().fallback("unknown"),
    };

    const expected = {
      hobby: "unknown",
    };

    expect(convert(schema, src)).toEqual(expected);
  });

  test("as complex data stucture", () => {
    const schema = {
      hobbies: pick().fallback(["tennis", "programming"]),
    };

    const expected = {
      hobbies: ["tennis", "programming"],
    };

    expect(convert(schema, src)).toEqual(expected);
  });

  test("as function", () => {
    const uuid = () => "a3918ac8-03a8-11ed-b939-0242ac120002";

    const schema = {
      id: pick().fallback(uuid),
    };

    const expected = {
      id: "a3918ac8-03a8-11ed-b939-0242ac120002",
    };

    expect(convert(schema, src)).toEqual(expected);
  });
});

describe("Pipe", () => {
  const toJob = (position, company) => `Works at ${company} as ${position}`;
  const toUpperCase = (str) => str.toUpperCase();

  test("one function", () => {
    const schema = {
      job: pick("position", "company").pipe(toJob),
    };

    const expected = {
      job: "Works at NIMON as Developer",
    };

    expect(convert(schema, src)).toEqual(expected);
  });

  test("multiple functions", () => {
    const schema = {
      job: pick("position", "company").pipe(toJob, toUpperCase),
    };

    const expected = {
      job: "WORKS AT NIMON AS DEVELOPER",
    };

    expect(convert(schema, src)).toEqual(expected);
  });

  test("multiple pipes", () => {
    const schema = {
      job: pick("position", "company").pipe(toJob).pipe(toUpperCase),
    };

    const expected = {
      job: "WORKS AT NIMON AS DEVELOPER",
    };

    expect(convert(schema, src)).toEqual(expected);
  });
});
