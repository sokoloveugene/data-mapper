# meta-shape

## About

Utility to copy properties from one `Object` to another based
on schema, which defines which properties should be mapped and how with runtime type check.

## Installation

```shell
$ npm install meta-shape
```

---

## Available features

- set static value
- bypass property as is
- set default value (can be function)
- modify property with functions before set
- apply reusable schema
- apply schema for each element in array
- apply schema for some elements in array
- switch case
- switch case for every item in array
- spread object
- reduce list to map
- runtime type transformation
- generate ts interface from mapping schema (getInterface function)

## Usage

A schema object `key` is the final **destination** `value` is the `command` to pick element, modify and set to the **destination** object as the `value`.

### Base usage

```javascript
import { pick } from "meta-shape";
import { v4 as uuidv4 } from "uuid";

const src = {
  name: "Bird",
  surname: "Ramsey",
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

const schema = {
  // Define static value
  type: "User schema",

  // Bypass property and ensure that value is number (runtime)
  age: pick().type(Number),

  // Create property userEmail from deep nested property contacts.email
  userEmail: pick("contacts.email").type(String),

  // Create deep property
  "details.company": pick("company"),

  // Set default value as 0
  id: pick().fallback(0),

  // Call function to get default value
  uuid: pick().fallback(uuidv4),

  // Get value and modify with function
  gender: pick().pipe((gender) => gender.toUpperCase()),

  // Get multiple values to calculate result
  fullName: pick("name", "surname").pipe(
    (name, surname) => `${name} ${surname}`
  ),

  // Modify value with functions one by one
  phone: pick("contacts.phone").pipe(
    (phoneList) => phoneList.map((phoneItem) => `+${phoneItem}`),
    (phoneList) => phoneList.join(" or ")
  ),
};

const result = convert(schema, src);

/*
{
  type: "User schema",
  age: 23,
  userEmail: "birdramsey@nimon.com",
  details: {
    company: "NIMON",
  },
  id: 0,
  uuid: "c52c83f0-09ec-11ed-861d-0242ac120002",
  gender: "MALE",
  fullName: "Bird Ramsey",
  phone: "+537-21-34-121 or +532-21-34-333",
}
*/
```

### Apply reusable schema

|          | `.apply(schema)`      |
| -------- | --------------------- |
| `schema` | Schema to map element |

```javascript
const src = {
  info: {
    count: 51,
    pages: 3,
    next: "https://rickandmortyapi.com/api/episode?page=2",
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
{
  pagination: {
    nextAvailable: true,
    prevAvailable: false,
    next: "https://rickandmortyapi.com/api/episode?page=2",
    prev: null,
  }
}
*/
```

### Apply reusable schema for every element of array

|          | `.map(schema)`                       |
| -------- | ------------------------------------ |
| `schema` | Schema to map every element in array |

```javascript
const src = {
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
  edisodes: pick("results").map(episodeSchema),
};

/*
{
  edisodes: [
    { id: 1, name: "Pilot" },
    { id: 2, name: "Lawnmower Dog" },
  ],
}
*/
```

### Apply schema for some elements in array

|            | `.mapWhen(schema, function)`                               |
| ---------- | ---------------------------------------------------------- |
| `schema`   | Schema to map element                                      |
| `function` | A function that returns true when element should be mapped |

```javascript
const src = {
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
  edisodes: pick("results").mapWhen(
    episodeSchema,
    (episode) => episode.air_date === "December 9, 2013"
  ),
};

/*
{
  edisodes: [{ id: 2, name: "Lawnmower Dog" }],
}
*/
```

### Switch case

|             | `.switch(schemaMap, function)`         |
| ----------- | -------------------------------------- |
| `schemaMap` | {type: schema} object                  |
| `function`  | A function that returns type of schema |

```javascript
const src = {
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
  person: pick().switch(
    {
      adult: adultSchema,
      child: childSchema,
    },
    (person) => person.age
  ),
};

/*
{
  media: "Cars"
}
*/
```

### Switch case for every item in the list

|             | `.switchMap(schemaMap, function)`      |
| ----------- | -------------------------------------- |
| `schemaMap` | {type: schema} object                  |
| `function`  | A function that returns type of schema |

```javascript
const src = {
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
  jobList: pick().switchMap(
    {
      true: previousEmploymentSchema,
      false: currentEmploymentSchema,
    },
    (employment) => Boolean(employment.end)
  ),
};

/*
{
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
}
*/
```

### Spread object

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
