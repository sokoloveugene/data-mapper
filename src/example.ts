import { pick, convert } from ".";

const data = {
  name: "Bird",
  surname: "Ramsey",
  age: "23 years",
  gender: "male",
  company: "NIMON",
  contacts: {
    email: {
      primary: "birdramsey@nimon.com",
    },
  },
};

const schema = {
  id: pick<number>().fallback(null),
  fullName: pick("name", "surname").pipe(
    (name, surname) => `${name} ${surname}`
  ),
  age: pick().pipe((age) => Number.parseInt(age)),
  gender: pick()
    .pipe((gender: string) => gender.slice(0, 1))
    .pipe((gender: string) => gender.toUpperCase()),
  "details.company.name": pick("company").type(String),
  email: pick<string>("contacts.email.primary").fallback("No email"),
};

const output = convert({ schema, data });

/**
 * When generics are used or fallback type can be calculated
 * output properties will be types
 * path intellisense is also available
 */

/* id: number | null */
output.id
/* fullName: string */
output.fullName
/* age: number */
output.age
/* gender: string */
output.gender
/*  name: string */
output.details.company.name
/* email: string */
output.email

const output = {
  id: null,
  fullName: "Bird Ramsey",
  age: 23,
  gender: "M",
  details: { company: { name: "NIMON" } },
  email: "birdramsey@nimon.com",
};
