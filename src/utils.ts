export const kebabize = (str: string) =>
  str.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    ($, ofs) => (ofs ? "-" : "") + $.toLowerCase()
  );

export const camelize = (s: string) =>
  s.replace(/-./g, (x) => x[1]!.toUpperCase());
