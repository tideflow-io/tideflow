/* eslint-env mocha */
import { assert } from 'chai'
import { pick } from './objects'

describe('helpers/both/objects', () => {
  it('all properties', () => {
    const result = pick({a: 1, b: 2, c: 3}, ['a', 'b', 'c'])
    assert.deepEqual(result, {a: 1, b: 2, c: 3})
  })

  it('some properties', () => {
    const result = pick({a: 1, b: 2, c: 3}, ['a', 'c'])
    assert.deepEqual(result, {a: 1, c: 3})
  })

  it('no properties', () => {
    const result = pick({a: 1, b: 2, c: 3}, [])
    assert.deepEqual(result, {})
  })
})