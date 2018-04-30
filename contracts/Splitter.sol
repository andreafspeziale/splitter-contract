pragma solidity ^0.4.19;

// Imports
import "./Ownable.sol";
import "./Pausable.sol";

/**
 * @title Splitter
 * @dev Contract for funds splitting btw 2 address and withdraw requests
*/

contract Splitter is Ownable, Pausable{

    // Event
    event LogSplit(address indexed from, address indexed firstRecipient, address indexed secondRecipient, uint amount);
    event LogWithdraw(address indexed from, uint amount);

    mapping(address => uint) public balances;

    function Splitter(bool _status) Pausable(_status) public {}

    /**
     * @dev public function for splitting
    */
    function split(address firstRecipient, address secondRecipient) public payable returns (bool splitSuccess) {
        // checks
        require(_areAcceptableRecipients(firstRecipient, secondRecipient));
        require(_isDivisible(msg.value));

        // split the amount
        uint amountSplitted = msg.value / 2;

        // each time the amount will be overwritten in this way
        balances[firstRecipient] += amountSplitted;
        balances[secondRecipient] += amountSplitted;

        // emit the Split event
        LogSplit(msg.sender, firstRecipient, secondRecipient, amountSplitted);

        return true;
    }

    /**
     * @dev public function for withdraw funds only if sender is in the balances
    */
    function withdraw() public payable returns(bool withdrawSuccess) {
        uint amount = balances[msg.sender];
        if(!(amount > 0)) revert();
        balances[msg.sender] = 0;
        msg.sender.transfer(amount);
        LogWithdraw(msg.sender, amount);
        return true;
    }

    /**
     * @dev private function to avoid self, same address, empty address splits
    */
    function _areAcceptableRecipients(address firstRecipient, address secondRecipient) private view returns (bool areAvoided) {
        require(firstRecipient != secondRecipient);
        require(firstRecipient != address(0x00) && secondRecipient != address(0x00));
        require(firstRecipient != msg.sender && secondRecipient != msg.sender);
        return true;
    }

    /**
     * @dev private function to actually pay the recipients
    */
    function _isDivisible(uint _amount) private pure returns (bool isDivisible) {
        return _amount > 0 && _amount % 2 == 0;
    }
}