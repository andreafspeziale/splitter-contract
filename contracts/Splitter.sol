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
    function _splitPay(address _first_recipient, address _second_recipient, uint _amount) private {
        _first_recipient.transfer(_amount);
        _second_recipient.transfer(_amount);
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
     * @dev public function for splitting
    */
    function split(address _first_recipient, address _second_recipient) public payable returns (bool splitSuccess) {
        // checks
        if(!_areAcceptableRecipients(_first_recipient, _second_recipient)) revert();
        if(!_isDivisible(msg.value)) revert();

        // split the amount
        uint amountSplitted = msg.value / 2;

        // pay the splitted amount to recipients
        _splitPay(_first_recipient, _second_recipient, amountSplitted);

        // emit the event
        emit Split(msg.sender, _first_recipient, _second_recipient, amountSplitted);

        return true;
    }
}