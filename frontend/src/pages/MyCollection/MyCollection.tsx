import { useCallback, useEffect, useState } from "react";
import { useEthers } from "@usedapp/core";
import { useContract } from "hooks/useContract";
import { Market } from "types/typechain";
import { BigNumber } from "ethers";

import { Container } from "react-bootstrap";
import NFTGallery from "components/ui/NFTGallery/NFTGallery";

import "./style.scss";

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

  return (
    <div>
      <div className="page-header page-header-xs">
        <Container className="mt-4">
          <h1 className="text-primary">My collection</h1>
        </Container>
      </div>
      <Container>{nftIds && <NFTGallery nftsIds={nftIds} />}</Container>
    </div>
  );
}

export default MyCollection;
