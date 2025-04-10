export const safeStringify = (obj: any, indent = 2) => {
  let cache: any = [];
  const retVal = JSON.stringify(
    obj,
    (_, value) =>
      typeof value === 'object' && value !== null
        ? cache.includes(value)
          ? undefined // duplicate reference found, discard key
          : cache.push(value) && value // store value in our collection
        : value,
    indent,
  );
  cache = null;
  return retVal;
};
