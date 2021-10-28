import { contracts } from "../../helpers/contracts";
import { useEthers, getChainName } from "@usedapp/core";
import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

function WrongNetworkAlert() {
  const { chainId } = useEthers();
  const [networkError, setNetworkError] = useState(false);

  useEffect((): void => {
    if (!chainId) {
      return;
    }
    const chainName =
      getChainName(chainId).toLowerCase() === "hardhat"
        ? "localhost"
        : getChainName(chainId).toLowerCase();
    console.log("chainName:", chainName);

    if (!contracts[chainName]) {
      setNetworkError(true);
    } else {
      setNetworkError(false);
    }
  }, [chainId]);

  return (
    <div>
      {networkError && (
        <Alert variant="danger" className="text-center mb-0">
          <span className="mr-2">
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </span>
          <span>
            Unsupported chain, make sure you are connected to a supported
            network
            <span className="ml-2 font-weight-bold">
              {Object.keys(contracts).filter(
                (network) => network !== "localhost"
              )}
            </span>
          </span>
        </Alert>
      )}
    </div>
  );
}

export default WrongNetworkAlert;
