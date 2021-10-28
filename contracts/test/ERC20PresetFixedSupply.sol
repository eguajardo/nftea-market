// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.0-rc.0 (token/ERC20/presets/ERC20PresetFixedSupply.sol)

// Downgraded compiler version and customized to meet dependencies requirements
pragma solidity ^0.6.0;

import "./dependencies/openzeppelin/ERC20Burnable.sol";
import "./dependencies/centre-tokens/EIP3009.sol";

/**
 * @dev {ERC20} token, including:
 *
 *  - Preminted initial supply
 *  - Ability for holders to burn (destroy) their tokens
 *  - No access control mechanism (for minting/pausing) and hence no governance
 *
 * This contract uses {ERC20Burnable} to include burn capabilities - head to
 * its documentation for details.
 *
 * _Available since v3.4._
 */
contract ERC20PresetFixedSupply is ERC20Burnable, EIP3009 {

    /**
     * @dev Mints `initialSupply` amount of token and transfers them to `owner`.
     *
     * See {ERC20-constructor}.
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address owner,
        uint8 decimals
    ) public ERC20(name, symbol) {
        _mint(owner, initialSupply);
        _setupDecimals(decimals);
        DOMAIN_SEPARATOR = EIP712.makeDomainSeparator(name, "2");
    }

    function _approve(
        address owner, 
        address spender, 
        uint256 amount
    ) internal virtual override(AbstractFiatTokenV1, ERC20) {
        ERC20._approve(owner, spender, amount);
    }

    function _transfer(
        address sender,
        address recipient, 
        uint256 amount
    ) internal virtual override(AbstractFiatTokenV1, ERC20) {
        ERC20._transfer(sender, recipient, amount);
    }

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
    ) external {
        _transferWithAuthorization(
            from,
            to,
            value,
            validAfter,
            validBefore,
            nonce,
            v, r, s
        );
    }

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
  ) external {
      _receiveWithAuthorization(
          from, 
          to, 
          value, 
          validAfter, 
          validBefore, 
          nonce, 
          v, r, s);
  }

    function version() public pure returns (string memory) {
        return "2";
    }
}
