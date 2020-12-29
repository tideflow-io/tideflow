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
  
  it('simple flow', () => {
    const input = {
      trigger: { outputs: [ { stepIndex: 1 } ] },
      steps: [
        { type: 'abc', outputs: [ { reason: 'step', stepIndex: 2 } ] },      /* 0 */
        { type: 'abc', outputs: [ { reason: 'step', stepIndex: 2 } ] },      /* 1 */
        { type: 'abc', outputs: [ { reason: 'step', stepIndex: 3 } ] },      /* 2 */
        { type: 'abc', outputs: [] }                                         /* 3 */
      ]
    }
    
    {
      let result = analyze(input, [])
      assert.equal(result.errors.isCircular, false)
      assert.equal(result.completed, false)
      assert.deepEqual(result.stepsToExecute, [0,1,2,3,'trigger'])
    }
    
    {
      let result = analyze(input, [
        { stepIndex: 0 },
        { stepIndex: 1 },
        { stepIndex: 2 },
        { stepIndex: 'trigger' },
      ])
      assert.equal(result.completed, false)
      assert.deepEqual(result.stepsToExecute, [0,1,2,3,'trigger'])
    }
    
    {
      let result = analyze(input, [
        { stepIndex: 0 },
        { stepIndex: 1 },
        { stepIndex: 2 },
        { stepIndex: 3 },
        { stepIndex: 'trigger' },
      ])
      assert.equal(result.completed, true)
      assert.deepEqual(result.stepsToExecute, [0,1,2,3,'trigger'])
    }
  })

  it('conditions-no-results', () => {
    const input = {
      trigger: { outputs: [ { stepIndex: 1 } ] },
      steps: [
        { type: 'abc', outputs: [ { reason: 'step', stepIndex: 2 } ] },      /* 0 */
        { type: 'abc', outputs: [ { reason: 'step', stepIndex: 2 } ] },      /* 1 */
        { type: 'conditions', outputs: [ ] }                                 /* 2 */
      ]
    }

    {
      let result = analyze(input, [])
      assert.deepEqual(result.stepsToExecute, undefined)
      assert.equal(result.errors.hasEmptyConditions, true)
      assert.equal(result.errors.isCircular, false)
      assert.equal(result.completed, false)
      assert.equal(result.isErrored, true)
    }
  })

  it('circular-with-conditions', () => {
    const input = {
      trigger: { outputs: [ { stepIndex: 1 } ] },
      steps: [
        { type: 'abc', outputs: [ { reason: 'step', stepIndex: 2 } ] },      /* 0 */
        { type: 'abc', outputs: [ { reason: 'step', stepIndex: 2 } ] },      /* 1 */
        { type: 'conditions', outputs: [                                     /* 2 */
          { reason: 'condition-false', stepIndex: 3 },
          { reason: 'condition-true', stepIndex: 4 } 
        ] },
        { type: 'abc', outputs: [ { reason: 'step', stepIndex: 0 } ] },      /* 3 */
        { type: 'abc', outputs: [] }                                         /* 4 */
      ]
    }

    {
      let result = analyze(input, [
        { stepIndex: 2, result: { pass: true } }
      ])
      assert.equal(result.errors.isCircular, true)
      assert.equal(result.isErrored, true)
      assert.equal(result.completed, false)
    }

    {
      let result = analyze(input, [
        { stepIndex: 2, result: { pass: false } }
      ])
      assert.equal(result.errors.isCircular, true)
      assert.equal(result.isErrored, true)
      assert.equal(result.completed, false)
    }

    {
      let result = analyze(input, [
      ])
      assert.equal(result.errors.isCircular, true)
      assert.equal(result.isErrored, true)
      assert.equal(result.completed, false)
    }
  })

  it('circular', () => {
    const input = {
      trigger: { outputs: [ { stepIndex: 1 } ] },
      steps: [
        { type: 'abc', outputs: [ { reason: 'step', stepIndex: 2 } ] },      /* 0 */
        { type: 'abc', outputs: [ { reason: 'step', stepIndex: 2 } ] },      /* 1 */
        { type: 'abc', outputs: [                                            /* 2 */
          { reason: 'step', stepIndex: 0 },                                  
          { reason: 'step', stepIndex: 3 }
        ] },
        { type: 'abc', outputs: [] },                                        /* 3 */
      ]
    }

    {
      let result = analyze(input, [
        { stepIndex: 2, result: { pass: true } }
      ])
      assert.equal(result.errors.isCircular, true)
      assert.equal(result.isErrored, true)
      assert.equal(result.completed, false)
    }

    {
      let result = analyze(input, [
        { stepIndex: 2, result: { pass: false } }
      ])
      assert.equal(result.errors.isCircular, true)
      assert.equal(result.isErrored, true)
      assert.equal(result.completed, false)
    }

    {
      let result = analyze(input, [
        { stepIndex: 0 },
        { stepIndex: 1 },
        { stepIndex: 2 },
        { stepIndex: 3 }
      ])
      assert.equal(result.errors.isCircular, true)
      assert.equal(result.isErrored, true)
      assert.equal(result.completed, false)
    }

    {
      let result = analyze(input, [
        { stepIndex: 0 },
        { stepIndex: 1 },
        { stepIndex: 2, result: { pass: true } },
        { stepIndex: 3 }
      ])
      assert.equal(result.errors.isCircular, true)
      assert.equal(result.isErrored, true)
      assert.equal(result.completed, false)
    }

    {
      let result = analyze(input, [
        { stepIndex: 0 },
        { stepIndex: 1 },
        { stepIndex: 2, result: { pass: false } },
        { stepIndex: 3 }
      ])
      assert.equal(result.errors.isCircular, true)
      assert.equal(result.isErrored, true)
      assert.equal(result.completed, false)
    }
  })

  it('complex-with-conditions-not-met - aka circular', () => {
    const input = {
      trigger: { outputs: [ { stepIndex: 1 }, { stepIndex: 6 } ] },
      steps: [
        { type: 'abc', outputs: [ { reason: 'step', stepIndex: 2 } ] },      /* 0 */
        { type: 'abc', outputs: [                                            /* 1 */
          { reason: 'step', stepIndex: 2 },
          { reason: 'step', stepIndex: 5 }
        ] },
        { type: 'conditions', outputs: [                                     /* 2 */
          { reason: 'condition-false', stepIndex: 3 },
          { reason: 'condition-true', stepIndex: 4 } 
        ] },
        { type: 'abc', outputs: [ { reason: 'step', stepIndex: 9 } ] },      /* 3 */
        { type: 'abc', outputs: [ { reason: 'step', stepIndex: 9 } ] },      /* 4 */
        { type: 'abc', outputs: [ { reason: 'step', stepIndex: 9 } ] },      /* 5 */
        { type: 'abc', outputs: [ { reason: 'step', stepIndex: 9 } ] },      /* 6 */
        { type: 'abc', outputs: []},                                         /* 7 */
        { type: 'abc', outputs: [ { stepIndex: 2 } ]},                       /* 8 */
        { type: 'conditions', outputs: [                                     /* 9 */
          { reason: 'condition-false', stepIndex: 7 },
          { reason: 'condition-true', stepIndex: 8 } 
        ] }
      ]
    }

    {
      let result = analyze(input, [])
      console.log(result)
      assert.equal(result.errors.isCircular, true)
      assert.equal(result.isErrored, true)
      assert.equal(result.completed, false)
    }
  })

  it('complex-with-condition', () => {
    const input = {
      trigger: { outputs: [ { stepIndex: 1 }, { stepIndex: 6 } ] },
      steps: [
        { type: 'abc', outputs: [ { reason: 'step', stepIndex: 2 } ] },      /* 0 */
        { type: 'abc', outputs: [                                            /* 1 */
          { reason: 'step', stepIndex: 2 },
          { reason: 'step', stepIndex: 5 }
        ] },
        { type: 'conditions', outputs: [                                     /* 2 */
          { reason: 'condition-false', stepIndex: 3 },
          { reason: 'condition-true', stepIndex: 4 } 
        ] },
        { type: 'abc', outputs: [] },                                        /* 3 */
        { type: 'abc', outputs: [ { reason: 'step', stepIndex: 9 } ] },      /* 4 */
        { type: 'abc', outputs: [ { reason: 'step', stepIndex: 9 } ] },      /* 5 */
        { type: 'abc', outputs: [ { reason: 'step', stepIndex: 9 } ] },      /* 6 */
        { type: 'abc', outputs: []},                                         /* 7 */
        { type: 'abc', outputs: []},                                         /* 8 */
        { type: 'conditions', outputs: [                                     /* 9 */
          { reason: 'condition-false', stepIndex: 7 },
          { reason: 'condition-true', stepIndex: 8 } 
        ] }
      ]
    }

    {
      let result = analyze(input, [])
      assert.equal(result.errors.isCircular, false)
      assert.equal(result.completed, false)
    }

    {
      let result = analyze(input, [
        { stepIndex: 2, result: { pass: false } }
      ])
      assert.equal(result.errors.isCircular, false)
      assert.equal(result.completed, false)
    }

    {
      let result = analyze(input, [
        { stepIndex: 'trigger' },
        { stepIndex: 0 },
        { stepIndex: 1 },
        { stepIndex: 2, result: { pass: true } },
        { stepIndex: 4 },
        { stepIndex: 5 },
        { stepIndex: 6 },
        { stepIndex: 8 },
        { stepIndex: 9, result: { pass: true } }
      ])
      assert.equal(result.errors.isCircular, false)
      assert.equal(result.completed, true)
      assert.deepEqual(result.stepsToExecute, [ 0, 1, 2, 4, 5, 6, 8, 9, 'trigger' ],)
    }
  })

  it('condition', () => {
    const input = {
      trigger: { outputs: [ { stepIndex: 1 } ] },
      steps: [
        { type: 'abc', outputs: [ { reason: 'step', stepIndex: 2 } ] },      /* 0 */
        { type: 'abc', outputs: [ { reason: 'step', stepIndex: 2 } ] },      /* 1 */
        { type: 'conditions', outputs: [                                     /* 2 */
          { reason: 'condition-false', stepIndex: 3 },
          { reason: 'condition-true', stepIndex: 4 } 
        ] },
        { type: 'abc', outputs: [] },                                        /* 3 */
        { type: 'abc', outputs: [] }                                         /* 4 */
      ]
    }

    {
      let result = analyze(input, [])
      assert.deepEqual(result.stepsToExecute, [0,1,2,'trigger'])
      assert.equal(result.errors.isCircular, false)
      assert.equal(result.completed, false)
    }

    {
      let result = analyze(input, [
        {stepIndex: 2, result: { pass: false }}
      ])
      assert.deepEqual(result.stepsToExecute, [0,1,2,3,'trigger'])
      assert.equal(result.errors.isCircular, false)
      assert.equal(result.completed, false)
    }

    {
      let result = analyze(input, [
        {stepIndex: 0},
        {stepIndex: 1},
        {stepIndex: 2, result: { pass: false }},
        {stepIndex: 3},
        {stepIndex: 'trigger'}
      ])
      assert.deepEqual(result.stepsToExecute, [0,1,2,3,'trigger'])
      assert.equal(result.errors.isCircular, false)
      assert.equal(result.completed, true)
    }

    {
      let result = analyze(input, [
        {stepIndex: 0},
        {stepIndex: 0}, // 1 removed on purpose
        {stepIndex: 2, result: { pass: false }},
        {stepIndex: 3},
        {stepIndex: 'trigger'}
      ])
      assert.deepEqual(result.stepsToExecute, [0,1,2,3,'trigger'])
      assert.equal(result.errors.isCircular, false)
      assert.equal(result.completed, false)
    }

    {
      let result = analyze(input, [
        {stepIndex: 0},
        {stepIndex: 1},
        {stepIndex: 2, result: { pass: false }},
        {stepIndex: 3},
        {stepIndex: 'trigger'}
      ])
      assert.deepEqual(result.stepsToExecute, [0,1,2,3,'trigger'])
      assert.equal(result.errors.isCircular, false)
      assert.equal(result.completed, true)
    }
  })

  it('conditions-only-one-result', () => {
    const input = {
      trigger: { outputs: [ { stepIndex: 1 } ] },
      steps: [
        { type: 'abc', outputs: [ { reason: 'step', stepIndex: 2 } ] },      /* 0 */
        { type: 'abc', outputs: [ { reason: 'step', stepIndex: 2 } ] },      /* 1 */
        { type: 'conditions', outputs: [                                     /* 2 */
          { reason: 'condition-true', stepIndex: 3 } 
        ] },
        { type: 'abc', outputs: [] },                                        /* 3 */
      ]
    }
    
    {
      let result = analyze(input, [])
      assert.equal(result.errors.hasEmptyConditions, false)
      assert.equal(result.errors.isCircular, false)
      assert.equal(result.completed, false)
      assert.deepEqual(result.stepsToExecute, [0,1,2,'trigger'])
    }
    
    {
      let result = analyze(input, [
        { stepIndex: 2, result: { pass: false } }
      ])
      assert.equal(result.errors.hasEmptyConditions, false)
      assert.equal(result.errors.isCircular, false)
      assert.equal(result.completed, false)
      assert.deepEqual(result.stepsToExecute, [0,1,2,'trigger'])
    }
    
    {
      let result = analyze(input, [
        { stepIndex: 2, result: { pass: true } }
      ])
      assert.equal(result.errors.hasEmptyConditions, false)
      assert.equal(result.errors.isCircular, false)
      assert.equal(result.completed, false)
      assert.deepEqual(result.stepsToExecute, [0,1,2,3,'trigger'])
    }
    
    {
      let result = analyze(input, [
        { stepIndex: 0 },
        { stepIndex: 1 },
        { stepIndex: 2, result: { pass: true } },
        { stepIndex: 3 },
        { stepIndex: 'trigger' }
      ])
      assert.equal(result.errors.hasEmptyConditions, false)
      assert.equal(result.errors.isCircular, false)
      assert.equal(result.completed, true)
      assert.deepEqual(result.stepsToExecute, [0,1,2,3,'trigger'])
    }
    
    {
      let result = analyze(input, [
        { stepIndex: 0 },
        { stepIndex: 0 },
        { stepIndex: 2, result: { pass: true } },
        { stepIndex: 3 },
        { stepIndex: 'trigger' }
      ])
      assert.equal(result.errors.hasEmptyConditions, false)
      assert.equal(result.errors.isCircular, false)
      assert.equal(result.completed, false)
      assert.deepEqual(result.stepsToExecute, [0,1,2,3,'trigger'])
    }
    
    {
      let result = analyze(input, [
        { stepIndex: 2, result: { pass: true } },
        { stepIndex: 2, result: { pass: true } },
        { stepIndex: 2, result: { pass: true } },
        { stepIndex: 2, result: { pass: true } },
        { stepIndex: 2, result: { pass: true } },
        { stepIndex: 2, result: { pass: true } }
      ])
      assert.equal(result.errors.hasEmptyConditions, false)
      assert.equal(result.errors.isCircular, false)
      assert.equal(result.completed, false)
      assert.deepEqual(result.stepsToExecute, [0,1,2,3,'trigger'])
    }
  })
})