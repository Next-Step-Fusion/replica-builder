export async function dataUrlToBlob(dataUrl: string) {
  return (await fetch(dataUrl)).blob();
}
