const isJsonString = (string) => {
  try {
    JSON.parse(string);
  } catch {
    return false;
  }
  return true;
};

export default isJsonString;
