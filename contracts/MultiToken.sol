// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "./ERC1155Serialized.sol";

contract MultiToken is ERC1155Serialized, AccessControlEnumerable {

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /**
     * @dev Token name
     */
    string private _name;

    /**
     * @dev Token symbol
     */
    string private _symbol;

    /**
     * @dev Counter keeping track of the total classes registered
     */
    uint128 private _classCounter;

    /**
     * @dev Map from token class id to its max supply. Zero if the class
     * has unlimited supply
     */
    mapping(uint128 => uint128) private _classSupply;

    /**
     * @notice Emitted when a new class `class` is registered with URI
     * `uri` and max supply of `supply`, zero if unlimited supply
     */
    event ClassRegistration(uint128 indexed class, string indexed uri, uint128 supply);

    /**
     * @notice Initializes the contract by setting a `name` and `symbol`
     * Sender is granted owner role.
     * @param name_ The name to set, used for token trackers
     * @param symbol_ The token symbol, used for token trackers
     */
    constructor (string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
        _setupRole(MINTER_ROLE, _msgSender());
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) 
        public 
        view 
        virtual 
        override(ERC1155Serialized, AccessControlEnumerable) 
        returns (bool) 
    {
        return ERC1155Serialized.supportsInterface(interfaceId) 
            || AccessControlEnumerable.supportsInterface(interfaceId);
    }

    /**
     * @notice Borrowed from ERC721. See {IERC721Metadata-name}.
     */
    function name() public view virtual returns (string memory) {
        return _name;
    }

    /**
     * @notice Borrowed from ERC721. See {IERC721Metadata-symbol}.
     */
    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    /**
     * @notice Returns the max supply of a given token class
     * @param class_ The class to check
     * @return the max supply of the given class, zero if unlimited
     */
    function maxSupply(uint128 class_) public view returns (uint128) {
        require(class_ > 0, "MultiToken: reserved zero class");
        require(_classCounter >= class_, "MultiToken: unregistered class");

        return _classSupply[class_];
    }

    /**
     * @notice Registers a token class with metadata URI `uri_` and mints
     * `supply_` unserialized tokens to the reserve for future serialization
     * Token class is automatically set to the next in sequence
     * @param uri_ Metadata's URI of the registered class
     * @param supply_ Amount of initial unserialized tokens which represents
     * the maximum supply. Zero if the class has an unlimited supply.
     * @param data_ Additional data
     */
    function registerClass(
        string memory uri_, 
        uint128 supply_, 
        bytes memory data_
    ) 
        public 
        onlyRole(MINTER_ROLE)
        returns (uint128)
    {
        require(bytes(uri_).length > 0, "MultiToken: URI cannot be empty");
        _classCounter++;

        _setURI(_classCounter, uri_);
        _classSupply[_classCounter] = supply_;

        emit ClassRegistration(_classCounter, uri_, supply_);

        // If supply_ is set, then mint as unserialized tokens
        if (supply_ > 0) {
            _mintUnserialized(_classCounter, supply_, data_);
        }

        return _classCounter;
    }

    /**
     * @notice Mints a serialized token of the given class `class_`. If the 
     * class has an unlimited supply, then mint a serialized token without
     * restriction, otherwise an unserialized token will be burned from the
     * reserve before minting a serialized one.
     * @param to_ Receiver address
     * @param class_ Class of the token to mint
     * @param data_ Additional data
     * @return the token ID
     */
    function mint(
        address to_,
        uint128 class_,
        bytes memory data_
    ) public onlyRole(MINTER_ROLE) returns (uint256) {
        require(to_ != address(0), "MultiToken: mint to zero address");
        require(class_ > 0, "MultiToken: reserved zero class");
        require(_classCounter >= class_, "MultiToken: unregistered class");

        uint256 id;
        if (_classSupply[class_] == 0) {
            id = _mintSerialized(to_, class_, data_);
        } else {
            id = _serializeToken(to_, class_, data_);
        }

        return id;
    }

}