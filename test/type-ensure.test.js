import { convert, pick } from "../src";

const data = {
  name: "Bird Ramsey",
  gender: 1,
  age: "23",
  contacts: {
    email: null,
    phone: ["537-21-34-121", "532-21-34-333"],
  },
  balance: "$3,946.45",
  online: 0,
  cardNumber: "",
};

describe("Normalize types", () => {
  test("Boolean String Number", () => {
    const contactSchema = {
      email: pick().type(String),
      phone: pick("phone.0")
        .pipe((phone) => phone?.replace(/-/g, ""))
        .type(Number),
    };

    const schema = {
      name: pick(),
      gender: pick().type(String),
      age: pick().type(Number),
      contacts: pick().apply(contactSchema),
      balance: pick().type(Number),
      online: pick().type(Boolean),
      cardNumber: pick().type(Number),
    };

    const expected = {
      name: "Bird Ramsey",
      gender: "1",
      age: 23,
      contacts: {
        email: null,
        phone: 5372134121,
      },
      balance: NaN,
      online: false,
      cardNumber: 0,
    };

    expect(convert({ schema, data })).toEqual(expected);
  });
});
