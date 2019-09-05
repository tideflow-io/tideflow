/* eslint-env mocha */
import { assert } from 'chai'
import { compare } from './compare'

describe('compare', () => {
  describe('types', () => {
    it('string vs int', () => assert.equal(compare('1', 1), false))
    it('arr vs str', () => assert.equal(compare(['1'], '1'), false))
    it('str vs str', () => assert.equal(compare('1', '1'), true))
    it('arr vs obj', () => assert.equal(compare([], {}), false))
  })

  describe('arrays', () => {
    it('[] vs []', () => assert.equal(compare([], []), true))
    it('[1] vs [1]', () => assert.equal(compare([1], [1]), true))
    it("['1'] vs [1]", () => assert.equal(compare(['1'], [1]), false))
    it('[] vs [1]', () => assert.equal(compare([], [1]), false))
  })

  describe('objects', () => {
    it('{} vs {}', () => assert.equal(compare({}, {}), true))
    it('{a:1} vs {a:1}', () => assert.equal(compare({a:1}, {a:1}), true))
    it("{a: '1'} vs {a:1}", () => assert.equal(compare({a: '1'}, {a:1}), false))
    it('{} vs {a:1}', () => assert.equal(compare({}, {a:1}), false))
  })
})