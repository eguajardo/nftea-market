import { Web3Storage } from "web3.storage/dist/bundle.esm.min.js";
import { NFTStorage } from "nft.storage";
import { Metadata } from "types/metadata";

// IMPORTANT: This token will be public and visible to anyone which is
// a major security risk. It's done this way just for test purposes
// and finish the hackathon on time to avoid having server-side code
export const web3storage = new Web3Storage({
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGVlZERFNzg2YTg1OTAwNTE3YzAxMzI5NjBiQzViMEI0NTUyMjA0NTEiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2MzU3MDY3NDIzNDUsIm5hbWUiOiJuZnRlYS5tYXJrZXQtdW5zYWZlLXRva2VuIn0.ynUHt1eaHWQ4Wx5edqYpMrwu27qo8R1sIlOahblbSrg",
});

// IMPORTANT: This token will be public and visible to anyone which is
// a major security risk. It's done this way just for test purposes
// and finish the hackathon on time to avoid having server-side code
export const nftStorage = new NFTStorage({
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDgyN2QyMkRFMEJFOGYzZDhDNzkxRkY2NWMzOEZkQTEyRjYxQzQ0NDUiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYzNTcwNjc1MDcwNiwibmFtZSI6Im5mdGVhLm1hcmtldC11bnNhZmUtdG9rZW4ifQ.YtXPPhHUh9MJL8Zbmu-4za9lYpcZAIO-hTmT9-zM1Es",
});

export const getJSONMetadata = async (
  uri: string
): Promise<Metadata | undefined> => {
  if (!uri) {
    return;
  }

  const path = uri.replace("ipfs://", "");
  const cid = path.slice(0, path.indexOf("/"));

  const res = await web3storage.get(cid);

  if (!res.ok) {
    console.error("Error retrieving JSON from IPFS", res);
    return;
  }

  const files: FileList = await res.files();

  const json: string = await new Promise((resolve, reject) => {
    var fr = new FileReader();
    fr.onload = () => {
      resolve(fr.result?.toString()!);
    };
    fr.onerror = reject;
    fr.readAsText(files[0]);
  });

  return JSON.parse(json) as Metadata;
};