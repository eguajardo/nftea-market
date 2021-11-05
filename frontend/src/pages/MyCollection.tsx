import { useCallback, useEffect, useState } from "react";
import { useEthers } from "@usedapp/core";
import { useContract } from "hooks/useContract";
import { Market } from "types/typechain";
import { BigNumber } from "ethers";

import NFTGallery from "components/ui/NFTGallery/NFTGallery";

function MyCollection() {
  const [nftIds, setNFTIds] = useState<BigNumber[]>();
  const { account, library } = useEthers();
  const marketContract: Market = useContract<Market>("Market")!;

  const loadNFTs = useCallback(async () => {
    if (!library || !marketContract) {
      return;
    }

    const filter = marketContract.filters.NFTPurchase(account);
    console.log("filter", filter);

    const logs = await library.getLogs({
      ...filter,
      fromBlock: 21063861,
      toBlock: await library.getBlockNumber(),
    });

    console.log("logs", logs);
    const loadedNFTs: BigNumber[] = [];
    logs.forEach((log) => {
      loadedNFTs.push(marketContract.interface.parseLog(log).args[3]);
    });

    setNFTIds(loadedNFTs);
  }, [account, library, marketContract]);

  useEffect(() => {
    loadNFTs();
  }, [loadNFTs]);

  return <div>{nftIds && <NFTGallery nftsIds={nftIds} />}</div>;
}

export default MyCollection;
