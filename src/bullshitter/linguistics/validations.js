import Assert from 'assert';
import * as lodash from 'lodash';

const { isString, isBoolean } = lodash;

const validators = {
  mergePhrases: {
    input: (input, sharedWord) => {
      Assert(Array.isArray(input));
      const [ firstPhrase, secondPhrase ] = input;
      Assert(isString(firstPhrase));
      Assert(isString(secondPhrase));
      Assert(isString(sharedWord));

      const sharedWordRegexp = new RegExp(sharedWord, 'i');
      Assert(firstPhrase.match(sharedWordRegexp));
      Assert(secondPhrase.match(sharedWordRegexp));

    },
    output: output => {
      Assert(isString(output))
    }
  },

  phraseCanBeLeftHalf: {
    input: (phrase, word) => {
      Assert(isString(phrase)); // fails sometime
      Assert(isString(word))
    },
    output: result => {
      Assert(isBoolean(result));
    }
  }
};

export default validators;
