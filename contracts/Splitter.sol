pragma solidity ^0.4.19;

// Imports
import "./Ownable.sol";
import "./Pausable.sol";

/**
 * @title Splitter
 * @dev Contract for funds splitting btw 2 address
*/

contract Splitter is Ownable, Pausable{

    // Event
    event Split(address indexed _from, address indexed _first_recipient, address indexed _second_recipient, uint _amount);
    event Withdraw(address indexed _from, uint _amount);

    mapping(address => uint) public depositTracker;

    modifier canWithdraw() {
        require(depositTracker[msg.sender] > 0);
        _;
    }

    /**
     * @dev private function to avoid self, same address, empty address splits
    */
    function _areAcceptableRecipients(address _first_recipient, address _second_recipient) private view returns (bool areAvoided) {
        require(_first_recipient != _second_recipient);
        require(_first_recipient != address(0x00) && _second_recipient != address(0x00));
        require(_first_recipient != msg.sender && _second_recipient != msg.sender);
        return true;
    }

    /**
     * @dev private function to actually pay the recipients
    */
    function _isDivisible(uint _amount) private pure returns (bool isDivisible) {
        require(_amount > 0);
        require(_amount % 2 == 0);
        return true;
    }

    /**
     * @dev private function to actually pay the recipients
    */
    function _pay(address _recipient, uint _amount) private {
        _recipient.transfer(_amount);
    }

    /**
     * @dev public function for splitting
    */
    function split(address _first_recipient, address _second_recipient) public returns (bool splitSuccess) {
        // checks
        if(!_areAcceptableRecipients(_first_recipient, _second_recipient)) revert();
        if(!_isDivisible(msg.value)) revert();

        // split the amount
        uint amountSplitted = msg.value / 2;

        // each time the amount will be overwritten in this way
        withdrawals[_first_recipient] = amountSplitted;
        withdrawals[_second_recipient] = amountSplitted;

        // emit the Split event
        emit Split(msg.sender, _first_recipient, _second_recipient, amountSplitted);

        return true;
    }

    /**
     * @dev public function for withdraw funds only if sender is in the depositTracker
    */
    function withdraw() canWithdraw public payable returns(bool withdrawSuccess) {
        // emit the Split event
        emit Withdraw(msg.sender, depositTracker[msg.sender]);
        _pay(msg.sender, depositTracker[msg.sender]);
        return true;
    }
}