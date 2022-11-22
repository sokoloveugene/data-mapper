import { convert, pick } from "../src";

const src = {
  user: {
    name: "Bird Ramsey",
    job: {
      position: "Developer",
      company: "NIMON",
    },
  },
  contacts: {
    email: "birdramsey@nimon.com",
    phone: ["537-21-34-121", "532-21-34-333"],
  },
};

describe("Spread", () => {
  test("first level", () => {
    const schema = {
      "...": pick("contacts").apply({
        email: pick(),
        phones: pick("phone"),
      }),
    };

    const expected = {
      email: "birdramsey@nimon.com",
      phones: ["537-21-34-121", "532-21-34-333"],
    };

    expect(convert(schema, src)).toEqual(expected);
  });

  test("second level", () => {
    const schema = {
      "...": pick("user").apply({
        "...": pick("job").apply({
          position: pick(),
          company: pick(),
        }),
      }),
    };

    const schema2 = {
      "...": pick("user.job").apply({
        position: pick(),
        company: pick(),
      }),
    };

    const expected = {
      position: "Developer",
      company: "NIMON",
    };

    expect(convert(schema, src)).toEqual(expected);
    expect(convert(schema2, src)).toEqual(expected);
  });

  test("spread from two sources", () => {
    const schema = {
      "...": pick("user.job").apply({
        position: pick(),
        company: pick(),
      }),
      "...2": pick("contacts").apply({
        email: pick(),
        phones: pick("phone"),
      }),
    };

    const expected = {
      position: "Developer",
      company: "NIMON",
      email: "birdramsey@nimon.com",
      phones: ["537-21-34-121", "532-21-34-333"],
    };

    expect(convert(schema, src)).toEqual(expected);
  });
});
