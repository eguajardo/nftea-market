// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;

import "../ERC1155Serialized.sol";

/**
 * @title ExposedERC1155Serialized
 * @notice Exposed version of the ERC1155Serialized for the purpose of
 * unit testing internal functions
 */
contract ExposedERC1155Serialized is ERC1155Serialized {

    function setURI(uint128 class_, string memory uri_) public {
        _setURI(class_, uri_);
    }

    function mintUnserialized(
        uint128 class_,
        uint128 quantity_,
        bytes memory data_
    ) public {
        _mintUnserialized(class_, quantity_, data_);
    }

    function mintSerialized(
        address to_,
        uint128 class_,
        bytes memory data_
    ) public {
        _mintSerialized(to_, class_, data_);
    }

    function serializeToken(
        address to_,
        uint128 class_,
        bytes memory data_
    ) public {
        _serializeToken(to_, class_, data_);
    }

    function toBaseId(uint128 class_) public view returns (uint256) {
        return _toBaseId(class_);
    }

    function toId(uint128 class_, uint128 _serial) public view returns (uint256) {
        return _toId(class_, _serial);
    }

    function tokenClass(uint256 _id) public view returns (uint128) {
        return _tokenClass(_id);
    }

    function tokenSerialNumber(uint256 _id) public view returns (uint128) {
        return _tokenSerialNumber(_id);
    }

}