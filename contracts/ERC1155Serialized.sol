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
     * @notice Emitted when a token of class `class` is minted with serial 
     * number `serial` and transfered to recipient `to`
     */
    event SerialMint(address indexed to, uint128 indexed class, uint128 serial);

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
    function uri(uint256 id_) public view virtual override returns (string memory) {
        require(bytes(_uris[_tokenClass(id_)]).length > 0, "ERC1155Serialized: token URI does not exist");
        return _uris[_tokenClass(id_)];
    }

    /**
     * @notice Returns the total serialized tokens from the class `class_`
     * @param class_ The class to check
     * @return An uint128 representing the number of tokens that have been
     * serialized of the given class
     */
    function totalSerialized(uint128 class_) public view virtual returns (uint128) {
        return _currentSerial[class_];
    }

    /**
     * @dev Sets the token's class URI
     * @param class_ Token class whose URI will be set
     * @param uri_ The URI to set
     */
    function _setURI(uint128 class_, string memory uri_) internal virtual {
        _uris[class_] = uri_;
        emit URI(uri_, _toBaseId(class_));
    }

    /**
     * @dev Mint a certain quantity of unserialized tokens into the reserve,
     * i.e. to this contract address. The reserve is used to pre-mint tokens
     * without spending too much gas serializing each one. Later the function
     * _serializeToken can be used to take a token from the reserve and
     * mint the serialized version of it.
     * @param class_ Token class to mint
     * @param quantity_ Amount of tokens to mint
     * @param data_ Additional data
     */
    function _mintUnserialized(
        uint128 class_,
        uint128 quantity_,
        bytes memory data_
    ) internal virtual {
        uint256 baseId = _toBaseId(class_);
        _mint(address(this), baseId, quantity_, data_);
    }

    /**
     * @dev Mint a serialized token of class `class_` to address `to_`
     * @param to_ Address to where the minted token will be transferred
     * @param class_ Class of token to be minted
     * @param data_ Additional data
     */
    function _mintSerialized(
        address to_,
        uint128 class_,
        bytes memory data_
    ) internal virtual {
        _currentSerial[class_]++;
        uint256 id = _toId(class_, _currentSerial[class_]);

        emit SerialMint(to_, class_, _currentSerial[class_]);

        _mint(to_, id, 1, data_);
    }

    /**
     * @dev Serializes a token from the already unserialized minted reserve in
     * this contract. First burns the unserialized token then mints the
     * serialized one.
     * @param to_ Address to where the serialized token will be transferred
     * @param class_ Class of token to be minted
     * @param data_ Additional data
     */
    function _serializeToken(
        address to_,
        uint128 class_,
        bytes memory data_
    ) internal virtual {
        uint256 baseId = _toBaseId(class_);
        require(totalSupply(baseId) > 0, "ERC1155Serialized: not enough supply");

        // First burn an unserialized token from the unserialized reserve,
        // then mint the serialized version of it
        _burn(address(this), baseId, 1);
        _mintSerialized(to_, class_, data_);
    }

    /**
     * @dev Returns the base ID from a token class (i.e. class with zero serial number)
     * @param class_ Token class of the base ID, (i.e. the first uint128 half of the ID)
     * @return the base ID of the specified class, (i.e. with serial number zero)
     */
    function _toBaseId(uint128 class_) internal view virtual returns (uint256) {
        return uint256(class_) << 128;
    }

    /**
     * @dev Combines the class `class_` and serial number `serial_` of a token
     * to it's unique ID
     * @param class_ Token class, (i.e the first uint128 half of the ID)
     * @param serial_ Token serial number from it's class (i.e last uint128 half)
     * @return The token ID
     */
    function _toId(uint128 class_, uint128 serial_) internal view virtual returns (uint256) {
        return _toBaseId(class_) // cast to set first bytes to class
            | uint256(serial_); // same as above but then shift bytes to the end
    }

    /**
     * @dev Extract the token class from the ID `id_`
     * @param id_ Token ID from which the class will be retrieved
     * @return The token class representing the first uint128 half of the ID
     */
    function _tokenClass(uint256 id_) internal view virtual returns (uint128) {
        return uint128(id_ >> 128);
    }

    /**
     * @dev Extract the token class' serial number from the ID `id_`
     * @param id_ Token ID from which the serial number will be retrieved
     * @return The serial number representing the last uint128 half of the ID
     * The serial number is relative to the token's class
     */
    function _tokenSerialNumber(uint256 id_) internal view virtual returns (uint128) {
        return uint128(id_);
    }
}