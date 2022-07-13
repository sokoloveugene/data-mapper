export const upperCase = (value) => {
  return value?.toUpperCase();
};

export const parseDate = (dateString) => {
  if (!dateString) return;
  const date = new Date(dateString);
  return {
    year: date.getFullYear(),
    date: date.getDate(),
    month: date.getMonth() + 1,
  };
};

export const parseEpisode = (episodeString) => {
  if (!episodeString) return;
  const [S, season, E, episode] = episodeString.split(/(S|E)/).filter(Boolean);
  return {
    season,
    episode,
  };
};

export const length = (list) => {
  if (!Array.isArray(list)) return;
  return list.length;
};
