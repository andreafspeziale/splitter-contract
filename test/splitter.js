var Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', function(accounts) {

    var contract;
    var ownerOrSender = accounts[0];
    var first_recipient = accounts[1];
    var second_recipient = accounts[2];

    // deploy
    beforeEach(function() {
        return Splitter.new({from: ownerOrSender}).then(function(_instance){
             contract = _instance;
        })
    })

    it("should be own by owner", function(){
        return contract.owner({from: ownerOrSender}).then(function(_owner){
            assert.strictEqual(_owner, ownerOrSender, "Contract owner is not the same");
        })
    })

    it("should not be created passing a value", function(){
        return Splitter.new({from: ownerOrSender, value: 10}).then(function(_instance){
            //
        }).catch(err => assert.include(err.message, 'non-payable constructor', 'Contract cannot be created with value'))
    })

    describe("testing split function", function() {
        describe("failing cases", function(){

            it("should fail if the owner/sender is second_recipient", function(){
                return contract.split(first_recipient, ownerOrSender, {from: ownerOrSender, value: 1})
                    .then(function(txn){
                        //
                    }).catch(err => assert.include(err.message, 'revert', 'state reverted because of owner is one of the recipient'))
            })

            it("should fail if the owner/sender is first_recipient", function(){
                return contract.split(ownerOrSender, second_recipient, {from: ownerOrSender, value: 1})
                    .then(function(txn){
                        //
                    }).catch(err => assert.include(err.message, 'revert', 'state reverted because of owner is one of the recipient'))
            })

            it("should fail if the recipients are the same", function(){
                return contract.split(second_recipient, second_recipient, {from: ownerOrSender, value: 1})
                    .then(function(txn){
                        //
                    }).catch(err => assert.include(err.message, 'revert', 'state reverted because the address are the same'))
            })

            it("should fail if the first_recipient is empty", function(){
                return contract.split('', second_recipient, {from: ownerOrSender, value: 1})
                    .then(function(txn){
                        //
                    }).catch(err => assert.include(err.message, 'revert', 'state reverted because the first_recipient is empty'))
            })

            it("should fail if the second_recipient is empty", function(){
                return contract.split(first_recipient, '', {from: ownerOrSender, value: 1})
                    .then(function(txn){
                        //
                    }).catch(err => assert.include(err.message, 'revert', 'state reverted because the second_recipient is empty'))
            })

            it("should fail if the recipients are empty", function(){
                return contract.split('', '', {from: ownerOrSender, value: 1})
                    .then(function(txn){
                        //
                    }).catch(err => assert.include(err.message, 'revert', 'state reverted because the empty address'))
            })
        })
    })
})