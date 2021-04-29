const assert = require('assert')
const SondageOption = require('../Discord/Class/SondageOption')

describe('Class SondageOption', () => {
    /** @type {SondageOption} */
    let option1, option2

    beforeEach(function(){
        option1 = new SondageOption(':sob:', 'Choix 1')
        option2 = new SondageOption(':cry:', 'Choix 2')

        option2.setNbVote(5)
    });

    describe('up()', () => {
        it('option1 should have 1 vote', () => {
            option1.up()
            assert.strictEqual(option1.getNbVote(), 1)
        })

        it('option1 should have 2 vote', () => {
            option1.up()
            option1.up()
            assert.strictEqual(option1.getNbVote(), 2)
        })

        it('option2 should have 6 vote', () => {
            option2.up()
            assert.strictEqual(option2.getNbVote(), 6)
        })
    })

    describe('down()', () => {
        it('option1 should have 0 vote', () => {
            option1.down()
            assert.strictEqual(option1.getNbVote(), 0)
        })

        it('option2 should have 4 vote', () => {
            option2.down()
            assert.strictEqual(option2.getNbVote(), 4)
        })

        it('option2 should have 3 vote', () => {
            option2.down()
            option2.down()
            assert.strictEqual(option2.getNbVote(), 3)
        })
    })

    describe('reset()', () => {
        it('option1 should have 0 vote', () => {
            option1.reset()
            assert.strictEqual(option1.getNbVote(), 0)
        })

        it('option2 should have 0 vote', () => {
            option2.reset()
            assert.strictEqual(option2.getNbVote(), 0)
        })
    })
})