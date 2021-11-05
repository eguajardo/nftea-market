# NFTea.market

NFTea.market allows fans to support content creators and engage with them by collecting and sponsoring their NFTs with the possibility of getting royalties in return. Instead of supporting creators by getting them a coffee, buy an NFTea from them.

## About

Indie content creators are constantly investing time finding new ways to have more visibility, interact with their audience and get more income streams, all of that while still managing to make progress with their creations. Current web3 platforms allow creators to mint their own NFTs to generate new income streams but they are far behind web2 applications like Patreon, buymeacoffee or ko-fi in providing the right tools and incentives to promote the content and engage with the audience.

NFTea.market allows fans to support content creators and engage with them by collecting and sponsoring their NFTs with the possibility of getting royalties in return. Instead of supporting creators by getting them a coffee, buy an NFTea from them. Content creators will be able to open a stand in the market generating a unique link which can be posted in their social networks or publishing platforms to attract NFT collectors and sponsors to their profile, which they are potentially a different set of their current audience than the ones that already support them using web2 platforms. Any user will be able to donate directly to the creator using a Polygon wallet with 0% comission similarly like it's done by ko-fi with the extra benefit that the transaction cost is almost free compared to web2 payment processor fees, however the platform's objective will be to sell NFTs done by the content creators for a small comission. They can create the NFTs with very low effort given than most of their content is digital and can be republished in the platform already making the onboarding process easier. Another benefit of the platform is the possibility to generate sponsored NFTs, which means users can publish an ad specifying a target amount to raise, how the money will be used and a % of the NFT sales that will be distributed proportionally to the users that became sponsors, this creates a mutual benefit between content creators and sponsors which additionally incentivises sponsors to promote the creator's work outside of the platform to increase sales.

## Environment

First we install the dependencies

```
npm install
```

Create a .env file in the root folder with the following variables and replace the values with your test blockchain accounts private keys. It's recommended to use different accounts than the ones you use for mainnet.

```
TESTNET_ACCOUNT_1=[private key 1]
TESTNET_ACCOUNT_2=[private key 2]
TESTNET_ACCOUNT_3=[private key 3]
TESTNET_ACCOUNT_4=[private key 4]
TESTNET_ACCOUNT_5=[private key 5]
```

<br />
<br />

## Run and deploy

First we install the dependencies

```
yarn
```

### 1) Start local node (Skip step if running in testnet or mainet)

Run the following to start a local node fork of mumbai polygon testnet

```
npx hardhat node
```

The terminal will display some accounts which you can use to import them to Metamask for testing

### 2) Smart contract deployment

The following command will deploy the smart contracts to the node started in step 1. Replace "localhost" for "mumbai" to deploy to Mumbai testnet

```
npx hardhat run scripts/deploy.ts --network localhost
```

### 3) Start React app

To run the local server to serve the react application, run the following commands

```
# Navigate to frontend app
cd frontend
yarn start
```

## ToDos

- IMPORTANT web3.storage and nft.storage API keys are not really secret. Any API key must be an environment variable in server-side code. Any react environment variable will include the key in the build and be visible to anyone. See https://create-react-app.dev/docs/adding-custom-environment-variables/
- Currently the front end is hardcoded to use the testnet stablecoin currency deployed in step 2 of `Run and deploy`. Before deploying to mainnet, some configuration would be required to set the right stablecoin contract, e.g. USDC
- Hardhat network fork and smart contract logs retrieval use a hardcoded blocknumber as origin. This functionality should be changed in the future before going mainnet to use something like The Graph

---

> Project built using [BLK• Design System PRO React](https://www.creative-tim.com/product/blk-design-system-pro-react) theme from Creative Tim.
