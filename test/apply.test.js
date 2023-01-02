import { convert, pick } from "../src";

const src = {
  info: {
    count: 51,
    pages: 3,
    next: "https://rickandmortyapi.com/api/episode?page=2",
    prev: null,
  },
  results: [
    {
      _id: 1,
      name: "Pilot",
      air_date: "December 2, 2014",
      episode: "S01E01",
      url: "https://rickandmortyapi.com/api/episode/1",
      created: "2017-11-10T12:56:33.798Z",
    },
    {
      _id: 2,
      name: "Lawnmower Dog",
      air_date: "December 9, 2013",
      episode: "S01E02",
      url: "https://rickandmortyapi.com/api/episode/2",
      created: "2017-11-10T12:56:33.916Z",
    },
  ],
};

describe("Apply", () => {
  test("reusable schema", () => {
    const paginationSchema = {
      nextAvailable: pick("next").pipe(Boolean),
      prevAvailable: pick("prev").pipe(Boolean),
      next: pick(),
      prev: pick(),
    };

    const schema = {
      pagination: pick("info").apply(paginationSchema),
    };

    const expected = {
      pagination: {
        nextAvailable: true,
        prevAvailable: false,
        next: "https://rickandmortyapi.com/api/episode?page=2",
        prev: null,
      },
    };

    expect(convert(schema, src)).toEqual(expected);
  });

  test("reusable schema for every element of array", () => {
    const episodeSchema = {
      id: pick("_id"),
      name: pick(),
    };

    const schema = {
      edisodes: pick("results").map(episodeSchema),
    };

    const expected = {
      edisodes: [
        { id: 1, name: "Pilot" },
        { id: 2, name: "Lawnmower Dog" },
      ],
    };

    expect(convert(schema, src)).toEqual(expected);
  });

  test("reusable schema for some element of array", () => {
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

    const expected = {
      edisodes: [{ id: 2, name: "Lawnmower Dog" }],
    };

    expect(convert(schema, src)).toEqual(expected);
  });
});
