import { pick, convert } from "../src/index.js";
import { data } from "./data.js";

const teamSchema = {
  teamId: pick("id"),
  type: pick(),
  laps: pick().map({
    lapId: pick("id"),
    status: pick(),
    dayNum: pick(),
    users: pick().map({
      userId: pick("id"),
      avatar: pick(),
      isCaptain: pick(),
      "...": pick("days").reduce((day) => `day-${day.dayNum}`, {
        weight: pick(),
        weightUnit: pick(),
        delta: pick(),
      }),
    }),
  }),
};

const toTeam = (team) => convert(teamSchema, team);

console.log(JSON.stringify(toTeam(data), null, 2));
