# meta-mapper

## About

Utility to copy properties from one `Object` to another based
on schema, which defines which properties should be mapped and how with runtime type check.

## Installation TBD

```shell
$ npm install --save
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
- runtime type check

## Usage

A schema object `key` is the final **destination** `value` is the `command` to pick element, modify and set to the **destination** object as the `value`.

### Base usage

```javascript
import { pick } from "../src/mapper.js";
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

  // Bypass property as is
  age: pick(),

  // Save with new key deep nested property
  userEmail: pick("contacts.email"),

  // Set deep property
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
  // Get object from src.info and map it with paginationSchema
  pagination: pick("info").apply(paginationSchema),
};

const result = convert(schema, src);
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
  edisodes: pick("results").applyEvery(episodeSchema),
};

const result = convert(schema, src);

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
  edisodes: pick("results").applyOnly(
    episodeSchema,
    // Element will be mapped when function returns true
    (episode) => episode.air_date === "December 9, 2013"
  ),
};

const result = convert(schema, src);

/*
{
  edisodes: [{ id: 2, name: "Lawnmower Dog" }],
}
*/
```

### Switch case
```javascript
const src = {
  person: {
    age: "child",
    favoriteCartoon: "Cars"
  }
}

const adultSchema = {
  media: pick("favoriteMovie")
}

const childSchema = {
  media: pick("favoriteCartoon")
}

const schema = {
  person: pick().applySwitchEvery(
    {
      adult: adultSchema,
      child: childSchema,
    },
    // Function returns key to get correct schema
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
  jobList: pick().applySwitchEvery(
    {
      true: previousEmploymentSchema,
      false: currentEmploymentSchema,
    },
    // Function returns key to get correct schema
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


