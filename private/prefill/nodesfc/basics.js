/**
 * @dependency lodash latest
 */
require('lodash').map([1,2,3,4], n => console.log(n))

/**
 * @dependency faker latest
 */
let fake = require('faker').fake('{{name.lastName}}, {{name.firstName}}')
console.log(fake)