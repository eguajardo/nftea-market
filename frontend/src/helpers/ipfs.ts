import { Web3Storage } from "web3.storage/dist/bundle.esm.min.js";
import { NFTStorage, toGatewayURL } from "nft.storage";
import { Metadata } from "types/metadata";
import { FileWithPath } from "file-selector";
import IPFS from "ipfs-api";

const GATEWAY = new URL("https://infura-ipfs.io/");

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

export const ipfs = new IPFS({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

const cache = new Map();

export const uploadFile = async (
  file: FileWithPath | File
): Promise<string> => {
  const fileCid = await web3storage.put([file]);
  const uri = `ipfs://${fileCid}/${file.name}`;

  console.log("Uploaded file to web3.storage", uri);
  return uri;
};

export const uploadJSONMetadata = async (json: Metadata): Promise<string> => {
  console.log("Uploading metadata JSON");
  const metadataBlob = new Blob([JSON.stringify(json)]);

  const filename = "metadata.json";
  const files = [new File([metadataBlob], filename)];
  const metadataCid = await web3storage.put(files);
  const uri = `ipfs://${metadataCid}/${filename}`;

  console.log("Uploaded metadata JSON", uri, json);
  return uri;
};

// Retrieving directly from web3.storage it's too slow, need to come back later to this
// export const getJSONMetadata = async (uri: string): Promise<Metadata> => {
//   console.log("Retrieving metadata JSON", uri);

//   const path = uri.replace("ipfs://", "");
//   const cid = path.slice(0, path.indexOf("/"));

//   const res = await web3storage.get(cid);

//   if (!res.ok) {
//     console.error("Error retrieving JSON from IPFS", res);
//     throw new Error(res);
//   }

//   const files: FileList = await res.files();

//   const text: string = await new Promise((resolve, reject) => {
//     var fr = new FileReader();
//     fr.onload = () => {
//       resolve(fr.result?.toString()!);
//     };
//     fr.onerror = reject;
//     fr.readAsText(files[0]);
//   });

//   const json = JSON.parse(text) as Metadata;
//   json.image = toHTTP(json.image);
//   json.headerImage = toHTTP(json.headerImage);

//   console.log("Retrieved metadata JSON", cid, json);

//   return json;
// };

export const getJSONMetadata = async (uri: string): Promise<Metadata> => {
  console.log("Retrieving metadata JSON", uri);

  const path = uri.replace("ipfs://", "");

  let ipfsMessage = cache.get(path);
  if (ipfsMessage) {
    console.log(`IPFS message ${path} retrieved from cache:`, ipfsMessage);
  } else {
    const utf8decoder = new TextDecoder();
    ipfsMessage = utf8decoder.decode(await ipfs.cat(path));
    cache.set(path, ipfsMessage);
  }

  const json = JSON.parse(ipfsMessage) as Metadata;
  json.image = toHTTP(json.image);
  json.headerImage = toHTTP(json.headerImage);

  console.log("Retrieved metadata JSON", path, json);

  return json;
};

export const toHTTP = (ipfsUri: string | undefined): string | undefined => {
  return ipfsUri
    ? toGatewayURL(ipfsUri, { gateway: GATEWAY }).toString()
    : ipfsUri;
};
