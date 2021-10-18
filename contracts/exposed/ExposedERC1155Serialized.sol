// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;

import "../ERC1155Serialized.sol";

/**
 * @title ExposedERC1155Serialized
 * @notice Exposed version of the ERC1155Serialized for the purpose of
 * unit testing internal functions
 */
contract ExposedERC1155Serialized is ERC1155Serialized {

    function setURI(uint128 _class, string memory _uri) public {
        _setURI(_class, _uri);
    }

    function toId(uint128 _class, uint128 _serial) public view returns (uint256) {
        return _toId(_class, _serial);
    }

    function tokenClass(uint256 _id) public view returns (uint128) {
        return _tokenClass(_id);
    }

    function tokenSerialNumber(uint256 _id) public view returns (uint128) {
        return _tokenSerialNumber(_id);
    }

}