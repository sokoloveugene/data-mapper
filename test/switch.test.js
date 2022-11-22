import { convert, pick } from "../src";

const src = {
  employment: {
    start: "October 2, 2019",
    end: "July 10, 2021",
    company: "Super Shops",
    occupation: "Information security specialist",
  },
};

const src2 = {
  employment: {
    start: "September 5, 2020",
    end: null,
    company: "Custom Lawn Care",
    occupation: "Human resources administrative assistant",
  },
};

const src3 = {
  list: [src.employment, src2.employment],
};

describe("Switch", () => {
  const previousEmploymentSchema = {
    isActive: false,
    company: pick(),
    occupation: pick(),
  };

  const currentEmploymentSchema = {
    isActive: true,
    from: pick("start"),
    company: pick(),
    occupation: pick(),
  };

  test("for one item", () => {
    const schema = {
      job: pick("employment").switch(
        {
          true: previousEmploymentSchema,
          false: currentEmploymentSchema,
        },
        (employment) => Boolean(employment.end)
      ),
    };

    const expected = {
      job: {
        isActive: false,
        company: "Super Shops",
        occupation: "Information security specialist",
      },
    };

    const expected2 = {
      job: {
        isActive: true,
        from: "September 5, 2020",
        company: "Custom Lawn Care",
        occupation: "Human resources administrative assistant",
      },
    };

    expect(convert(schema, src)).toEqual(expected);
    expect(convert(schema, src2)).toEqual(expected2);
  });

  test("for every item in the list", () => {
    const schema = {
      list: pick().applySwitchEvery(
        {
          true: previousEmploymentSchema,
          false: currentEmploymentSchema,
        },
        (employment) => Boolean(employment.end)
      ),
    };

    const expected = {
      list: [
        {
          isActive: false,
          company: "Super Shops",
          occupation: "Information security specialist",
        },
        {
          isActive: true,
          from: "September 5, 2020",
          company: "Custom Lawn Care",
          occupation: "Human resources administrative assistant",
        },
      ],
    };

    const res = convert(schema, src3);
    expect(res).toEqual(expected);
  });
});
