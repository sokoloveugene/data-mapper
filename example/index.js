import { pick, convert } from "../mapper.js";
import { upperCase, parseDate, parseEpisode } from "./functions.js";
import { initial } from "./initial.js";

const paginationSchema = {
  nextAvailable: pick("next").pipe(Boolean),
  prevAvailable: pick("prev").pipe(Boolean),
  next: pick(),
  prev: pick(),
};

const episodeSchema = {
  id: pick(),
  type: "Episod",
  name: pick().pipe(upperCase).fallback("UNKNOWN"),
  date: pick("air_date").pipe(parseDate),
  season: pick("episode")
    .pipe((v) => parseEpisode(v)?.season)
    .fallback(null),
  episode: pick()
    .pipe((v) => parseEpisode(v)?.episode)
    .fallback(null),
  URL: pick("url"),
};

const rootSchema = {
  pagination: pick("info").apply(paginationSchema),
  episodes: pick("results").applyOnly(
    episodeSchema,
    (episode) => parseDate(episode.air_date)?.year > 2014
  ),
};

console.log(JSON.stringify(convert(rootSchema, initial), null, 2));
