/* eslint-env mocha */
import { assert } from 'chai'
import { calledFrom, callsTo, isCircular, analyze } from '../both/flow'

describe('callsTo', () => {
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
      "0": [1],
      "1": [3],
      "2": [1],
      "3": [4],
      trigger: [0]
    }

    const result = callsTo(input)
    assert.deepEqual(result, expected)
  })
})

describe('isCircular', () => {
  it('simple flow', () => {
    const input = {
      trigger : { outputs : [  { stepIndex : 0 } ] },
      steps : [
        { outputs : [ { stepIndex : 1 } ] },
        { outputs : [ { stepIndex : 3 } ] },
        { outputs : [ { stepIndex : 1 } ] },
        { outputs : [ ] }
      ]
    }

    const result = isCircular(input)
    assert.equal(result, false)
  })
  
  it('simple circular flow', () => {
    const input = {
      trigger : { outputs : [  { stepIndex : 0 } ] },
      steps : [
        { outputs : [ { stepIndex : 1 } ] },
        { outputs : [ { stepIndex : 3 } ] },
        { outputs : [ { stepIndex : 1 } ] },
        { outputs : [ { stepIndex : 1 } ] }
      ]
    }

    const result = isCircular(input)
    assert.equal(result, true)
  })
})

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

describe('analyze', () => {
  it('super simple flow', () => {
    const input = {
      trigger : { outputs : [  { stepIndex : 0 } ] },
      steps : [
        { outputs : [ { stepIndex : 1 } ] },
        { outputs : [ { stepIndex : 2 } ] },
        { outputs : [] }
      ]
    }
    
    const result = analyze(input)
    assert.deepEqual(result, {
        steps: 3,
        errors: {
          hasEmptyConditions: false,
          isCircular: false,
          hasConditionsNotMet: false
        },
        isErrored: false,
        stepsExecuted: [],
        stepsToExecute: [ 0, 1, 2, 'trigger' ],
        stepsToDiscard: [],
        completed: false
    })
  })
})