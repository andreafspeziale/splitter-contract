pragma solidity ^0.4.19;

// Imports
import "./Ownable.sol";
import "./Destructible.sol";

contract Splitter is Ownable, Destructible{
    // Event
    event Split(address from, address first_recipient, address second_recipient, uint amount);

    /**
    * @title _avoidSelfSplit
    * @dev private function to avoid self, same address, empty address splits
    */
    function _avoidRecipientErrors(address _first_recipient, address _second_recipient) private view returns (bool areAvoided) {
        require(_first_recipient != _second_recipient);
        require(_first_recipient != address(0x00) && _second_recipient != address(0x00));
        require(_first_recipient != msg.sender && _second_recipient != msg.sender);
        return true;
    }

    /**
    * @title _
    * @dev private function to actually pay the recipients
    */
    function _splitPay(address _first_recipient, address _second_recipient, uint _amount) private {
        _first_recipient.transfer(_amount);
        _second_recipient.transfer(_amount);
    }
}