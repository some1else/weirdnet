import { BlobReader, TextWriter, ZipReader } from "@zip.js/zip.js"

const envBundle =
  "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"

export async function decodeWords() {
  const decodedZip = atob(envBundle)
  const byteArray = new Uint8Array(decodedZip.length)
  for (let i = 0; i < decodedZip.length; i++) {
    byteArray[i] = decodedZip.charCodeAt(i)
  }
  const blob = new Blob([byteArray], { type: "application/octet-stream" })
  const blobReader = new BlobReader(blob)
  const zipReader = new ZipReader(blobReader)
  const entries = await zipReader.getEntries()
  const firstEntry = entries[0]
  const textWriter = new TextWriter()
  const text = await firstEntry.getData(textWriter)
  const remainder = text.substring(513, 19854)
  await zipReader.close()

  return remainder.split(",")
}
