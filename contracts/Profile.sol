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
    * @notice Creates a profile for the sender address with the specified `username` and 
    * `uri` pointing to their metadata
    * @param _username A unique string representing the owner of the profile. In order to 
    * render properly in the client application the username must comply with the 
    * specifications for paths in a URL https://datatracker.ietf.org/doc/html/rfc3986#section-3.3
    * @param _uri The URI pointing to the profile metadata, e.g. "ipfs://[CID]/metadata.json"
    */
    function createProfile(string calldata _username, string calldata _uri) public {
        require(bytes(_username).length > 0, "ERROR_USERNAME_IS_EMPTY");
        require(bytes(_uri).length > 0, "ERROR_URI_IS_EMPTY");
        require(!addressRegistered(_msgSender()), "ERROR_ADDRESS_ALREADY_REGISTERED");
        require(!usernameExists(_username), "ERROR_USERNAME_NOT_UNIQUE");

        _usernames[_msgSender()] = _username;
        _uris[_username] = _uri;
    }

    /**
     * @notice Returns the URI corresponding to `username`
     * @param _username The username of the user to whom the URI belongs to
     * @return the URI pointing to the user's metadata
     */
    function uri(string calldata _username) public view returns (string memory) {
        require(usernameExists(_username), "ERROR_USER_DOES_NOT_EXISTS");

        return _uris[_username];
    }

    /**
     * @notice Returns the username corresponding to`_address`
     * @param _address The account address to whom the username belongs to
     * @return the username registered to the address
     */
    function username(address _address) public view returns (string memory) {
        require(addressRegistered(_address), "ERROR_ADDRESS_NOT_REGISTERED");

        return _usernames[_address];
    }

    /**
     * @dev Returns true if the `_address` is already registered, false otherwise
     * @param _address The address to check if exists
     */
    function addressRegistered(address _address) public view returns (bool) {
        return bytes(_usernames[_address]).length > 0;
    }

    /**
     * @dev Returns true if the username exists, false otherwise
     * @param _username The username to check if exists
     */
    function usernameExists(string calldata _username) public view returns (bool) {
        return bytes(_uris[_username]).length > 0;
    }

}