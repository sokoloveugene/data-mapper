export const toFullName = (name, surname) => {
  return `${name} ${surname}`;
};

export const upperCase = (value) => {
  return value?.toUpperCase();
};

export const toAge = (date) => {
  return new Date().getFullYear() - new Date(date).getFullYear();
};

export const timestamp = () => Date.now() * Math.random();

export const emptyToNull = (value) => (value === "" ? null : value);
