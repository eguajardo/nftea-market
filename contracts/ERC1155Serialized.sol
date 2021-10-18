// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/**
 * @title ERC1155Serialized
 * @notice Contract based on Openzeppelin's ERC1155, adapted to hold 
  * serialized NFTs based on the suggested implementation to mix Fungible and
  * Non-Fungible tokens specified in https://eips.ethereum.org/EIPS/eip-1155
  *
  * Uint256 token IDs can be split in two where the first half represents the
  * token's class and the second half represents the relative serial number.
  * This allows to have NFTs based on the same metadata but with different
  * serial numbers and unique IDs
 */
contract ERC1155Serialized is ERC1155 {

    constructor() ERC1155("") {}

    /**
     * @dev Mapping from token class to the metadata URI
     */
    mapping (uint128 => string) private _uris;

    /**
     * @notice Returns the metadata URI corresponding to the token's class.
     * i.e. tokens that belong to the same class should return the same URI
     */
    function uri(uint256 _id) public view virtual override returns (string memory) {
        require(bytes(_uris[_tokenClass(_id)]).length > 0, "ERROR_TOKEN_DOES_NOT_EXISTS");
        return _uris[_tokenClass(_id)];
    }

    /**
     * @dev Sets the token's class URI
     * @param _class The token class whose URI will be set
     * @param _uri The URI to set
     */
    function _setURI(uint128 _class, string memory _uri) internal virtual {
        _uris[_class] = _uri;
    }

    /**
     * @dev Combines the class `_class` and serial number `_serial` of a token
     * to it's unique ID
     * @param _class The token class (first uint128 half of the ID)
     * @param _serial The token serial number from it's class (last uint128)
     * @return the token ID
     */
    function _toId(uint128 _class, uint128 _serial) internal view virtual returns (uint256) {
        return uint256(
            bytes32(bytes16(_class)) // cast to set first bytes to class
            | (bytes32(bytes16(_serial)) >> 128) // same as above but then shift bytes to the end
        );
    }

    /**
     * @dev Extract the token class from the ID `_id`
     * @param _id The token ID
     * @return the token class representing the first uint128 half of the ID
     */
    function _tokenClass(uint256 _id) internal view virtual returns (uint128) {
        return uint128(_id >> 128);
    }

    /**
     * @dev Extract the token class' serial number from the ID `_id`
     * @param _id The token ID
     * @return the serial number representing the last uint128 half of the ID
     * The serial number is relative to the token's class
     */
    function _tokenSerialNumber(uint256 _id) internal view virtual returns (uint128) {
        return uint128(_id);
    }
}