/* eslint-env mocha */
import { assert, expect } from 'chai'
import { guessTriggerSingleChilds, calculateNumberOfSteps } from './index'

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
  describe('calculateNumberOfSteps', () => {
    it('no conditions', () => {
      const input = {
        trigger : { outputs : [  { stepIndex : 0 } ] },
        steps : [
          { outputs : [ { reason: 'step', stepIndex : 1 } ] },
          { outputs : [ { reason: 'step', stepIndex : 2 } ] },
          { outputs : [ { reason: 'step', stepIndex : 3 } ] },
          { outputs : [] }
        ]
      }
      let steps = [
        { stepIndex: 'trigger' },
        { stepIndex: 0 },
        { stepIndex: 1 },
        { stepIndex: 2 },
        { stepIndex: 3 }
      ]
      expect(calculateNumberOfSteps(input, steps)).to.equal(5)
    })

    it('one condition T', () => {
      const input = {
        trigger : { outputs : [ { stepIndex : 2 } ] },
        steps : [
          { outputs : [ { reason: 'step', stepIndex : 2 } ] },
          { outputs : [ { reason: 'step', stepIndex : 2 } ] },
          { outputs : [
            { reason: 'condition-true', stepIndex : 3 },
            { reason: 'condition-false', stepIndex : 5 } 
          ] },
          { outputs : [ { reason: 'step', stepIndex : 4 } ] },
          { outputs : [] }
        ]
      }
      let steps = [
        { stepIndex: 'trigger' },
        { stepIndex: 0 },
        { stepIndex: 1 },
        { stepIndex: 2, bridgedIndexes: ['trigger', 0, 1], pass: true },
        { stepIndex: 3 },
        { stepIndex: 4 }
      ]
      expect(calculateNumberOfSteps(input, steps)).to.equal(5)
    })

    it('one condition F', () => {
      const input = {
        trigger : { outputs : [  { stepIndex : 2 } ] },
        steps : [
          { outputs : [ { reason: 'step', stepIndex : 2 } ] },
          { outputs : [ { reason: 'step', stepIndex : 2 } ] },
          { outputs : [
            { reason: 'condition-true', stepIndex : 3 },
            { reason: 'condition-false', stepIndex : 5 } 
          ] }, // condition
          { outputs : [ { reason: 'step', stepIndex : 4 } ] },
          { outputs : [] }
        ]
      }
      let steps = [
        { stepIndex: 'trigger' },
        { stepIndex: 0 },
        { stepIndex: 1 },
        { stepIndex: 2, bridgedIndexes: ['trigger', 0, 1], pass: true },
        { stepIndex: 3 },
        { stepIndex: 4 }
      ]
      expect(calculateNumberOfSteps(input, steps)).to.equal(5)
    })

    it('two conditions TT', () => {
      
    })

    it('two conditions FF', () => {
      
    })

    it('two conditions TF', () => {
      
    })

    it('two conditions FT', () => {
      
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
        const expected = [1]
        const result = guessTriggerSingleChilds(input)
        assert.deepEqual(result, expected)
      })
    })
  })
})