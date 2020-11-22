/**
 * @dependency lodash latest
 * @dependency faker latest
 */
module.exports.handler = async () => {
  require('lodash').map([1,2,3,4], n => console.log(n));
  let fake = require('faker').fake('{{name.lastName}}, {{name.firstName}}');
  return { fake }
}
