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

const input = {
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

/*
const output = {
  id: null,
  fullName: "Bird Ramsey",
  age: 23,
  gender: "M",
  details: {
    company: {
      name: "NIMON",
    },
  },
  email: "birdramsey@nimon.com",
}
*/

const schema = {
  id: pick().fallback(null),

  fullName: pick("name", "surname").pipe(
    (name, surname) => `${name} ${surname}`
  ),

  age: pick().pipe((age) => Number.parseInt(age)),

  gender: pick()
    .pipe((gender) => gender.slice(0, 1))
    .pipe((gender) => gender.toUpperCase()),

  "details.company.name": pick("company"),

  email: pick("contacts.email.primary"),
};

const output = convert(schema, input);
```

### Apply reusable schema

|          | `.apply(schema)`      |
| -------- | --------------------- |
| `schema` | Schema to map element |

```javascript
const input = {
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

/*
const output = {
  pagination: {
    nextAvailable: true,
    prevAvailable: false,
    next: "/api/episode?page=2",
    prev: null,
  },
};
*/
```

### Apply reusable schema for each element of array

|          | `.apply(schema).each()`             |
| -------- | ----------------------------------- |
| `schema` | Schema to map each element in array |

```javascript
const input = {
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

/*
const output = {
  edisodes: [
    { id: 1, name: "Pilot" },
    { id: 2, name: "Lawnmower Dog" },
  ],
};
*/
```

### Apply schema for some elements in array

|          | `.apply(schema).each(filter)`                              |
| -------- | ---------------------------------------------------------- |
| `schema` | Schema to map element                                      |
| `filter` | A function that returns true when element should be mapped |

```javascript
const input = {
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

/*
const output = {
  edisodes: [{ id: 2, name: "Lawnmower Dog" }],
};
*/
```

### Switch case

|             | `.switch(schemaMap).case(keygen)`      |
| ----------- | -------------------------------------- |
| `schemaMap` | {type: schema} object                  |
| `keygen`    | A function that returns type of schema |

```javascript
const input = {
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

/*
const output = {
  user: {
    media: "Cars",
  },
};
*/
```

### Switch case for each element in the list

|             | `.switch(schemaMap).case(keygen).each(filter)`     |
| ----------- | -------------------------------------------------- |
| `schemaMap` | {type: schema} object                              |
| `keygen`    | A function that returns type of schema             |
| `filter`    | Optional function to exclude elements from mapping |

```javascript
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

/*
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
*/
```

### Spread object

 TODO update README section

```javascript
const src = {
  contacts: {
    email: "birdramsey@nimon.com",
    phone: ["537-21-34-121", "532-21-34-333"],
  },
  user: {
    info: {
      name: "John",
      surname: "Dou",
    },
  },
};

const schema = {
  // When key starts with "..." spread feature is enabled
  "...": pick("contacts"),
  // Multiple spread features should have unique index at the end
  "...2": pick("user.info"),
};

/*
{
  email: "birdramsey@nimon.com",
  phone: ["537-21-34-121", "532-21-34-333"],
  name: "John",
  surname: "Dou"
}
*/
```

### Reduce list to map

|            | `.reduce(function, schema)`            |
| ---------- | -------------------------------------- |
| `function` | A function to be invoked to create key |
| `schema`   | A schema to map element                |

```javascript
const src = {
  id: 1,
  calendar: [
    { day: 1, task: "Learn Math" },
    { day: 2, task: "Call mother" },
    { day: 3, task: "Write article" },
  ],
};

const schema = {
  id: pick(),
  "...": pick("calendar").reduce((item) => `day-${item.day}`, {
    todo: pick("task"),
  }),
};

/*
{
  id: 1,
  "day-1": { todo: "Learn Math" },
  "day-2": { todo: "Call mother" },
  "day-3": { todo: "Write article" },
}
*/
```

### Runtime type transformation

|               | `.type(Constructor)`           |
| ------------- | ------------------------------ |
| `Constructor` | can be String, Number, Boolean |

```javascript
const src = {
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

/*
Feature is also available in child schemas for methods .map, switch, apply, switchMap...
{
  // No runtime type check
  name: "Bird Ramsey",

  // Ensure that gender is string value
  gender: "1",

  // Convert age to number
  age: 23,

  contacts: {
    // Try to convert email to string, if NOT null or undefined
    email: null,
    phone: 5372134121,
  },

  // If result of number tranformation is NaN skip field
  balance: undefined,

  // Ensure value is boolean
  online: false,
}
*/
```

### Generate ts interface from mapping schema

|                 | `getInterface(schema, interfaceName, exported)` |
| --------------- | ----------------------------------------------- |
| `schema`        | schema to generate types from                   |
| `interfaceName` | name for interface, default is SchemaType       |
| `exported`      | should interface be exported, default is false  |

```javascript
const schema = {
  type: "User schema",

  age: pick(),

  userEmail: pick("contacts.email").type(String),

  "details.company.info": pick("company")
    .type(String)
    .fallback("no company info"),

  "details.age": pick("company").type(String).fallback("no company info"),

  uuid: pick().type(Number),

  id: pick().type(Number).fallback(0),

  gender: pick()
    .pipe((gender) => gender?.toUpperCase())
    .type(String),

  pagination: pick("info").apply({
    nextAvailable: pick("next").type(Boolean).fallback(false),
    "deep.prevAvailable": pick("prev").type(Boolean).fallback(false),
    next: pick().type(String),
    prev: pick().type(String),
    "...": pick("nestedSpread"),
  }),

  edisodes: pick("results").map({
    id: pick("_id"),
    name: pick().fallback("no name").type(String),
  }),

  person: pick().switch(
    {
      adult: adultSchema,
      child: childSchema,
    },
    (person) => person.age
  ),

  jobList: pick().switchMap(
    {
      true: {
        isActive: pick().fallback(false).type(Boolean),
        company: pick(),
      },
      false: {
        isActive: pick().fallback(true).type(Boolean),
        activeFrom: pick("start").type(String),
        company: pick(),
      },
    },
    (employment) => Boolean(employment.end)
  ),

  "...": pick("contacts"),

  "...2": pick("contact2"),
};

import { getInterface } from "meta-shape";

console.log(getInterface(exampleSchema, "UserForm", true));

/*
export interface UserForm {
  type?: any;
  age?: unknown;
  userEmail?: string;
  details?: { company?: { info: string }; age: string };
  uuid?: number;
  id: number;
  gender?: string;
  pagination?: {
    nextAvailable: boolean;
    deep?: { prevAvailable: boolean };
    next?: string;
    prev?: string;
    [property: string]: any;
  };
  edisodes?: Array<{ id?: unknown; name: string }>;
  person?: { media: number } | { media?: boolean };
  jobList?: Array<
    | { isActive: boolean; company?: unknown }
    | { isActive: boolean; activeFrom?: string; company?: unknown }
  >;
  [property: string]: any;
}
*/
```
