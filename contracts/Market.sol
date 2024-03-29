// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "./MultiToken.sol";
import "./IEIP3009.sol";
import "./SponsorshipEscrow.sol";

/**
 * @title Market
 * @notice Contract handling stalls and purchases
 */
contract Market is Context {

    /**
     * @notice Maximum number of shares for NFT payment splitters excluding 
     * sponsors splitters which are calculated differently by the escrow
     */
    uint256 public constant PAYMENT_MAX_SHARES = 10000;

    /**
     * @notice About 5% in commission shares
     */
    uint256 public constant PLATFORM_COMISSION_SHARES = 500;

    /**
     * @notice Minimum price in the fiat currency's smallest denomination
     * e.g. 100 to represent 1 USD
     */
    uint8 public constant MINIMUM_NFT_PRICE_FIAT = 100;

    /**
     * @dev Decimals of fiat currency for price conversion with stablecoins
     */
    uint8 public constant FIAT_DECIMALS = 2;

    struct NFTSponsorship {
        uint256 sponsorshipId;
        // Intended supply of the NFT being sponsored
        uint128 supply;
        // Intended price of the NFT being sponsored
        uint256 price;
        // Commission shares' intended to be distributed among sponsors
        // out of the total available shares PAYMENT_MAX_SHARES
        uint256 sponsorsShares;
        // Metadata holding the sponsorship ad details
        string sponsorshipURI;
    }

    struct NFTData {
        string uri;
        uint128 maxSupply;
        uint256 price;
        uint128 class;
        uint128 serial;
        uint128 totalSerialized;
        string stallName;
    }

    struct SponsorshipData {
        string uri;
        uint128 maxSupply;
        uint256 price;
        string stallName;
        uint256 sponsorshipId;
        uint256 sponsorsShares;
        uint256 requestedAmount;
        uint256 deadline;
        bool active;
        uint256 sponsorsQuantity;
        uint256 totalFunds;
    }

    /**
     * @notice ERC-1155 token contract handling the NFTs for sale
     */
    MultiToken public nftContract;

    /**
     * @notice ERC-20 stablecoin token contract used for purchases
     */
    IEIP3009 public stablecoin;

    /**
     * @notice Escrow contract handling the sponsorships
     */
    SponsorshipEscrow public escrow;

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
     * @dev Mapping of stall names to an array of the NFT classes for sale
     */
    mapping (string => uint128[]) private _stallNFTs;

    /**
     * @dev Mapping of the NFT class to it's price
     */
    mapping (uint128 => uint256) private _nftPrices;

    /**
     * @dev Mapping of NFT class to it's stall where is sold
     */
    mapping (uint128 => string) private _nftStalls;

    /**
     * @dev Mapping of stall to it's payment splitter
     */
    mapping (string => PaymentSplitter) private _stallPaymentSplitters;

    /**
     * @dev Mapping of NFT class to it's payment splitter if applicable
     * If a payment splitter is found here, then its used instead of the
     * stall payment splitter
     */
    mapping (uint128 => PaymentSplitter) private _nftPaymentSplitters;

    /**
     * @dev Mapping of stall to a mapping of sponsorship ids to sponsorship details
     */
    mapping (string => mapping(uint256 => NFTSponsorship)) private _stallSponsorships;

    /**
     * @notice Emitted when the sender `vendor` registers a stall with the
     * name `stallName` and metadata URI `uri`
     */
    event StallRegistration(address indexed vendor, string indexed hashedStallName, string indexed hashedUri, string stallName);

    /**
     * @notice Emitted when a NFT is posted for sale by `vendor` address
     * in the stall `stallName` for `price` in fiat cents with NFT class `class`
     * and `supply` copies
     */
    event NFTForSale(string indexed stallName, address indexed vendor, uint256 price, uint128 class, uint128 supply);

    /**
     * @notice Emitted when a NFT with `id` is purchased from class `class` 
     * and stall `stallName` by `buyer` for `price` in fiat cents
     */
    event NFTPurchase(address indexed buyer, uint128 indexed class, string indexed stallName, uint256 id, uint256 price);

    /**
     * @notice Emitted when a sponsorship with ID `sponsorshipId`, was requested
     * from `stallName` to create an NFT with supply `supply` and price `price`
     */
    event Sponsorship(
        uint256 indexed sponsorshipId,
        string indexed stallName, 
        uint128 supply,
        uint256 price,
        uint16 sponsorsShareRatio,
        string sponsorshipURI,
        uint256 requestedAmount,
        uint256 deadline
    );

    /**
     * @notice Emitted when a NFT was created with class `class` as a result
     * of a fulfilled sponsorship with ID `sponsorshipId`
     */
    event SponsoredNFT(uint128 indexed class, uint256 indexed sponsorshipId);

    /**
     * @notice Initialize contract and the NFT token contract
     * @param stablecoin_ The stablecoin contract address used as currency
     * @param stablecoinDecimals_ Amount of decimals used by the stablecoin
     */
    constructor (IEIP3009 stablecoin_, uint8 stablecoinDecimals_) {
        nftContract = new MultiToken("NFTea.market", "NFTEA");
        stablecoin = stablecoin_;
        stablecoinDecimals = stablecoinDecimals_;
        escrow = new SponsorshipEscrow(stablecoin_);
    }

    /**
     * @dev Modifier that checks the sender is a registered vendor
     */
    modifier onlyVendor() {
        require(_vendorRegistered(_msgSender()), "Market: account is not a registered vendor");
        _;
    }

    /**
     * @dev Modifier that checks the price complies with requirements
     */
    modifier onlyValidPrice(uint256 price_) {
        require(
            price_ >= MINIMUM_NFT_PRICE_FIAT, 
            string(abi.encodePacked(
                "Market: price less than ", 
                Strings.toString(MINIMUM_NFT_PRICE_FIAT),
                " cents")));
        _;
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
     * @notice Returns the metadata URI associated to the account's stall,
     * return an empty string if the account is not a registered vendor
     * @param account_ The account to use for the uri lookup
     * @return the account's stall URI, empty string if not found
     */
    function uriOrEmpty(address account_) external view returns (string memory) {
        return _uris[_stallNames[account_]];
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

        emit StallRegistration(_msgSender(), stallName_, uri_, stallName_);
    }

    /**
     * @notice Updates the metadata URI of the caller's stall
     * @param uri_ The URI pointing to the stall metadata to update
     */
    function updateURI(string calldata uri_) external onlyVendor {
        require(bytes(uri_).length > 0, "Market: empty metadata URI");
        string memory stallName = vendorStallName(_msgSender());

        _uris[stallName] = uri_;
    }

    /**
     * @notice Creates and posts a new NFT for sale
     * @param uri_ The NFT metadata's URI
     * @param supply_ Max supply for the NFT. Zero if the supply is unlimited
     * @param price_ The NFT's price. Must be >= than `MINIMUM_NFT_PRICE_FIAT`
     * value is in the fiat smallest denomination, e.g. 100 equals 1 USD
     */
    function postNFTForSale(
        string memory uri_, 
        uint128 supply_,
        uint256 price_
    ) external onlyVendor onlyValidPrice(price_) {
        _postNFTForSale(_msgSender(), uri_, supply_, price_);
    }

    /**
     * @notice Buys a NFT of class `class_`. This will transfer the cost
     * of the NFT from sender to the payment splitter address. An
     * authorization signature is required to move the stablecoin funds.
     * For the transferWithAuthorization specification see 
     * https://eips.ethereum.org/EIPS/eip-3009
     * For an example of how to sign the authorization using ethers.js see
     * https://docs.ethers.io/v5/api/signer/#Signer-signTypedData
     * @param class_ Class of NFT to purchase
     * @param nonce_ Random nonce, must be the same used to sign, otherwise
     * the signature will be invalid
     * @param validBefore_ Time in unix epoch when the authorization expires.
     * Must be the same used to sign, otherwise it will be invalidated
     * @param v_ From signature
     * @param r_ From signature
     * @param s_ From signature
     * @return the NFT ID purchased. First uint128 half represents the class
     * last uint128 half represents the serial number.
     */
    function buyNFT(
        uint128 class_, 
        bytes32 nonce_,
        uint256 validBefore_,
        uint8 v_, 
        bytes32 r_, 
        bytes32 s_
    ) external returns (uint256) {
        string memory stallName = _nftStalls[class_];
        require(bytes(stallName).length > 0, "Market: unregistered NFT class");

        stablecoin.transferWithAuthorization(
            _msgSender(), 
            address(paymentAddress(class_)), 
            _fiatToStablecoin(_nftPrices[class_]), 
            0, 
            validBefore_,
            nonce_, 
            v_, r_, s_
        );
        
        _releaseSpliter(paymentAddress(class_), stallVendor(stallName));

        uint256 tokenId = nftContract.mint(_msgSender(), class_, _msgData());

        emit NFTPurchase(_msgSender(), class_, stallName, tokenId, _nftPrices[class_]);
        return tokenId;
    }

    /**
     * @notice Requests a sponsorship to be able to deliver a NFT
     * @param supply_ Intended supply of the NFT being sponsored
     * @param price_ Intended price of the NFT being sponsored. Value must be 
     * in the fiat smallest denomination, e.g. 100 (cents) equals 1 USD
     * @param sponsorsShares_ Commission shares' to be distributed to sponsors
     * out of `PAYMENT_MAX_SHARES` whenever the sponsored NFT is sold, e.g. a 
     * value of 725 out of 10000 is the %7.25 comission fee.
     * This value + `PLATFORM_COMISSION_SHARES` must be less than 
     * `PAYMENT_MAX_SHARES`
     * @param sponsorshipURI_ Metadata URI holding the sponsorship ad details
     * @param requestedAmount_ The amount requested by the content creator
     * to be able to deliver. Value must be in the fiat smallest denomination,
     * e.g. 100 (cents) equals 1 USD. If 0 amount was requested, then it works
     * as if the shares are being auctioned
     * @param deadline_ Timestamp as seconds in unix epoch representing the 
     * deadline to meet the sponsorship goal.
     */
    function requestSponsorship(
        uint128 supply_,
        uint256 price_,
        uint16 sponsorsShares_,
        string calldata sponsorshipURI_,
        uint256 requestedAmount_,
        uint256 deadline_
    ) public onlyVendor onlyValidPrice(price_) {
        require(bytes(sponsorshipURI_).length > 0, "Market: URI cannot be empty");
        require(sponsorsShares_ > 0, "Market: zero sponsor shares");
        require(
            sponsorsShares_ + PLATFORM_COMISSION_SHARES < PAYMENT_MAX_SHARES,
            "Market: sponsor shares + platform shares exceeds maximum"
        );

        string memory stallName = vendorStallName(_msgSender());
        PaymentSplitter beneficiarySplitter = _stallPaymentSplitters[stallName];
        uint256 requestedAmountStablecoin = _fiatToStablecoin(requestedAmount_);

        uint256 sponsorshipId = escrow.registerSponsortship(
            requestedAmountStablecoin, 
            deadline_, 
            address(beneficiarySplitter)
        );

        NFTSponsorship memory sponsorship = NFTSponsorship({
            sponsorshipId: sponsorshipId,
            supply: supply_,
            price: price_,
            sponsorsShares: sponsorsShares_,
            sponsorshipURI: sponsorshipURI_
        });

        _stallSponsorships[stallName][sponsorshipId] = sponsorship;

        emit Sponsorship(
            sponsorshipId, 
            stallName,
            supply_, 
            price_, 
            sponsorsShares_, 
            sponsorshipURI_, 
            requestedAmount_, 
            deadline_
        );
    }

    /**
     * @notice Posts a sponsored NFT for sale and therefore completing
     * the sponsorship
     * @param sponsorshipId_ The ID of the sponsorship that raised funds
     * for this NFT creation
     * @param uri_ The NFT metadata uri_
     */
    function postSponsoredNFTForSale(
        uint256 sponsorshipId_, 
        string calldata uri_
    ) external onlyVendor {
        string memory stallName = vendorStallName(_msgSender());
        NFTSponsorship memory nftSponsorship = _stallSponsorships[stallName][sponsorshipId_];
        require(
            bytes(nftSponsorship.sponsorshipURI).length > 0,
            "Market: sponsorship not registered to stall"
        );

        uint128 class = _postNFTForSale(
            _msgSender(), 
            uri_, 
            nftSponsorship.supply, 
            nftSponsorship.price
        );

        (
            address[] memory sponsors, 
            uint256[] memory deposits,
            uint256 totalFunds
        ) = escrow.completeSponsorship(sponsorshipId_);

        _releaseSpliter(_stallPaymentSplitters[stallName], _msgSender());

        // To add platform and creator shares, a resized array is needed
        uint256 newSize = sponsors.length + 2;

        address[] memory payees = new address[](newSize);
        payees[0] = address(this);
        payees[1] = _msgSender();
        for (uint256 i = 2; i < newSize; i++) {
            payees[i] = sponsors[i - 2];
        }

        uint256 vendorComissionShares = PAYMENT_MAX_SHARES - PLATFORM_COMISSION_SHARES - nftSponsorship.sponsorsShares;
        uint256[] memory shares = new uint256[](newSize);
        // Multiply by totalFunds to normalize with individual sponsors contribution
        shares[0] = totalFunds * PLATFORM_COMISSION_SHARES;
        shares[1] = totalFunds * vendorComissionShares;
        for (uint256 i = 2; i < newSize; i++) {
            // Multiply deposits by the total shares portion distributed to all 
            // sponsors to normalize shares with platform and vendor fees
            shares[i] = deposits[i - 2] * nftSponsorship.sponsorsShares;
        }

        _nftPaymentSplitters[class] = new PaymentSplitter(payees, shares);

        emit SponsoredNFT(class, sponsorshipId_);
    }

    /**
     * @dev Returns the payment splitter to use when purchasing NFT `class_`
     * @param class_ The NFT class associated with the payment splitter
     * @return thethe PaymentSplitter to use when purchasing this NFT `class_`. 
     * If the NFT was sponsored, then return the payment
     * splitter corresponding to the sponsorship, otherwise return the stall 
     * payment splitter
     */
    function paymentAddress(uint128 class_) public view returns (PaymentSplitter) {
        require(bytes(_nftStalls[class_]).length > 0, "Market: unregistered NFT class");

        PaymentSplitter splitter = _nftPaymentSplitters[class_];
        if (address(splitter) == address(0)) {
            splitter = _stallPaymentSplitters[_nftStalls[class_]];
        }

        return splitter;
    }

    /**
     * @notice Returns the list of NFT classes for sale in the given stall
     * @param stallName_ Stall name in which the NFT classes are for sale
     * @return an array of NFT classes for sale in the stall `_stall`
     */
    function stallNFTs(string calldata stallName_) public view returns (uint128[] memory) {
        require(stallNameTaken(stallName_), "Market: unregistered stall name");
        
        return _stallNFTs[stallName_];
    }

    /**
     * @notice Returns data relevant to the NFT class
     * @param id_ the NFT id to retrieve data from
     * @return a struct NFTData with all relevant data
     */
    function nftData(
        uint256 id_
    ) public view returns (
        NFTData memory
    ) {
        uint128 class = nftContract.tokenClass(id_);
        string memory stallName = _nftStalls[class];
        require(bytes(stallName).length > 0, "Market: unregistered NFT class");

        return NFTData({
            uri: nftContract.uri(id_),
            maxSupply: nftContract.maxSupply(class),
            price: _nftPrices[class],
            class: class,
            serial: nftContract.tokenSerialNumber(id_),
            totalSerialized: nftContract.totalSerialized(class),
            stallName: stallName
        });
    }

    /**
     * @notice Returns data relevant to a sponsorship. All amounts are in fiat
     * @param sponsorshipId_ The sponsorship ID to retrieve data from
     * @param stallName_ The stall ID where this sponsorship belongs
     * @return a struct SponsorshipData with all relevant data
     */
    function sponsorshipData(
        uint256 sponsorshipId_,
        string calldata stallName_
    ) public view returns (
        SponsorshipData memory
    ) {
        NFTSponsorship memory nftSponsorship = _stallSponsorships[stallName_][sponsorshipId_];
        require(
            bytes(nftSponsorship.sponsorshipURI).length > 0,
            "Market: sponsorship not registered to stall"
        );

        (
            uint256 requestedAmount,
            uint256 deadline,
            bool active,
            uint256 sponsorsQuantity, 
            uint256 totalFunds
        ) = escrow.sponsorshipData(sponsorshipId_);

        return SponsorshipData({
            uri: nftSponsorship.sponsorshipURI,
            maxSupply: nftSponsorship.supply,
            price: nftSponsorship.price,
            stallName: stallName_,
            sponsorshipId: sponsorshipId_,
            sponsorsShares: nftSponsorship.sponsorsShares,
            requestedAmount: _stablecoinToFiat(requestedAmount),
            deadline: deadline,
            active: active,
            sponsorsQuantity: sponsorsQuantity,
            totalFunds: _stablecoinToFiat(totalFunds)
        });
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
    function stallVendor(string memory stallName_) public view returns (address) {
        require(stallNameTaken(stallName_), "Market: unregistered stall name");

        return _vendors[stallName_];
    }

    /**
     * @notice Verifies if a stall name is already registered
     * @param stallName_ The stall name to check if taken
     * @return true if the `stallName_` is already registered, false otherwise
     */
    function stallNameTaken(string memory stallName_) public view returns (bool) {
        return bytes(_uris[stallName_]).length > 0;
    }

    /**
     * @dev Release the given payment splitter to vendor and this contract
     * @param splitter_ The PaymentSplitter to release
     * @param vendor_ The vendor who is a payee in the payment splitter
     */
    function _releaseSpliter(PaymentSplitter splitter_, address vendor_) internal {
        splitter_.release(IERC20(stablecoin), vendor_);
        splitter_.release(IERC20(stablecoin), address(this));
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

    /**
     * @dev Converts an amount in the smallest denomination of the stablecoin 
     * currency to the same amount in the fiat smallest denomination
     * @param amount_ The amount to convert in the smallest denomination, 
     * e.g. 1000000 to represent 1 USDC since USDC has 6 decimals
     * @return the amount converted to fiat.
     * Example converting 1000000 USDC to USD cents:
     * amount_ = 1000000 USDC
     * returns 100 USD cents
     */
    function _stablecoinToFiat(uint256 amount_) internal view returns (uint256) {
        uint8 additionalDecimals = stablecoinDecimals - FIAT_DECIMALS;
        return amount_ / 10 ** additionalDecimals;
    }

    /**
     * @dev Creates and posts a new NFT for sale
     * @param vendor_ The address creator of the NFT
     * @param uri_ The NFT metadata's URI
     * @param supply_ Max supply for the NFT. Zero if the supply is unlimited
     * @param price_ The NFT's price. Must be >= than `MINIMUM_NFT_PRICE_FIAT`
     * value is in the fiat smallest denomination, e.g. 100 equals 1 USD
     * @return the NFT class posted for sale
     */
    function _postNFTForSale(
        address vendor_,
        string memory uri_, 
        uint128 supply_,
        uint256 price_
    ) internal returns (uint128) {
        string memory stallName = vendorStallName(vendor_);
        uint128 class = nftContract.registerClass(uri_, supply_, _msgData());

        _stallNFTs[stallName].push(class);
        _nftPrices[class] = price_;
        _nftStalls[class] = stallName;

        emit NFTForSale(stallName, vendor_, price_, class, supply_);

        return class;
    }

}