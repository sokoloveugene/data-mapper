import { convert, pick } from "../src";

const input = {
  jobList: [
    {
      start: "October 2, 2019",
      end: "July 10, 2021",
      company: "Super Shops",
    },
    {
      start: "September 5, 2020",
      end: null,
      company: "Custom Lawn Care",
    },
  ],
};

const previousEmploymentSchema = {
  isActive: false,
  company: pick(),
};

const currentEmploymentSchema = {
  isActive: true,
  activeFrom: pick("start"),
  company: pick(),
};

const schema = {
  jobList: pick()
    .switch({
      true: previousEmploymentSchema,
      false: currentEmploymentSchema,
    })
    .case((employment) => Boolean(employment.end))
    .each(),
};

const output = {
  jobList: [
    {
      isActive: false,
      company: "Super Shops",
    },
    {
      isActive: true,
      activeFrom: "September 5, 2020",
      company: "Custom Lawn Care",
    },
  ],
};
test("a", () => {
  expect(convert(schema, input)).toEqual(output);
});
