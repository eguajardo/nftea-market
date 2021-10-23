// SPDX-License-Identifier: MIT
// Taken from https://github.com/ethereum/EIPs/issues/3010
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IEIP3009 is IERC20 {

  event AuthorizationUsed(
      address indexed authorizer,
      bytes32 indexed nonce
  );

  /**
  * @notice Returns the state of an authorization
  * @dev Nonces are randomly generated 32-byte data unique to the authorizer's
  * address
  * @param authorizer    Authorizer's address
  * @param nonce         Nonce of the authorization
  * @return True if the nonce is used
  */
  function authorizationState(
      address authorizer,
      bytes32 nonce
  ) external view returns (bool);

  /**
  * @notice Execute a transfer with a signed authorization
  * @param from          Payer's address (Authorizer)
  * @param to            Payee's address
  * @param value         Amount to be transferred
  * @param validAfter    The time after which this is valid (unix time)
  * @param validBefore   The time before which this is valid (unix time)
  * @param nonce         Unique nonce
  * @param v             v of the signature
  * @param r             r of the signature
  * @param s             s of the signature
  */
  function transferWithAuthorization(
      address from,
      address to,
      uint256 value,
      uint256 validAfter,
      uint256 validBefore,
      bytes32 nonce,
      uint8 v,
      bytes32 r,
      bytes32 s
  ) external;

  /**
  * @notice Receive a transfer with a signed authorization from the payer
  * @dev This has an additional check to ensure that the payee's address matches
  * the caller of this function to prevent front-running attacks. (See security
  * considerations)
  * @param from          Payer's address (Authorizer)
  * @param to            Payee's address
  * @param value         Amount to be transferred
  * @param validAfter    The time after which this is valid (unix time)
  * @param validBefore   The time before which this is valid (unix time)
  * @param nonce         Unique nonce
  * @param v             v of the signature
  * @param r             r of the signature
  * @param s             s of the signature
  */
  function receiveWithAuthorization(
      address from,
      address to,
      uint256 value,
      uint256 validAfter,
      uint256 validBefore,
      bytes32 nonce,
      uint8 v,
      bytes32 r,
      bytes32 s
  ) external;
}