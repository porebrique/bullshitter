import Validations from '../../../src/bullshitter/linguistics/validations';

describe('Linguistic\'s validations', () => {
  describe('for .mergePhrases', () => {
    const { mergePhrases } = Validations;
    describe('input arguments', () => {
      const correctInputPhrases = ['one two', 'two five'];
      const correctSharedWord = 'two';

      it('passes validation with correct arguments', () => {
        const correctArguments = [
          correctInputPhrases,
          correctSharedWord
        ];
        expect(() => {
          mergePhrases.input(...correctArguments);
        }).not.toThrow();
      });

      describe('fails validation with incorrect arguments', () => {
        const invalidArgumentsSets = [
          {name: 'when first arg is not an array', args: ['', correctSharedWord]},
          {name: 'when first arg contains wrong first item', args: [[123, 'two five'], correctSharedWord]},
          {name: 'when first arg contains wrong second item', args: [['one two', 123], correctSharedWord]},
          {name: 'when second arg is not a string', args: [correctInputPhrases, 123]},
          {name: 'when second arg is not found in any first arg', args: [correctInputPhrases, 'eleven']}
        ];

        invalidArgumentsSets.forEach(({ name, args }) => {
          it(name, () => {
            expect(() => {
              mergePhrases.input(...args);
            }).toThrow();
          });
        });

      });

    });

    describe('output arguments', () => {
      it('passes validation with correct arguments (which is string)', () => {
        expect(() => {
          mergePhrases.output('some string');
        }).not.toThrow();
      });

      describe('fails validation with incorrect arguments', () => {
        const wrongArgs = [
          ['number', 123],
          ['boolean', true],
          ['array', []],
          ['object', {}],
          ['undefined', undefined],
          ['null', null]
        ];
        wrongArgs.forEach(([ name, arg ]) => {
          it(name, () => {
            expect(() => {
              mergePhrases.output(arg);
            }).toThrow();
          });
        });
      });

    });

  });

  describe('for .phraseCanBeLeftHalf', () => {
    const { phraseCanBeLeftHalf } = Validations;

    describe('input arguments', () => {
      const { input } = phraseCanBeLeftHalf;
      it('passes validation with correct arguments (which are strings)', () => {
        expect(() => {
          input('', '');
        }).not.toThrow();
      });

      describe('fails validation with incorrect arguments', () => {
        const wrongArgs = [
          ['First one is not a string', [1, '']],
          ['Second one is not a string', ['', {}]],
        ];
        wrongArgs.forEach(([ name, args ]) => {
          it(name, () => {
            expect(() => {
              input(...args);
            }).toThrow();
          });
        });
      });
    });

    describe('output arguments', () => {
      const { output } = phraseCanBeLeftHalf;
      it('passes validation with correct arguments (which is boolean)', () => {
        expect(() => {
          output(true);
        }).not.toThrow();
      });

      describe('fails validation with incorrect arguments', () => {
        const wrongArgs = [
          ['number', 123],
          ['array', []],
          ['object', {}],
          ['undefined', undefined],
          ['null', null]
        ];
        wrongArgs.forEach(([ name, arg ]) => {
          it(name, () => {
            expect(() => {
              output(arg);
            }).toThrow();
          });
        });
      });
    });


  });

});