// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Context.sol";

/**
 * @title Market
 * @notice Contract handling stalls and purchases
 */
contract Market is Context {

    /**
     * @dev Mapping of vendor addresses to their stall name
     */
    mapping (address => string) private _stallNames;

    /**
     * @dev Mapping of stall names to their metadata URI
     */
    mapping (string => string) private _uris;

    /**
     * @notice Emitted when the sender `vendor` registers a stall with the
     * name `stallName` and metadata URI `uri`
     */
    event StallRegistration(address indexed vendor, string indexed stallName, string indexed uri);

    /**
     * @notice Verifies if a stall name is already registered
     * @param stallName_ The stall name to check if taken
     * @return true if the `stallName_` is already registered, false otherwise
     */
    function stallNameTaken(string calldata stallName_) public view returns (bool) {
        return bytes(_uris[stallName_]).length > 0;
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
    function registerStall(string calldata stallName_, string calldata uri_) public {
        require(bytes(stallName_).length > 0, "Market: empty stall name");
        require(bytes(uri_).length > 0, "Market: empty metadata URI");
        require(!_vendorRegistered(_msgSender()), "Market: account already owns a stall");
        require(!stallNameTaken(stallName_), "Market: stall name already taken");

        _stallNames[_msgSender()] = stallName_;
        _uris[stallName_] = uri_;

        emit StallRegistration(_msgSender(), stallName_, uri_);
    }

    /**
     * @notice Returns the URI corresponding to `stallName_`
     * @param stallName_ Stall name whose URI is being queried
     * @return the URI pointing to the stall's metadata
     */
    function uri(string calldata stallName_) public view returns (string memory) {
        require(stallNameTaken(stallName_), "Market: unregistered stall name");

        return _uris[stallName_];
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
     * @dev Returns true if the `vendor_` owns a registered stall, 
     * false otherwise
     * @param vendor_ The address to check if exists
     * @return true if the `vendor_` has a stall registered
     */
    function _vendorRegistered(address vendor_) internal view returns (bool) {
        return bytes(_stallNames[vendor_]).length > 0;
    }

}