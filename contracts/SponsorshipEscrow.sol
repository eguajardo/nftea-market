// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "./IEIP3009.sol";

/**
 * @title SponsorshipEscrow
 * @notice Escrow contract handling the sponsors' deposits, deadlines
 * and beneficiary conditional withdraw of sponsored NFTs
 */
contract SponsorshipEscrow is Ownable {

    struct Sponsorship {
        // Amount requested in the sponsorship
        uint256 requestedAmount;
        // Timestamp as seconds in unix epoch representing the deadline to
        // meet the sponsorship goal.
        uint256 deadline;
        // Address of the beneficiary receiving the funds
        address beneficiary;
        // Sponsorship is active
        bool active;
        // List of sponsors that contributed to this sponsorship
        address[] sponsors;
        // Mapping of sponsor address to the total funds deposited
        mapping(address => uint256) deposits;
        // Total funds raised in this sponsorship
        uint256 totalFunds;
    }

    /**
     * @notice Minimum seconds allowed from the time of registration to set
     * the deadline
     */
    uint256 public constant MIN_DEADLINE_PERIOD_SECONDS = 604800;

    /**
     * @notice ERC-20 stablecoin token contract used as currency
     */
    IEIP3009 public stablecoin;

    /**
     * @dev Counter keeping track of how many sponsorships have been registered
     */
    uint256 private _sponsorshipsCounter;

    /**
     * @dev Mapping of sponsorship ID to the struct containing the details
     */
    mapping(uint256 => Sponsorship) private _sponsorships;

    /**
     * @notice Emitted when `sponsor` made a deposit of `amount` to the 
     * sponsorship `sponsorshipId`. Sponsor specific deposits are accumulated
     * and shown as `sponsorsSum`, i.e. if the sponsor has made a single
     * deposit then `amount` equals `sponsorsSum`
     */
    event Deposit(uint256 indexed sponsorshipId, address indexed sponsor, uint256 amount, uint256 sponsorSum);

    /**
     * @notice Emitted when the sponsorship `sponsorshipId` is cancelled
     */
    event Cancel(uint256 indexed sponsorshipId);

    /**
     * @notice Emitted when the amount `funds` raised are transferred to the
     * beneficiary after reaching the amount requested for the sponsorship
     * `sponsorshipId`
     */
    event SponsorshipComplete(uint256 indexed sponsorshipId, uint256 funds);

    /**
     * @notice Emitted when a refund is made to `sponsor` for the amount 
     * `payment` previously done to the sponsorship `sponsorshipId`
     */
    event Refund(uint256 indexed sponsorshipId, address indexed sponsor, uint256 payment);

    /**
     * Constructor initializing contract
     * @param stablecoin_ The ERC20 token contract used as currency
     */
    constructor(IEIP3009 stablecoin_) {
        stablecoin = stablecoin_;
    }

    /**
     * @notice Returns relevant sponsorhip data
     * @param sponsorshipId_ The ID of the sponsorship requested
     * @return requestedAmount The amount requested by the content creator
     * @return deadline Timestamp as seconds in uninx epoch representing the
     * deadline to meet the sponsorship goal
     * @return active True if the sponsorship is active, false otherwise
     * @return sponsorsQuantity How many sponsors have contributed
     * @return totalFunds The amount of funds raised
     */
    function sponsorshipData(uint256 sponsorshipId_) public view returns(
        uint256 requestedAmount,
        uint256 deadline,
        bool active,
        uint256 sponsorsQuantity, 
        uint256 totalFunds
    ) {
        Sponsorship storage sponsorship = _sponsorships[sponsorshipId_];

        require(sponsorship.beneficiary != address(0), "SponsorshipEscrow: sponsorship id does not exits");

        requestedAmount = sponsorship.requestedAmount;
        deadline = sponsorship.deadline;
        active = sponsorship.active;
        sponsorsQuantity = sponsorship.sponsors.length;
        totalFunds = sponsorship.totalFunds;
    }

    /**
     * @notice Registers a new sponsorship. Only this contract's owner
     * is allowed to execute this function
     * @param requestedAmount_ The amount requested by the content creator
     * to be able to deliver. Value must be set in the stablecoin lowest 
     * denomination
     * @param deadline_ Timestamp as seconds in unix epoch representing the 
     * deadline to meet the sponsorship goal.
     * @param beneficiary_ Address of the beneficiary to receive the funds
     * when withdrawn. Most likely a payment splitter.
     * @return the ID of the sponsorship registered
     */
    function registerSponsortship(
        uint256 requestedAmount_,
        uint256 deadline_,
        address beneficiary_
    ) external onlyOwner returns (uint256) {
        // If 0 amount was requested, then it works as if the shares are being auctioned
        // require (requestedAmount_ > 0, "SponsorshipEscrow: zero amount request");
        require(
            deadline_ >= block.timestamp + MIN_DEADLINE_PERIOD_SECONDS, 
            string(abi.encodePacked(
                "SponsorshipEscrow: deadline ends in less than ", 
                Strings.toString(MIN_DEADLINE_PERIOD_SECONDS),
                " seconds"))
        );
        require(beneficiary_ != address(0), "SponsorshipEscrow: zero address beneficiary");

        uint256 sponsorshipId = _sponsorshipsCounter;

        Sponsorship storage sponsorship = _sponsorships[sponsorshipId];
        sponsorship.requestedAmount = requestedAmount_;
        sponsorship.deadline = deadline_;
        sponsorship.beneficiary = beneficiary_;
        sponsorship.active = true;

        _sponsorshipsCounter++;

        return sponsorshipId;
    }

    /**
     * @notice Makes a deposit to the sponsorship `sponsorshipId_`
     * An authorization signature is required to move the stablecoin funds.
     * For the transferWithAuthorization specification see 
     * https://eips.ethereum.org/EIPS/eip-3009
     * For an example of how to sign the authorization using ethers.js see
     * https://docs.ethers.io/v5/api/signer/#Signer-signTypedData
     * @param sponsorshipId_ The ID of the sponsorship funded
     * @param amount_ Amount to deposit in the stablecoin smallest denomination
     * @param nonce_ Random nonce, must be the same used to sign, otherwise
     * the signature will be invalid
     * @param validBefore_ Time in unix epoch when the authorization expires.
     * Must be the same used to sign, otherwise it will be invalidated
     * @param v_ From signature
     * @param r_ From signature
     * @param s_ From signature
     */
    function deposit(
        uint256 sponsorshipId_, 
        uint256 amount_, 
        bytes32 nonce_,
        uint256 validBefore_,
        uint8 v_, 
        bytes32 r_, 
        bytes32 s_
    ) external {
        Sponsorship storage sponsorship = _sponsorships[sponsorshipId_];

        require(sponsorship.beneficiary != address(0), "SponsorshipEscrow: sponsorship id does not exits");
        require(block.timestamp < sponsorship.deadline, "SponsorshipEscrow: sponsorship expired");
        require(sponsorship.active, "SponsorshipEscrow: sponsorship not active");
        require(amount_ > 0, "SponsorshipEscrow: zero mount deposit");

        stablecoin.transferWithAuthorization(
            _msgSender(), 
            address(this), 
            amount_, 
            0, 
            validBefore_, 
            nonce_, 
            v_, r_, s_
        );

        // If sender hasn't done any previous deposits
        if (sponsorship.deposits[_msgSender()] == 0) {
            sponsorship.sponsors.push(_msgSender());
        }
        sponsorship.deposits[_msgSender()] += amount_;
        sponsorship.totalFunds += amount_;

        emit Deposit(
            sponsorshipId_, 
            _msgSender(), 
            amount_, 
            sponsorship.deposits[_msgSender()]
        );
    }

    /**
     * @notice Cancels the specified sponsorship
     * @param sponsorshipId_ The ID of the sponsorship to be cancelled
     */
    function cancel(uint256 sponsorshipId_) external onlyOwner {
        Sponsorship storage sponsorship = _sponsorships[sponsorshipId_];

        require(sponsorship.beneficiary != address(0), "SponsorshipEscrow: sponsorship id does not exits");
        require(sponsorship.active, "SponsorshipEscrow: sponsorship already inactive");

        sponsorship.active = false;

        emit Cancel(sponsorshipId_);
    }

    /**
     * @notice Withdraw the funds raised for the sponsorship and transfer
     * them to the corresponding beneficiary and therefore inactivating the
     * sponsorship
     * @param sponsorshipId_ The sponsorship's ID from where to withdraw
     * @return the list of sponsors, a list of the deposits matching the 
     * sponsors' list and the totla funds raised
     */
    function completeSponsorship(
        uint256 sponsorshipId_
    ) external onlyOwner returns (
        address[] memory,
        uint256[] memory,
        uint256
    ) {
        Sponsorship storage sponsorship = _sponsorships[sponsorshipId_];

        require(sponsorship.beneficiary != address(0), "SponsorshipEscrow: sponsorship id does not exits");
        require(sponsorship.active, "SponsorshipEscrow: sponsorship not active");
        require(sponsorship.totalFunds >= sponsorship.requestedAmount, "SponsorshipEscrow: requested amount not raised");

        sponsorship.active = false;

        stablecoin.transfer(sponsorship.beneficiary, sponsorship.totalFunds);

        emit SponsorshipComplete(sponsorshipId_, sponsorship.totalFunds);

        uint256 sponsorsQty = sponsorship.sponsors.length;
        uint256[] memory deposits = new uint256[](sponsorsQty);

        for (uint256 i = 0; i < sponsorsQty; i++) {
            deposits[i] = sponsorship.deposits[sponsorship.sponsors[i]];
        }

        return (
            sponsorship.sponsors, 
            deposits,
            sponsorship.totalFunds
        );
    }

    /**
     * @notice Refunds to `sponsor` the deposits made to the `sponsorshipId`
     * @param sponsorshipId_ The sponsorship's ID from where to withdraw
     * @param sponsor_ The address of the sponsor who made the deposits and
     * will be refunded
     */
    function refund(uint256 sponsorshipId_, address sponsor_) external {
        Sponsorship storage sponsorship = _sponsorships[sponsorshipId_];

        require(sponsorship.beneficiary != address(0), "SponsorshipEscrow: sponsorship id does not exits");
        if (sponsorship.active) {
            require(
                block.timestamp > sponsorship.deadline, 
                "SponsorshipEscrow: sponsorship active but not expired");
            require(
                sponsorship.totalFunds < sponsorship.requestedAmount, 
                "SponsorshipEscrow: sponsorship active and requested amount goal met");
        }

        uint256 payment = sponsorship.deposits[sponsor_];
        require(payment > 0, "SponsorshipEscrow: nothing to withdraw");

        sponsorship.deposits[sponsor_] = 0;

        stablecoin.transfer(sponsor_, payment);

        emit Refund(sponsorshipId_, sponsor_, payment);
    }

}