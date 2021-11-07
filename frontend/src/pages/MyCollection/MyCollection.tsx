import { parseLog } from "helpers/logs";
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
    const loadedNFTs: BigNumber[] = await parseLog<BigNumber>(
      filter,
      library,
      marketContract.interface,
      3
    );

    setNFTIds(loadedNFTs);
  }, [account, library, marketContract]);

  useEffect(() => {
    loadNFTs();
  }, [loadNFTs]);

  return (
    <div className="mb-4">
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
