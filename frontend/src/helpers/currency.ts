import { BigNumber } from "ethers";

const STABLECOIN_DECIMALS: number = 6;
const FIAT_DECIMALS: number = 2;

export const fiatToStablecoin = (fiatAmount: BigNumber): BigNumber => {
  const additionalDecimals = STABLECOIN_DECIMALS - FIAT_DECIMALS;
  const stablecoinAmount = fiatAmount.mul(
    BigNumber.from(10).pow(additionalDecimals)
  );

  return stablecoinAmount;
};

export const stablecoinToFiat = (stablecoinAmount: number): number => {
  const fiatAmount = Math.round(
    stablecoinAmount / Math.pow(10, STABLECOIN_DECIMALS)
  );

  return fiatAmount;
};
