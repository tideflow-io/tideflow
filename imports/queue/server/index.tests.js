/* eslint-env mocha */
import { assert } from 'chai'
import { calledFrom } from './index'

describe('queue/server/index', () => {
  describe('calledFrom', () => {
    it('simple flow', () => {
      const input = {
        trigger : { outputs : [  { stepIndex : 0 } ] },
        steps : [
          { outputs : [ { stepIndex : 1 } ] },
          { outputs : [ { stepIndex : 3 } ] },
          { outputs : [ { stepIndex : 1 } ] },
          { outputs : [ { stepIndex : 4 } ] }
        ]
      }

      const expected = {
        0: ['trigger'],
        1: [0, 2],
        // 2: [],
        3: [1],
        4: [3]
      }

      const result = calledFrom(input)
      assert.deepEqual(result, expected)
    })

    it('multi output flow', () => {
      const input = {
        trigger : { outputs : [  { stepIndex : 0 } ] },
        steps : [
          { outputs : [ { stepIndex : 1 } ] },
          { outputs : [ { stepIndex : 3 } ] },
          { outputs : [ { stepIndex : 1 }, { stepIndex : 4 } ] },
          { outputs : [ { stepIndex : 4 } ] }
        ]
      }

      const expected = {
        0: ['trigger'],
        1: [0, 2],
        // 2: [],
        3: [1],
        4: [2, 3]
      }

      const result = calledFrom(input)
      assert.deepEqual(result, expected)
    })

    it('multi to multi output flow', () => {
      const input = {
        trigger : { outputs : [  { stepIndex : 0 }, { stepIndex : 1 }, { stepIndex : 3 } ] },
        steps : [
          { outputs : [ { stepIndex : 1 } ] },
          { outputs : [ { stepIndex : 3 }, { stepIndex : 2 } ] },
          { outputs : [ { stepIndex : 1 }, { stepIndex : 4 } ] },
          { outputs : [ { stepIndex : 4 } ] }
        ]
      }

      const expected = {
        0: ['trigger'],
        1: [0, 2, 'trigger'],
        2: [1],
        3: [1, 'trigger'],
        4: [2, 3]
      }

      const result = calledFrom(input)
      assert.deepEqual(result, expected)
    })
  })
})