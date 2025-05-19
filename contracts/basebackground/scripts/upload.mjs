import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { readFileSync } from "fs";
import dotenv from "dotenv";
dotenv.config();

const sdk = ThirdwebSDK.fromPrivateKey(
  process.env.PRIVATE_KEY,
  "somnia",
  {
    clientId: process.env.CLIENT_ID,
  }
);

async function main() {
  const contract = await sdk.getContract("0x813d45aBED67d0e952c272291a43949CB0227660");
  
  // Upload images
  console.log("Uploading images...");
  const sunsetUri = await sdk.storage.upload(readFileSync("../assets/images/T_MoVI_BG_Sunset.png"));
  const borealUri = await sdk.storage.upload(readFileSync("../assets/images/T_MoVI_BG_Boreal.png"));
  const voidUri = await sdk.storage.upload(readFileSync("../assets/images/T_MoVI_BG_Void.png"));

  // Create metadata
  const metadata = [
    {
      name: "Sunset Background",
      description: "A common Masks of the Void background featuring a mystical sunset.",
      image: sunsetUri,
      attributes: [
        { trait_type: "Type", value: "Background" },
        { trait_type: "Rarity", value: "Common" }
      ]
    },
    {
      name: "Boreal Background",
      description: "A rare Masks of the Void background featuring ethereal boreal lights.",
      image: borealUri,
      attributes: [
        { trait_type: "Type", value: "Background" },
        { trait_type: "Rarity", value: "Rare" }
      ]
    },
    {
      name: "Void Background",
      description: "An epic Masks of the Void background featuring the mysterious void itself.",
      image: voidUri,
      attributes: [
        { trait_type: "Type", value: "Background" },
        { trait_type: "Rarity", value: "Epic" }
      ]
    }
  ];

  // Upload metadata for each token
  console.log("Setting metadata...");
  for (let i = 0; i < metadata.length; i++) {
    await contract.metadata.set(i, metadata[i]);
    console.log(`Set metadata for token ${i}`);
  }

  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
