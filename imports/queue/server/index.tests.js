/* eslint-env mocha */
import { assert } from 'chai'
import { calledFrom, guessTriggerSingleChilds } from './index'

const fullFlow = {
	"_id" : "DP4pNdGZ73owhkt3q",
	"team" : "9ZQy8WkSiPMRfJMJh",
	"title" : "endpoint-test",
	"status" : "enabled",
	"trigger" : {
		"type" : "endpoint",
		"event" : "called",
		"config" : {
			"endpoint" : "2cc6ce80-8235-4cbc-b72f-9dbc3cf8364d"
		},
		"x" : 220,
		"y" : 165,
		"outputs" : [
			{
				"stepIndex" : 1
			}
		]
	},
	"steps" : [
		{
			"type" : "file",
			"event" : "create-input-log-file",
			"outputs" : [ ],
			"x" : 675,
			"y" : 128,
			"id" : "123"
		}
	],
	"user" : "gZ3sEZJGYPY5futtp",
	"createdAt" : new Date(),
	"updatedAt" : new Date(),
	"capabilities" : {
		"runInOneGo" : true
	}
}

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

  describe('guessTriggerSingleChilds', () => {
    describe('simple test', () => {
      it('must return 0', () => {
        const input = {
          trigger : { outputs : [  { stepIndex : 0 } ] },
          steps : [
          ]
        }

        const expected = [0]

        const result = guessTriggerSingleChilds(input)
        assert.deepEqual(result, expected)
      })
    })

    describe('extended test', () => {
      it('should work', () => {
        const input = fullFlow
        const expected = [0]
        const result = guessTriggerSingleChilds(input)
        assert.deepEqual(result, expected)
      })
    })
  })
})