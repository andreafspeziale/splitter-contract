// ToDo move to const

const Splitter = artifacts.require("./Splitter.sol")
const _ = require('lodash')

contract('Splitter', function(accounts) {

    let contract
    const ownerOrSender = accounts[0]
    const firsRecipient = accounts[1]
    const secondRecipient = accounts[2]
    const thirdParty = accounts[3]

    const expectEvent = (res, eventName) => {
        const ev = _.find(res.logs, {event: eventName})
        expect(ev).to.not.be.undefined
        return ev
    }

    beforeEach(async() => {
        contract = await Splitter.new(false)        
    })
    
    // I expected it would fail but it isn't
    // it("should not be created passing a value", async () => {
    //     try {
    //         const split = await Splitter.new('ciao')
    //         console.log(split)
    //     } catch(e) {
    //         console.error(`Error: ${e}`)
    //     }
    // })

    describe("Ownership stuff:", async () => {
        it("should be own by owner", async () => {
            const owner = await contract.owner({from: ownerOrSender})
            assert.strictEqual(owner, ownerOrSender, "Contract owner is not the same")
        })

        it("should set a new owner", async () => {
            const transferOwnership = await contract.transferOwnership(firsRecipient)
            const newOwner = await contract.owner()
            assert.strictEqual(newOwner, firsRecipient, "Contract owner has not been updated")
        })

        it("should log an LogOwnershipTransferred event", async () => {
            const transferOwnership = await contract.transferOwnership(secondRecipient)
            const newOwner = await contract.owner()
            const ev = expectEvent(transferOwnership, 'LogOwnershipTransferred')
            expect(ev.args.previousOwner).to.equal(ownerOrSender)
            expect(ev.args.newOwner).to.equal(secondRecipient)
        })
    })

    describe("Pause stuff:", async () => {
        it("should set pause property to false", async () => {
            const status = await contract.paused()
            assert.strictEqual(status, false, "Contract owner is not the same")
        })

        it("should not be able to set pause", async () => {
            try {
                const status = await contract.pause({from: firsRecipient})
                assert.isUndefined(status, 'Anyone can pause my contract')
            } catch(err) {
                assert.include(err.message, 'revert', 'No revert if anyone kill my contract');
            }
        })

        it("should be able to set pause", async () => {
                const pause = await contract.pause()
                const status = await contract.paused()
                assert.strictEqual(status, true, 'Owner is not able to pause the contract')
        })

        it("should LogPause event", async () => {
            const pause = await contract.pause()
            const ev = expectEvent(pause, 'LogPause')
            expect(ev.args.whodunnit).to.equal(ownerOrSender)
        })

        it("should LogUnpause event", async () => {
            const pause = await contract.pause()
            const ev = expectEvent(pause, 'LogPause')
            expect(ev.args.whodunnit).to.equal(ownerOrSender)
        })
    })

    describe("Split public function:", async () => {
        it("should fail if the owner/sender is the part of the split process", async () => {
            try {
                const split = await contract.split(firsRecipient, ownerOrSender, {from: ownerOrSender, value: 1})
                assert.isUndefined(split, 'The owner can take part in the split proccess')
            } catch(e) {
                assert.include(e.message, 'revert', 'The owner cannot take part in the split proccess');
            }
        })
        it("should fail if the recipients are the same", async () => {
            try {
                const split = await contract.split(firsRecipient, firsRecipient, {from: ownerOrSender, value: 1})
                assert.isUndefined(split, 'The split process can accept same recipients')
            } catch(e) {
                assert.include(e.message, 'revert', 'The split process cannot accept same recipients');
            }
        })
        it("should fail if the the recipient is empty", async () => {
            try {
                const split = await contract.split(firsRecipient, '0x0000000000000000000000000000000000000000', {from: ownerOrSender, value: 1})
                assert.isUndefined(split, 'The split process can accept empty recipients')
            } catch(e) {
                assert.include(e.message, 'revert', 'The split process cannot accept empty recipients');
            }
        })
        it("should fail because of amount = 0", async () => {
            try {
                const split = await contract.split(firsRecipient, secondRecipient, {from: ownerOrSender, value: 0})
                assert.isUndefined(split, 'The split process can accept 0 as msg.value')
            } catch(e) {
                assert.include(e.message, 'revert', 'The split process cannot accept 0 as msg.value');
            }
        })
        it("should fail because of odd amounts", async () => {
            try {
                const split = await contract.split(firsRecipient, secondRecipient, {from: ownerOrSender, value: 1})
                assert.isUndefined(split, 'The split process can accept odd amounts')
            } catch(e) {
                assert.include(e.message, 'revert', 'The split process cannot accept odd amounts');
            }
        })
        it("should not change recipients balances", async () => {
            const firstInitial = web3.eth.getBalance(firsRecipient)
            const secondInitial = web3.eth.getBalance(secondRecipient)
            const split = await contract.split(firsRecipient, secondRecipient, {from: ownerOrSender, value: web3.toWei('4', 'ether')})
            const firstFinal = web3.eth.getBalance(firsRecipient)
            const secondFinal = web3.eth.getBalance(secondRecipient)
            assert.strictEqual(firstInitial.toString(10), firstFinal.toString(10), "firsRecipient has a changed balance")
            assert.strictEqual(secondInitial.toString(10), secondFinal.toString(10), "secondRecipient has a changed balance")
        })
        it("should set 2 ehter to be withdraw for both the recipients", async () => {
            const split = await contract.split(firsRecipient, secondRecipient, {from: ownerOrSender, value: web3.toWei('4', 'ether')})
            const balances = await contract.balances(firsRecipient)
            const balances2 = await contract.balances(secondRecipient)
            assert.strictEqual(balances.toString(10), web3.toWei('2', 'ether').toString(10), "firsRecipient has not 2 ether ready for withdraw")
            assert.strictEqual(balances2.toString(10), web3.toWei('2', 'ether').toString(10), "firsRecipient has not 2 ether ready for withdraw")
        })
        it("should fire LogSplit event", async () => {
            const split = await contract.split(firsRecipient, secondRecipient, {from: ownerOrSender, value: web3.toWei('4', 'ether')})
            const ev = expectEvent(split, 'LogSplit')
            expect(ev.args.from).to.equal(ownerOrSender)
            expect(ev.args.firstRecipient).to.equal(firsRecipient)
            expect(ev.args.secondRecipient).to.equal(secondRecipient)
            expect(ev.args.amount.toString(10)).to.equal(web3.toWei('2', 'ether'))
        })

        it("should find 0 ehter to be withdraw by thirdParty", async () => {
            const split = await contract.split(firsRecipient, secondRecipient, {from: ownerOrSender, value: web3.toWei('4', 'ether')})
            const balances = await contract.balances(thirdParty)
            assert.strictEqual(balances.toString(10), web3.toWei('0', 'ether').toString(10), "thirdParty has not 0 ether ready for withdraw")
        })
    })
    describe("Withdraw public function:", async () => {
        it("should fire LogWithdraw event", async () => {
            const split = await contract.split(firsRecipient, secondRecipient, {from: ownerOrSender, value: web3.toWei('4', 'ether')})
            const withdraw = await contract.withdraw({from: firsRecipient})
            const ev = expectEvent(withdraw, 'LogWithdraw')
            expect(ev.args.from).to.equal(firsRecipient)
            expect(ev.args.amount.toString(10)).to.equal(web3.toWei('2', 'ether'))
        })
        it("should increase recipient balance", async () => {
            const initial = web3.eth.getBalance(firsRecipient)
            const split = await contract.split(firsRecipient, secondRecipient, {from: ownerOrSender, value: web3.toWei('4', 'ether')})
            const withdraw = await contract.withdraw({from: firsRecipient})
            const final = web3.eth.getBalance(firsRecipient)
            assert.isAbove(final, initial, "firsRecipient balance is not greater than before the withdraw request")
        })
    })
})