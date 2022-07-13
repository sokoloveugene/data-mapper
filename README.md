## Convert data using schema

---
## Available features
### Static value

```
{
  staticValue: "HELLO WORLD"
}
```
### Property bypass
```
{
  id: pick()
}
```
### Default value
```
{
  id: pick().fallback(null)
}
```

### Default value as function
```
import { v4 as uuidv4 } from 'uuid';

{
  id: pick().fallback(uuidv4)
}
```

### Modify property with function(s)
```
{
  fullName: pick("user.main.name", "user.main.surname")
    .pipe(toFullName, upperCase)
    .fallback(null)
}
```

### Apply nested schema
```
const timestampSchema = {
  fullDate: pick("full"),
  short: pick(),
};

{
  timestamp: pick().apply(timestampSchema)
}
```
### Apply nested schema to each element of list
```
import { v4 as uuidv4 } from 'uuid';

const languageSchema = {
  id: pick().fallback(uuidv4),
  name: pick("short"),
};

{
  "info.languages.all": pick("langs")
    .applyEach(languageSchema)
    .fallback([])
}
```

### Apply nested schema conditionally for list of values

```
import { v4 as uuidv4 } from 'uuid';

const languageSchema = {
  id: pick().fallback(uuidv4),
  name: pick("short"),
};

{
  "info.languages.all": pick("langs")
    .applyWhen(languageSchema, (lang) => lang.short === "JS"))
    .fallback([])
}
```
