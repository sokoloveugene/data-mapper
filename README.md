# meta-shape

## About

A tool that transfers properties from one object to another according to a schema, which outlines the properties that should be mapped and the manner in which they should be mapped, with a runtime type verification.

## Installation

```shell
$ npm install meta-shape
```

---

## How to Use

In a schema object, the "key" represents the final "destination," and the "value" is a "command" that selects data from "source", makes modifications, and sets it to the "destination" object as its "value."

### Base usage

```javascript
import { pick, convert } from "meta-shape";

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
```

### Apply reusable schema

|          | `.apply(schema)`      |
| -------- | --------------------- |
| `schema` | Schema to map element |

```javascript
const data = {
  info: {
    count: 51,
    pages: 3,
    next: "/api/episode?page=2",
    prev: null,
  },
};

const paginationSchema = {
  nextAvailable: pick("next").pipe(Boolean),
  prevAvailable: pick("prev").pipe(Boolean),
  next: pick(),
  prev: pick(),
};

const schema = {
  pagination: pick("info").apply(paginationSchema),
};

const output = convert({ schema, data });

const output = {
  pagination: {
    nextAvailable: true,
    prevAvailable: false,
    next: "/api/episode?page=2",
    prev: null,
  },
};
```

### Apply reusable schema for each element of array

|          | `.apply(schema).each()`             |
| -------- | ----------------------------------- |
| `schema` | Schema to map each element in array |

```javascript
const data = {
  results: [
    {
      _id: 1,
      name: "Pilot",
    },
    {
      _id: 2,
      name: "Lawnmower Dog",
    },
  ],
};

const episodeSchema = {
  id: pick("_id"),
  name: pick(),
};

const schema = {
  edisodes: pick("results").apply(episodeSchema).each(),
};

const output = convert({ schema, data });

const output = {
  edisodes: [
    { id: 1, name: "Pilot" },
    { id: 2, name: "Lawnmower Dog" },
  ],
};
```

### Apply schema for some elements in array

|          | `.apply(schema).each(filter)`                              |
| -------- | ---------------------------------------------------------- |
| `schema` | Schema to map element                                      |
| `filter` | A function that returns true when element should be mapped |

```javascript
const data = {
  results: [
    {
      _id: 1,
      name: "Pilot",
      air_date: "December 2, 2014",
    },
    {
      _id: 2,
      name: "Lawnmower Dog",
      air_date: "December 9, 2013",
    },
  ],
};

const episodeSchema = {
  id: pick("_id"),
  name: pick(),
};

const schema = {
  edisodes: pick("results")
    .apply(episodeSchema)
    .each((episode) => episode.air_date === "December 9, 2013"),
};

const output = convert({ schema, data });

const output = { edisodes: [{ id: 2, name: "Lawnmower Dog" }] };
```

### Switch case

|             | `.switch(schemaMap).case(keygen)`      |
| ----------- | -------------------------------------- |
| `schemaMap` | {type: schema} object                  |
| `keygen`    | A function that returns type of schema |

```javascript
const data = {
  person: {
    age: "child",
    favoriteCartoon: "Cars",
  },
};

const adultSchema = {
  media: pick("favoriteMovie"),
};

const childSchema = {
  media: pick("favoriteCartoon"),
};

const schema = {
  user: pick("person")
    .switch({
      adult: adultSchema,
      child: childSchema,
    })
    .case((person) => person.age),
};

const output = convert({ schema, data });

const output = { user: { media: "Cars" } };
```

### Switch case for each element in the list

|             | `.switch(schemaMap).case(keygen).each(filter)`     |
| ----------- | -------------------------------------------------- |
| `schemaMap` | {type: schema} object                              |
| `keygen`    | A function that returns type of schema             |
| `filter`    | Optional function to exclude elements from mapping |

```javascript
const data = {
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
  isActive: pick().fallback(false),
  company: pick(),
};

const currentEmploymentSchema = {
  isActive: pick().fallback(true),
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

const output = convert({ schema, data });

const output = {
  jobList: [
    { isActive: false, company: "Super Shops" },
    {
      isActive: true,
      activeFrom: "September 5, 2020",
      company: "Custom Lawn Care",
    },
  ],
};
```

### Runtime type transformation

|               | `.type(Constructor)`                                 |
| ------------- | ---------------------------------------------------- |
| `Constructor` | can be String, Number, Boolean or any other function |

```javascript
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
};

const schema = {
  name: pick(),
  gender: pick().type(String),
  age: pick().type(Number),
  contacts: pick().apply({
    email: pick().type(String),
    phone: pick("phone.0")
      .pipe((phone) => phone?.replace(/-/g, ""))
      .type(Number),
  }),
  balance: pick().type(Number),
  online: pick().type(Boolean),
};

const output = convert({ schema, data });

const output = {
  name: "Bird Ramsey",
  gender: "1",
  age: 23,
  contacts: { email: null, phone: 5372134121 },
  balance: NaN,
  online: false,
};
```

### Values can be picked from additional context "$"

```javascript
const data = {
  email: "john@mail.com",
};

const context = {
  email: "context@mail.com",
};

const schema = {
  isEmailChanged: pick("email", "$.email").pipe((val1, val2) => val1 !== val2),
};

const output = convert({ schema, data, context });

const output = { isEmailChanged: true };
```
