// Konverter lokal filsti til en korrekt file:// URL (Windows/macOS/Linux)
export function toFileUrl(absPath: string) {
  // Normalisér backslashes (Windows) og encode specialtegn i stien
  let path = absPath.replace(/\\/g, "/");
  // På Windows har stier ofte et drive-letter "C:" → bevar det
  if (!path.startsWith("/")) path = `/${path}`;
  return encodeURI(`file://${path}`);
}
