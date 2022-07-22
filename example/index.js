import { pick, convert } from "../src/mapper.js";
import { upperCase, parseDate, parseEpisode, length } from "./functions.js";

const paginationSchema = {
  nextAvailable: pick("next").pipe(Boolean),
  prevAvailable: pick("prev").pipe(Boolean),
  next: pick(),
  prev: pick(),
};

const episodeSchema = {
  id: pick(),
  type: "Episode",
  name: pick().type("?string").pipe(upperCase).fallback("UNKNOWN"),
  date: pick("air_date").type("string").pipe(parseDate),
  season: pick("episode")
    .type("string")
    .pipe((v) => parseEpisode(v)?.season)
    .fallback(null),
  episode: pick()
    .type("string")
    .pipe((v) => parseEpisode(v)?.episode)
    .fallback(null),
  URL: pick("url"),
  numberOfCharacters: pick("characters").pipe(length),
};

const rootSchema = {
  pagination: pick("info").type("object").apply(paginationSchema),
  episodes: pick("results")
    .type("array")
    .applyOnly(
      episodeSchema,
      (episode) => parseDate(episode.air_date)?.year === 2013
    ),
};

console.log(JSON.stringify(convert(rootSchema, initial), null, 2));
