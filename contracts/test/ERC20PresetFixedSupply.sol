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
}
