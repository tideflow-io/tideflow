import { servicesAvailable, executionResults } from '/imports/services/_root/server'

const getValue = (object, path) => path.split('.').reduce((o, k) => (o || {})[k], object);

let getNumber = (val, exception) => {
  let r = Number(val)
  if (isNaN(r) && exception) throw Meteor.Error('Not a number')
  return r
}

const process = {
  string: {
    contains: (original, expected) => original.includes(expected),
    eq: (original, expected) => original === expected,
    begins: (original, expected) => original.startsWith(expected),
    ends: (original, expected) => original.endsWith(expected)
  },
  number: {
    eq: (original, expected) => original === expected,
    gt: (original, expected) => original > expected,
    gte: (original, expected) => original >= expected,
    lt: (original, expected) => original < expected,
    lte: (original, expected) => original <= expected,
    between: (original, expected) => {
      let input = original.split(',')
      min = getNumber(input[0], true)
      max = getNumber(input[1], true)
      expected = getNumber(expected, true)
      if (min > max || min >= max) throw Meteor.Error('Min-not-min')
      return expected > min && expected < max
    }
  }
}

module.exports.process = process

const error = (cb, message) => {
  cb(null, {
    result: {},
    error: true,
    next: false,
    msgs: [
      {
        m: message,
        d: new Date(),
        e: true
      }
    ]
  })
}

const service = {
  name: 'conditions',
  inputable: false,
  stepable: true,
  ownable: false,
  events: [
    {
      name: 'if',
      capabilities: {
        runInOneGo: true
      },
      callback: (user, currentStep, executionLogs, execution, logId, cb) => {
        
        const {
          step, property, type, comparison, expected
        } = currentStep.config

        let compareAgainst 
        
        if (!step || step.trim() === '') return error(cb, 's-conditions.events.if.errors.noStepDef')
        if (!property || property.trim() === '') return error(cb, 's-conditions.events.if.errors.noPropertyDef')
        if (!type || type.trim() === '') return error(cb, 's-conditions.events.if.errors.noTypeDef')
        if (!comparison || comparison.trim() === '') return error(cb, 's-conditions.events.if.errors.noComparisonDef')
        if (!expected || expected.trim() === '') return error(cb, 's-conditions.events.if.errors.noExpectedDef')

        let tplResults = executionResults(execution, executionLogs, {external: true})
        
        try {
          compareAgainst = getValue(tplResults.tasks[step].result.data, property)
        }
        catch (ex) {
          return error(cb, 's-conditions.events.if.errors.valueNotFound')
        }

        let pass

        try {
          pass = process[type][comparison](compareAgainst, expected)
        }
        catch (ex) {
          return error(cb, 's-conditions.events.if.errors.unknown')
        }

        cb(null, {
          result: {pass},
          next: true
        })
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)