import { pick, convert } from "../src/mapper";

const src = {
  id: 1,
  calendar: [
    { day: 1, task: "Learn Math" },
    { day: 2, task: "Call mother" },
    { day: 3, task: "Write article" },
  ],
};

describe("Reduce", () => {
  test("into same key", () => {
    const schema = {
      id: pick(),
      calendar: pick().reduce((item) => `day-${item.day}`, {
        day: pick(),
        todo: pick("task"),
      }),
    };

    const expected = {
      id: 1,
      calendar: {
        "day-1": { day: 1, todo: "Learn Math" },
        "day-2": { day: 2, todo: "Call mother" },
        "day-3": { day: 3, todo: "Write article" },
      },
    };

    expect(convert(schema, src)).toEqual(expected);
  });

  test("with spread", () => {
    const schema = {
      id: pick(),
      "...": pick("calendar").reduce((item) => `day-${item.day}`, {
        todo: pick("task"),
      }),
    };

    const expected = {
      id: 1,
      "day-1": { todo: "Learn Math" },
      "day-2": { todo: "Call mother" },
      "day-3": { todo: "Write article" },
    };

    expect(convert(schema, src)).toEqual(expected);
  });
});
