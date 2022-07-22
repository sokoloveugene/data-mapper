# meta-mapper

## About

Utility to copy properties from one `Object` to another based
on schema, which defines which properties should be mapped and how.

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
- runtime type check

## Usage

A schema object `key` is the final **destination** `value` is the `command` to pick element, modify and set to the **destination** object as the `value`.

### Static value

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
