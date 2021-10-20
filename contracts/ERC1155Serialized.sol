// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

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
contract ERC1155Serialized is ERC1155Supply, ERC1155Holder {

    constructor() ERC1155("") {}

    /**
     * @dev Mapping from token class to its current maximum serial number
     */
    mapping (uint128 => uint128) private _currentSerial;

    /**
     * @dev Mapping from token class to the metadata URI
     */
    mapping (uint128 => string) private _uris;

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC1155, ERC1155Receiver) returns (bool) {
        return ERC1155.supportsInterface(interfaceId) 
            || ERC1155Receiver.supportsInterface(interfaceId);
    }

    /**
     * @notice Returns the metadata URI corresponding to the token's class.
     * i.e. tokens that belong to the same class should return the same URI
     * @return The metadata's URI of the given token ID
     */
    function uri(uint256 _id) public view virtual override returns (string memory) {
        require(bytes(_uris[_tokenClass(_id)]).length > 0, "ERC1155Serialized: token URI does not exist");
        return _uris[_tokenClass(_id)];
    }

    /**
     * @notice Returns the total serialized tokens from the class `_class`
     * @param _class The class to check
     * @return An uint128 representing the number of tokens that have been
     * serialized of the given class
     */
    function totalSerialized(uint128 _class) public view virtual returns (uint128) {
        return _currentSerial[_class];
    }

    /**
     * @dev Sets the token's class URI
     * @param _class Token class whose URI will be set
     * @param _uri The URI to set
     */
    function _setURI(uint128 _class, string memory _uri) internal virtual {
        _uris[_class] = _uri;
    }

    /**
     * @dev Mint a certain quantity of unserialized tokens into the reserve,
     * i.e. to this contract address. The reserve is used to pre-mint tokens
     * without spending too much gas serializing each one. Later the function
     * _serializeToken can be used to take a token from the reserve and
     * mint the serialized version of it.
     * @param _class Token class to mint
     * @param _quantity Amount of tokens to mint
     * @param _data Additional data
     */
    function _mintUnserialized(
        uint128 _class,
        uint128 _quantity,
        bytes memory _data
    ) internal virtual {
        uint256 baseId = _toBaseId(_class);
        _mint(address(this), baseId, _quantity, _data);
    }

    /**
     * @dev Mint a serialized token of class `_class` to address `_to`
     * @param _to Address to where the minted token will be transferred
     * @param _class Class of token to be minted
     * @param _data Additional data
     */
    function _mintSerialized(
        address _to,
        uint128 _class,
        bytes memory _data
    ) internal virtual {
        _currentSerial[_class]++;
        uint256 id = _toId(_class, _currentSerial[_class]);

        _mint(_to, id, 1, _data);
    }

    /**
     * @dev Serializes a token from the already unserialized minted reserve in
     * this contract. First burns the unserialized token then mints the
     * serialized one.
     * @param _to Address to where the serialized token will be transferred
     * @param _class Class of token to be minted
     * @param _data Additional data
     */
    function _serializeToken(
        address _to,
        uint128 _class,
        bytes memory _data
    ) internal virtual {
        uint256 baseId = _toBaseId(_class);
        require(totalSupply(baseId) > 0, "ERC1155Serialized: not enough supply");

        // First burn an unserialized token from the unserialized reserve,
        // then mint the serialized version of it
        _burn(address(this), baseId, 1);
        _mintSerialized(_to, _class, _data);
    }

    /**
     * @dev Returns the base ID from a token class (i.e. class with zero serial number)
     * @param _class Token class of the base ID, (i.e. the first uint128 half of the ID)
     * @return the base ID of the specified class, (i.e. with serial number zero)
     */
    function _toBaseId(uint128 _class) internal view virtual returns (uint256) {
        return uint256(_class) << 128;
    }

    /**
     * @dev Combines the class `_class` and serial number `_serial` of a token
     * to it's unique ID
     * @param _class Token class, (i.e the first uint128 half of the ID)
     * @param _serial Token serial number from it's class (i.e last uint128 half)
     * @return The token ID
     */
    function _toId(uint128 _class, uint128 _serial) internal view virtual returns (uint256) {
        return _toBaseId(_class) // cast to set first bytes to class
            | uint256(_serial); // same as above but then shift bytes to the end
    }

    /**
     * @dev Extract the token class from the ID `_id`
     * @param _id Token ID from which the class will be retrieved
     * @return The token class representing the first uint128 half of the ID
     */
    function _tokenClass(uint256 _id) internal view virtual returns (uint128) {
        return uint128(_id >> 128);
    }

    /**
     * @dev Extract the token class' serial number from the ID `_id`
     * @param _id Token ID from which the serial number will be retrieved
     * @return The serial number representing the last uint128 half of the ID
     * The serial number is relative to the token's class
     */
    function _tokenSerialNumber(uint256 _id) internal view virtual returns (uint128) {
        return uint128(_id);
    }
}