import { pick, convert } from "../mapper";

const src = {
  name: "Bird Ramsey",
  gender: "male",
  position: "Developer",
  company: "NIMON",
  age: 23,
  contacts: {
    email: "birdramsey@nimon.com",
    phone: ["537-21-34-121", "532-21-34-333"],
  },
  balance: "$3,946.45",
  picture: "http://placehold.it/32x32",
};

describe("Pick", () => {
  test("with no parameter bypass property", () => {
    const schema = {
      name: pick(),
      gender: pick(),
    };

    const expected = {
      name: "Bird Ramsey",
      gender: "male",
    };

    expect(convert(schema, src)).toEqual(expected);
  });

  test("rename same level property", () => {
    const schema = {
      userName: pick("name"),
      worksAt: pick("company"),
    };

    const expected = {
      userName: "Bird Ramsey",
      worksAt: "NIMON",
    };

    expect(convert(schema, src)).toEqual(expected);
  });

  test("get nested property", () => {
    const schema = {
      email: pick("contacts.email"),
      mainPhone: pick("contacts.phone.0"),
    };

    const expected = {
      email: "birdramsey@nimon.com",
      mainPhone: "537-21-34-121",
    };

    expect(convert(schema, src)).toEqual(expected);
  });

  test("set nested property", () => {
    const schema = {
      "mainInfo.contacts.email": pick("contacts.email"),
      "mainInfo.contacts.phone": pick("contacts.phone"),
    };

    const expected = {
      mainInfo: {
        contacts: {
          email: "birdramsey@nimon.com",
          phone: ["537-21-34-121", "532-21-34-333"],
        },
      },
    };

    expect(convert(schema, src)).toEqual(expected);
  });

  test("skip not existing property", () => {
    const schema = {
      hobbie: pick(),
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
      hobbie: pick().fallback("unknown"),
    };

    const expected = {
      hobbie: "unknown",
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
});
