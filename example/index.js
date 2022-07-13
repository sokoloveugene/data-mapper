import { pick, convert } from "../mapper.js";
import {
  toFullName,
  upperCase,
  toAge,
  timestamp,
  emptyToNull,
} from "./functions.js";
import { initial } from "./initial.js";

const languageSchema = {
  id: pick().fallback(timestamp),
  name: pick("short"),
};

const timestampSchema = {
  id: Date.now(),
  fullDate: pick("full"),
  short: pick(),
};

const defaultVersion = {
  type: "default subscription",
  hasAccess: false,
};

const proVersion = {
  type: "pro subscription",
  hasAccess: true,
};

const schema = {
  staticValue: "HELLO WORLD",
  empty: pick().pipe(emptyToNull),
  timestamp: pick().apply(timestampSchema),
  isAdmin: pick("user.isAdmin"),
  id: pick("user._id"),
  "info.fullName": pick("user.main.name", "user.main.surname")
    .pipe(toFullName, upperCase)
    .fallback(null),
  "info.age": pick("user.main.birth").pipe(toAge).fallback("not defined"),
  "country.from": pick("user.main.country.0.name").fallback(null),
  "info.languages.all": pick("langs").applyEach(languageSchema).fallback([]),
  "info.languages.cool": pick("langs")
    .applyOnly(languageSchema, (lang) => lang.short === "JS")
    .fallback([]),

  switchTest: pick("user.isAdmin").applySwitch(
    {
      true: proVersion,
      false: defaultVersion,
    },
    (isAdmin) => Boolean(isAdmin)
  ),
};

console.log(JSON.stringify(convert(schema, initial), null, 2));
