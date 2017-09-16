/*
 * Usage: bind(['func1', 'method2']).to(this)
 */
export default (functionNames) => ({
  to: (context) => {
    functionNames.forEach((functionName) => {
      if (context[functionName]) {
        context[functionName] = context[functionName].bind(context); // eslint-disable-line
      } else {
        console.error(`Component doesn't have method "${functionName}"`); // eslint-disable-line
      }
    });
  }
});
