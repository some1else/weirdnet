import { BlobReader, TextWriter, ZipReader } from "@zip.js/zip.js"
import { words as lorem_ipsum_words } from "./lorem_ipsum"

export const envBundle = import.meta.env.VITE_APP_WORDNET_BUNDLE

export async function decodeWords() {
  if (!envBundle) {
    return lorem_ipsum_words
  }

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
