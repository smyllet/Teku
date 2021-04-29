const assert = require('assert')
const Sondage = require('../Discord/Class/Sondage')
const SondageOption = require('../Discord/Class/SondageOption')

describe('Class Sondage', () => {
    /** @Type {Sondage} */
    let sondage1, sondage2, sondage3

    beforeEach(function(){
        sondage1 = new Sondage('Nouveau sondage')
        sondage2 = new Sondage('Sondage sans vote')
        sondage3 = new Sondage('Sondage terminé')

        sondage2.addOption(new SondageOption(':sob:', 'Choix 1'))
        sondage2.addOption(new SondageOption(':cry:', 'Choix 2'))
        sondage2.addOption(new SondageOption(':smile:', 'Choix 3'))

        sondage3.addOption(new SondageOption(':sob:', 'Choix 1'))
        sondage3.addOption(new SondageOption(':cry:', 'Choix 2'))
        sondage3.addOption(new SondageOption(':smile:', 'Choix 3'))
        sondage3.addOption(new SondageOption(':grinning:', 'Choix 4'))
    });

    describe('getOptions()', () => {
        it(`sondage1 shouldn't have options`, () => {
            assert.strictEqual(sondage1.getOptions().length, 0);
        });

        it(`sondage2 should have 3 options`, () => {
            assert.strictEqual(sondage2.getOptions().length, 3);
        });

        it(`sondage3 should have 4 options`, () => {
            assert.strictEqual(sondage3.getOptions().length, 4);
        });
    })

    describe('getNbVote()', () => {
        it(`sondage1 should have 0 vote`, () => {
            assert.strictEqual(sondage1.getNbVote(), 0);
        });

        it(`sondage2 should have 0 vote`, () => {
            assert.strictEqual(sondage2.getNbVote(), 0);
        });

        it(`sondage3 should have 0 vote`, () => {
            assert.strictEqual(sondage3.getNbVote(), 0);
        });
    })

    describe('calculPercentVote()', () => {
        it(`sondage1 should return 0 percent for 0 vote`, () => {
            assert.strictEqual(sondage1.calculPercentVote(0), 0);
        });

        it(`sondage1 should return 0 percent for 2 vote`, () => {
            assert.strictEqual(sondage1.calculPercentVote(2), 0);
        });

        it(`sondage3 should return 0 percent for 0 vote`, () => {
            assert.strictEqual(sondage3.calculPercentVote(0), 0);
        });
    })

    describe('getReact()', () => {
        it(`Sondage1 shouldn't have react`, () => {
            assert.strictEqual(sondage1.getReact().length, 0)
        })

        it(`Sondage2 should have 3 react`, () => {
            assert.strictEqual(sondage2.getReact().length, 3)

            assert.notStrictEqual(sondage2.getReact().indexOf(':sob:'), -1)
            assert.notStrictEqual(sondage2.getReact().indexOf(':cry:'), -1)
            assert.notStrictEqual(sondage2.getReact().indexOf(':smile:'), -1)
        })

        it(`Sondage3 should have 4 react`, () => {
            assert.strictEqual(sondage3.getReact().length, 4)

            assert.notStrictEqual(sondage3.getReact().indexOf(':sob:'), -1)
            assert.notStrictEqual(sondage3.getReact().indexOf(':cry:'), -1)
            assert.notStrictEqual(sondage3.getReact().indexOf(':smile:'), -1)
            assert.notStrictEqual(sondage3.getReact().indexOf(':grinning:'), -1)
        })
    })
})