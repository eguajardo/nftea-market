import { useCallback, useEffect, useState } from "react";
import { useEthers } from "@usedapp/core";
import { parseLogValue } from "helpers/logs";
import { useContract } from "hooks/useContract";
import StallGallery from "components/ui/StallGallery/StallGallery";
import { Container } from "react-bootstrap";
import { Market } from "types/typechain";

function Home() {
  const { library } = useEthers();
  const marketContract: Market = useContract<Market>("Market")!;
  const [stallIds, setStallsIds] = useState<string[]>([]);

  const loadStalls = useCallback(async () => {
    if (!library || !marketContract) {
      return;
    }

    const stallsFilter = marketContract.filters.StallRegistration();
    const loadedStalls = await parseLogValue<string>(
      stallsFilter,
      library,
      marketContract.interface,
      3
    );

    setStallsIds(loadedStalls);
  }, [library, marketContract]);

  useEffect(() => {
    loadStalls();
  }, [loadStalls]);

  return (
    <div className="mb-4">
      <div className="page-header page-header-xs">
        <Container className="mt-4">
          <h1 className="text-primary">Explore</h1>
        </Container>
      </div>
      <Container>{stallIds && <StallGallery stallIds={stallIds} />}</Container>
    </div>
  );
}

export default Home;
