var Splitter = artifacts.require("./Splitter.sol");

contract('Campaign', function(accounts) {

    var contract;
    var ownerOrSender = accounts[0];
    var first_recipient = accounts[1];
    var second_recipient = = accounts[2];

    // deploy
    beforeEach(function() {
        return Splitter.new({from: ownerOrSender}).then(function(instance){
             contract = instance;
        })
    })

    it("should be own by owner", function(){
        return contract.owner({from: ownerOrSender}).then(function(_owner){
            assert.strictEqual(_owner, ownerOrSender, "Contract owner is not the same")
        })
    })
})