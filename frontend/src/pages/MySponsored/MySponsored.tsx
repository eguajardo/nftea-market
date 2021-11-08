import { parseLog } from "helpers/logs";
import { useCallback, useEffect, useState } from "react";
import { useEthers } from "@usedapp/core";
import { useContract } from "hooks/useContract";
import { Market, SponsorshipEscrow } from "types/typechain";
import { BigNumber } from "ethers";

import { Container } from "react-bootstrap";
import NFTGallery from "components/ui/NFTGallery/NFTGallery";

import "./style.scss";

function MySponsored() {
  const [nftClasses, setNFTClasses] = useState<BigNumber[]>();
  const { account, library } = useEthers();
  const marketContract: Market = useContract<Market>("Market")!;
  const escrowContract: SponsorshipEscrow =
    useContract<SponsorshipEscrow>("SponsorshipEscrow")!;

  const loadNFTs = useCallback(async () => {
    if (!library || !marketContract) {
      return;
    }

    const depositsFilter = escrowContract.filters.Deposit(null, account);
    const sponsorshipsIds: BigNumber[] = await parseLog<BigNumber>(
      depositsFilter,
      library,
      escrowContract.interface,
      0
    );

    const loadedNFTs: BigNumber[] = [];
    for (const id of sponsorshipsIds) {
      const filter = marketContract.filters.SponsoredNFT(null, id);
      const [sponsorshipClass] = await parseLog<BigNumber>(
        filter,
        library,
        marketContract.interface,
        0
      );

      loadedNFTs.push(sponsorshipClass);
    }

    setNFTClasses(loadedNFTs);
  }, [account, library, marketContract, escrowContract]);

  useEffect(() => {
    loadNFTs();
  }, [loadNFTs]);

  return (
    <div className="mb-4">
      <div className="page-header page-header-xs">
        <Container className="mt-4">
          <h1 className="text-primary">My sponsored NFTs</h1>
        </Container>
      </div>
      <Container>
        {nftClasses && (
          <NFTGallery
            nftsIds={nftClasses.map((nftClass: BigNumber) => nftClass.shl(128))}
          />
        )}
      </Container>
    </div>
  );
}

export default MySponsored;
