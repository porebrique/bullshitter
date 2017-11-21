import Assert from 'assert';

const validators = {
  mergePhrases: {
    input: (input, sharedWord) => {
      Assert(Array.isArray(input));
      Assert(typeof input[0] === 'string');
      Assert(typeof input[1] === 'string');
      Assert(typeof sharedWord === 'string');

      const sharedWordRegexp = new RegExp(sharedWord, 'i');
      Assert(input[0].match(sharedWordRegexp));
      Assert(input[1].match(sharedWordRegexp));

    },
    output: function (output) {
      Assert(typeof output === 'string')
    }
  },

  phraseCanBeLeftHalf: {
    input: (phrase, word) => {
      Assert(typeof phrase === "string"); // fails sometime
      Assert(typeof word === "string")
    },
    output: result => {
      Assert(typeof result === 'boolean');
    }
  }
};

export default validators;
