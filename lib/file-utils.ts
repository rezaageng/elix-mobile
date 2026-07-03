export function getMimeTypeFromFilename(filename: string): string {
  const match = /\.\w+$/.exec(filename)
  return match ? `image/${match[0].slice(1)}` : "image/jpeg"
}
