// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "./MultiToken.sol";

/**
 * @title Market
 * @notice Contract handling stalls and purchases
 */
contract Market is Context {

    uint256 public constant PAYMENT_MAX_SHARES = 100000000;

    uint256 public constant PLATFORM_COMISSION_SHARES = 5000000;

    /**
     * @notice Minimum price in the fiat currency's smallest denomination
     * e.g. 100 to represent 1 USD
     */
    uint8 public constant MINIMUM_NFT_PRICE_FIAT = 100;

    /**
     * @notice ERC-1155 token contract handling the NFTs for sale
     */
    MultiToken public tokenContract;

    /**
     * @notice ERC-20 stablecoin token contract used for purchases
     */
    IERC20 public stablecoin;

    /**
     * @dev Decimals of fiat currency for price conversion with stablecoins
     */
    uint8 private FIAT_DECIMALS = 2;

    /**
     * @dev Decimals of the stablecoin for price conversion
     */
    uint8 private stablecoinDecimals;

    /**
     * @dev Mapping of vendor addresses to their stall name
     */
    mapping (address => string) private _stallNames;

    /**
     * @dev Mapping of stall name to it's owner
     */
    mapping (string => address) private _vendors;

    /**
     * @dev Mapping of stall names to their metadata URI
     */
    mapping (string => string) private _uris;

    /**
     * @dev Mapping of stall names to an array of the token classes for sale
     */
    mapping (string => uint128[]) private _stallTokens;

    /**
     * @dev Mapping of the token class to it's price
     */
    mapping (uint128 => uint256) private _tokenPrices;

    /**
     * @dev Mapping of token class to it's stall where is sold
     */
    mapping (uint128 => string) private _tokenStalls;

    /**
     * @dev Mapping of stall to it's payment splitter
     */
    mapping (string => PaymentSplitter) private _stallPaymentSplitters;

    /**
     * @notice Emitted when the sender `vendor` registers a stall with the
     * name `stallName` and metadata URI `uri`
     */
    event StallRegistration(address indexed vendor, string indexed stallName, string indexed uri);

    /**
     * @notice Initialize contract and the NFT token contract
     * @param stablecoin_ The stablecoin contract address used as currency
     * @param stablecoinDecimals_ Amount of decimals used by the stablecoin
     */
    constructor (IERC20 stablecoin_, uint8 stablecoinDecimals_) {
        tokenContract = new MultiToken("NFTea.market", "NFTEA");
        stablecoin = stablecoin_;
        stablecoinDecimals = stablecoinDecimals_;
    }

    /**
     * @dev Modifier that checks the sender is a registered vendor
     */
    modifier onlyVendor() {
        require(_vendorRegistered(_msgSender()), "Market: account is not a registered vendor");
        _;
    }

    /**
     * @notice Returns the address of the ERC1155 contract address
     */
    function tokenContractAddress() external view returns (address) {
        return address(tokenContract);
    }

    /**
     * @notice Returns the URI corresponding to `stallName_`
     * @param stallName_ Stall name whose URI is being queried
     * @return the URI pointing to the stall's metadata
     */
    function uri(string calldata stallName_) external view returns (string memory) {
        require(stallNameTaken(stallName_), "Market: unregistered stall name");

        return _uris[stallName_];
    }

    /**
    * @notice Register an NFT stall for the sender address with the specified
    * `stallName_` and metadata `uri_`.
    * @param stallName_ A unique string representing the stall name. In 
    * order to render properly in the client application the `stallName_` must 
    * comply with the specifications for URL paths. See 
    * https://datatracker.ietf.org/doc/html/rfc3986#section-3.3
    * @param uri_ The URI pointing to the stall metadata, e.g. 
    * "ipfs://[CID]/metadata.json"
    */
    function registerStall(string calldata stallName_, string calldata uri_) external {
        require(bytes(stallName_).length > 0, "Market: empty stall name");
        require(bytes(uri_).length > 0, "Market: empty metadata URI");
        require(!_vendorRegistered(_msgSender()), "Market: account already owns a stall");
        require(!stallNameTaken(stallName_), "Market: stall name already taken");

        _stallNames[_msgSender()] = stallName_;
        _uris[stallName_] = uri_;
        _vendors[stallName_] = _msgSender();

        address[] memory payees = new address[](2);
        payees[0] = address(this);
        payees[1] = _msgSender();

        uint256[] memory shares = new uint256[](2);
        shares[0] = PLATFORM_COMISSION_SHARES;
        shares[1] = PAYMENT_MAX_SHARES - PLATFORM_COMISSION_SHARES;

        _stallPaymentSplitters[stallName_] = new PaymentSplitter(payees, shares);

        emit StallRegistration(_msgSender(), stallName_, uri_);
    }

    /**
     * @notice Creates and posts a new token for sale
     * @param uri_ The token metadata's URI
     * @param supply_ Max supply for the token. Zero if the supply is unlimited
     * @param price_ The token's price. Must be >= than `MINIMUM_NFT_PRICE_FIAT`
     * value is in the fiat smallest denomination, e.g. 100 equals 1 USD
     */
    function postTokenForSale(
        string memory uri_, 
        uint128 supply_,
        uint256 price_
    ) external onlyVendor {
        require(
            price_ >= MINIMUM_NFT_PRICE_FIAT, 
            string(abi.encodePacked(
                "Market: price less than ", 
                Strings.toString(MINIMUM_NFT_PRICE_FIAT),
                " cents")));

        string memory stallName = vendorStallName(_msgSender());
        uint128 class = tokenContract.registerClass(uri_, supply_, _msgData());

        _stallTokens[stallName].push(class);
        _tokenPrices[class] = price_;
        _tokenStalls[class] = stallName;
    }

    function buyToken(
        uint128 class_//, 
        // bytes32 nonce_, 
        // uint8 v_, 
        // bytes32 r_, 
        // bytes32 s_
    ) external {
        require(bytes(_tokenStalls[class_]).length > 0, "Market: unregistered token class");

        stablecoin.transferFrom(
            _msgSender(),
            address(_stallPaymentSplitters[_tokenStalls[class_]]),
            _fiatToStablecoin(_tokenPrices[class_])
        );

        tokenContract.mint(_msgSender(), class_, _msgData());
    }

    /**
     * @notice Returns the list of token classes for sale in the given stall
     * @param stallName_ Stall name in which the token classes are for sale
     * @return an array of token classes for sale in the stall `_stall`
     */
    function stallTokens(string calldata stallName_) public view returns (uint128[] memory) {
        require(stallNameTaken(stallName_), "Market: unregistered stall name");
        
        return _stallTokens[stallName_];
    }

    /**
     * @notice Returns the stall name registered to`vendor_` address
     * @param vendor_ The account address to whom the stall belongs to
     * @return the stall name registered to the vendor
     */
    function vendorStallName(address vendor_) public view returns (string memory) {
        require(_vendorRegistered(vendor_), "Market: account does not own a stall");

        return _stallNames[vendor_];
    }

    /**
     * @notice Returns the vendor address of the given stall `stallName_`
     * @param stallName_ Stall name to query for vendor
     * @return the stall owner's address
     */
    function stallVendor(string calldata stallName_) public view returns (address) {
        require(stallNameTaken(stallName_), "Market: unregistered stall name");

        return _vendors[stallName_];
    }

    /**
     * @notice Verifies if a stall name is already registered
     * @param stallName_ The stall name to check if taken
     * @return true if the `stallName_` is already registered, false otherwise
     */
    function stallNameTaken(string calldata stallName_) public view returns (bool) {
        return bytes(_uris[stallName_]).length > 0;
    }

    /**
     * @dev Returns true if the `vendor_` owns a registered stall, 
     * false otherwise
     * @param vendor_ The address to check if exists
     * @return true if the `vendor_` has a stall registered
     */
    function _vendorRegistered(address vendor_) internal view returns (bool) {
        return bytes(_stallNames[vendor_]).length > 0;
    }

    /**
     * @dev Converts an amount in the smallest denomination of the fiat 
     * currency to the same amount in the smallest denomination of a stablecoin
     * @param amount_ The amount to convert in the smallest denomination, 
     * e.g. 100 to represent 1 USD since the smalles denomination is cents
     * @return the amount converted to stablecoin.
     * Example converting 100 USD cents to USDC:
     * amount_ = 100
     * returns 1000000 USDC
     */
    function _fiatToStablecoin(uint256 amount_) internal view returns (uint256) {
        uint8 additionalDecimals = stablecoinDecimals - FIAT_DECIMALS;
        return amount_ * 10 ** additionalDecimals;
    }

}