import { pick, convert } from "../src/mapper.js";
import { data } from "./data.js";

const teamSchema = {
  teamId: pick("id"),
  type: pick(),
  laps: pick().applyEvery({
    lapId: pick("id"),
    status: pick(),
    dayNum: pick(),
    users: pick().applyEvery({
      userId: pick("id"),
      avatar: pick(),
      isCaptain: pick(),
      "...": pick("days").reduce((day) => `day-${day.dayNum}`, {
        weight: pick().type("number"),
        weightUnit: pick(),
        delta: pick(),
      }),
    }),
  }),
};

const toTeam = (team) => convert(teamSchema, team);

console.log(JSON.stringify(toTeam(data), null, 2));
