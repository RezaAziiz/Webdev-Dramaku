import { buildGenreIds, filterAndSortMedia } from "./discover";

describe("genre-specific catalog filtering", () => {
  const genres = [
    { id: 28, name: "Action", movieId: 28, tvId: null },
    { id: 10759, name: "Action & Adventure", movieId: null, tvId: 10759 },
  ];

  it("uses the matching media type's action genre ID", () => {
    expect(buildGenreIds(["Action"], genres, "movie")).toBe("28");
    expect(buildGenreIds(["Action"], genres, "tv")).toBe("10759");
  });

  it("includes TMDB Animation titles in the Anime catalog", () => {
    const results = filterAndSortMedia({
      source: [
        { id: 1, title: "Animated series", type: "tv", genre: ["Animation"] },
        { id: 2, title: "Drama", type: "tv", genre: ["Drama"] },
      ],
      selectedType: "anime",
      selectedGenres: [],
      appliedFilters: {},
      selectedSort: "relevance",
      term: "",
    });

    expect(results.map((item) => item.title)).toEqual(["Animated series"]);
  });
});
