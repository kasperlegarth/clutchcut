export function toCcFileUrl(absPath: string) {
  // sørg for leading slash og forward slashes
  let p = absPath.replace(/\\/g, "/");
  if (!p.startsWith("/")) p = "/" + p;
  return encodeURI(`cc-file://${p}`);
}