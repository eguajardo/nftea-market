// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Context.sol";

/**
 * @title Profile
 * @notice Contract keeping track of the user profiles
 */
contract Profile is Context {

    /**
     * @dev Mapping of addresses to their username
     */
    mapping (address => string) private _usernames;

    /**
     * @dev Mapping of usernames to their URI
     */
    mapping (string => string) private _uris;

    /**
     * @notice Emitted when the sender `account` registers the username 
     * `username` with URI `uri`
     */
    event ProfileCreated(address indexed account, string indexed username, string indexed uri);

    /**
    * @notice Creates a profile for the sender address with the specified `username` and 
    * `uri` pointing to their metadata
    * @param username_ A unique string representing the owner of the profile. In order to 
    * render properly in the client application the username must comply with the 
    * specifications for paths in a URL https://datatracker.ietf.org/doc/html/rfc3986#section-3.3
    * @param uri_ The URI pointing to the profile metadata, e.g. "ipfs://[CID]/metadata.json"
    */
    function createProfile(string calldata username_, string calldata uri_) public {
        require(bytes(username_).length > 0, "ERROR_USERNAME_IS_EMPTY");
        require(bytes(uri_).length > 0, "ERROR_URI_IS_EMPTY");
        require(!_addressRegistered(_msgSender()), "ERROR_ADDRESS_ALREADY_REGISTERED");
        require(!_usernameExists(username_), "ERROR_USERNAME_NOT_UNIQUE");

        _usernames[_msgSender()] = username_;
        _uris[username_] = uri_;

        emit ProfileCreated(_msgSender(), username_, uri_);
    }

    /**
     * @notice Returns the URI corresponding to `username`
     * @param username_ The username of the user to whom the URI belongs to
     * @return the URI pointing to the user's metadata
     */
    function uri(string calldata username_) public view returns (string memory) {
        require(_usernameExists(username_), "ERROR_USER_DOES_NOT_EXISTS");

        return _uris[username_];
    }

    /**
     * @notice Returns the username corresponding to`address_`
     * @param address_ The account address to whom the username belongs to
     * @return the username registered to the address
     */
    function username(address address_) public view returns (string memory) {
        require(_addressRegistered(address_), "ERROR_ADDRESS_NOT_REGISTERED");

        return _usernames[address_];
    }

    /**
     * @dev Returns true if the `address_` is already registered, false otherwise
     * @param address_ The address to check if exists
     */
    function _addressRegistered(address address_) internal view returns (bool) {
        return bytes(_usernames[address_]).length > 0;
    }

    /**
     * @dev Returns true if the username exists, false otherwise
     * @param username_ The username to check if exists
     */
    function _usernameExists(string calldata username_) internal view returns (bool) {
        return bytes(_uris[username_]).length > 0;
    }

}