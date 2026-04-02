export async function downloadZip(source, filename) {
  let blob;

  if (source instanceof Response) {
    blob = await source.blob();
  } else if (source instanceof Blob) {
    blob = source;
  } else {
    throw new Error("Invalid source for downloadZip: must be Blob or Response");
  }

  const zipBlob = new Blob([blob], { type: "application/zip" });
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
