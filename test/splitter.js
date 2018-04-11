var Splitter = artifacts.require("./Splitter.sol")

contract('Splitter', function(accounts) {

    var contract
    var owner_or_sender = accounts[0]
    var first_recipient = accounts[1]
    var second_recipient = accounts[2]
    var third_party = accounts[3]

    // deploy
    beforeEach(function() {
        return Splitter.new({from: owner_or_sender}).then(function(_instance){
             contract = _instance
        })
    })

    it("should be own by owner", function(){
        return contract.owner({from: owner_or_sender}).then(function(_owner){
            assert.strictEqual(_owner, owner_or_sender, "Contract owner is not the same")
        })
    })

    it("should not be created passing a value", function(){
        return Splitter.new({from: owner_or_sender, value: 10}).then(function(_instance){
            //
        }).catch(err => assert.include(err.message, 'non-payable constructor'))
    })

    describe("Testing split public function:", function() {

        describe("Failing cases:", function(){

            it("should fail if the owner/sender is second_recipient", function(){
                return contract.split(first_recipient, owner_or_sender, {from: owner_or_sender, value: 1})
                    .then(function(_txn){
                        //
                    }).catch(err => assert.include(err.message, 'revert'))
            })

            it("should fail if the owner/sender is first_recipient", function(){
                return contract.split(owner_or_sender, second_recipient, {from: owner_or_sender, value: 1})
                    .then(function(_txn){
                        //
                    }).catch(err => assert.include(err.message, 'revert'))
            })

            it("should fail if the recipients are the same", function(){
                return contract.split(second_recipient, second_recipient, {from: owner_or_sender, value: 1})
                    .then(function(_txn){
                        //
                    }).catch(err => assert.include(err.message, 'revert'))
            })

            it("should fail if the first_recipient is empty", function(){
                return contract.split('', second_recipient, {from: owner_or_sender, value: 1})
                    .then(function(_txn){
                        //
                    }).catch(err => assert.include(err.message, 'revert'))
            })

            it("should fail if the second_recipient is empty", function(){
                return contract.split(first_recipient, '', {from: owner_or_sender, value: 1})
                    .then(function(_txn){
                        //
                    }).catch(err => assert.include(err.message, 'revert'))
            })

            it("should fail if the recipients are empty", function(){
                return contract.split('', '', {from: owner_or_sender, value: 1})
                    .then(function(_txn){
                        //
                    }).catch(err => assert.include(err.message, 'revert'))
            })

            it("should fail because of amount = 0", function(){
                return contract.split(first_recipient, second_recipient, {from: owner_or_sender, value: 0})
                    .then(function(_txn){
                        //
                    }).catch(err => assert.include(err.message, 'revert'))
            })

            it("should fail because of amount % 2 != 0", function(){
                return contract.split(first_recipient, second_recipient, {from: owner_or_sender, value: 1})
                    .then(function(_txn){
                        //
                    }).catch(err => assert.include(err.message, 'revert'))
            })
        })
        describe("Successful cases:", function(){
            it("should not change recipients balances", function(){
                            var first_recipient_initial_balance = web3.eth.getBalance(first_recipient)
                            var second_recipient_initial_balance = web3.eth.getBalance(second_recipient)

                            return contract.split(first_recipient, second_recipient, {from: owner_or_sender, value: 2})
                                .then(_res => {
                                    var first_recipient_final_balance = web3.eth.getBalance(first_recipient)
                                    var second_recipient_final_balance = web3.eth.getBalance(second_recipient)
                                    
                                    assert.strictEqual(first_recipient_initial_balance.toString(10), first_recipient_final_balance.toString(10), "first_recipient has a changed balance")
                                    assert.strictEqual(second_recipient_initial_balance.toString(10), second_recipient_final_balance.toString(10), "second_recipient has a changed balance")
                                })
                        })

            it("should remove 2 from sender balance", function(){
                var owner_or_sender_initial_balance = web3.eth.getBalance(owner_or_sender)

                return contract.split(first_recipient, second_recipient, {from: owner_or_sender, value: 2})
                    .then(_res => {

                        var owner_or_sender_final_balance = web3.eth.getBalance(owner_or_sender)

                        var gas_used = _res.receipt.gasUsed
                        var tx = web3.eth.getTransaction(_res.tx)
                        var gas_price = tx.gasPrice

                        assert.strictEqual(owner_or_sender_final_balance.toString(10), owner_or_sender_initial_balance.minus(2).minus(gas_price.mul(gas_used)).toString(10), "second_recipient has not gotten the correct amount")
                    })
            })

            it("should map first_recipient address to balance 1", function(){
                return contract.split(first_recipient, second_recipient, {from: owner_or_sender, value: 2})
                    .then(_res => {
                        return  contract.balances(first_recipient, {from: owner_or_sender})
                            .then(_balance => {
                                assert.strictEqual(_balance.toString(10), "1", "first_recipient not mapped to balance = 1")
                            })
                    })
            })

            it("should map second_recipient address to balance 1", function(){
                return contract.split(first_recipient, second_recipient, {from: owner_or_sender, value: 2})
                    .then(_res => {
                        return  contract.balances(second_recipient, {from: owner_or_sender})
                            .then(_balance => {
                                assert.strictEqual(_balance.toString(10), "1", "second_recipient not mapped to balance = 1")
                            })
                    })
            })

        })
        /*
        describe("Successful cases:", function(){

            it("should split correctly", function(){
                var first_recipient_initial_balance = web3.eth.getBalance(first_recipient)
                var second_recipient_initial_balance = web3.eth.getBalance(second_recipient)
                var owner_or_sender_initial_balance = web3.eth.getBalance(owner_or_sender)

                return contract.split(first_recipient, second_recipient, {from: owner_or_sender, value: 2})
                    .then(_res => {
                        var first_recipient_final_balance = web3.eth.getBalance(first_recipient)
                        var second_recipient_final_balance = web3.eth.getBalance(second_recipient)
                        var owner_or_sender_final_balance = web3.eth.getBalance(owner_or_sender)

                        var gas_used = _res.receipt.gasUsed
                        var tx = web3.eth.getTransaction(_res.tx)
                        var gas_price = tx.gasPrice

                        assert.strictEqual(first_recipient_final_balance.toString(10), first_recipient_initial_balance.plus(1).toString(10), "first_recipient has not gotten the correct amount")
                        assert.strictEqual(second_recipient_final_balance.toString(10), second_recipient_initial_balance.plus(1).toString(10), "second_recipient has not gotten the correct amount")
                        assert.strictEqual(owner_or_sender_final_balance.toString(10), owner_or_sender_initial_balance.minus(2).minus(gas_price.mul(gas_used)).toString(10), "second_recipient has not gotten the correct amount")
                    })
            })

            it("should split correctly", function(){
                return contract.split.call(first_recipient, second_recipient, {from: owner_or_sender, value: 2})
                    .then(_res => {
                        assert.strictEqual(_res, true, "is not splitting correctly")
                    })
            })
        })*/

        //ToDo check on inherited contracts functionalities
    })
})