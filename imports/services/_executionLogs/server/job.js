import { Meteor } from 'meteor/meteor'
import * as tfQueue from '/imports/queue/server'
import { moment } from 'meteor/momentjs:moment'
import * as emailHelper from '/imports/helpers/server/emails'

import { Executions } from '/imports/modules/executions/both/collection.js'

/**
 * Get the list of users suitable to receive an executions log email
 * 
 * @param {String} type 
 */
let getTargetedUsers = (type) => {
  return Meteor.users.find({
    'profile.notifications.myExecutions.schedule': type,
    'emails.verified': true
  }, {
    // Get only name and verified email addresses
    fields: {
      'emails.$.address': true,
      'profile.firstName': true,
      'profile.lastName': true
    }
  })
}

/**
 * Build the email contents and scheule it
 * 
 * {
 *  type: String,
 *  name: String, User's full name
 *  to: String, Target email address
 *  flows: [
 *    {
 *      title: '',
 *      href: '',
 *      executions: [
 *        {
 *          title: String,
 *          href: String,
 *          status: String,
 *          createdAt: Date,
 *          updatedAt: Date,
 *        }
 *      ]
 *    }
 *  ]
 * }
 * 
 * @param {Object} user 
 * @param {String} type 
 */
let buildAndScheduleEmail = (user, options) => {
  const start = moment().startOf( options.weekly ? 'week' : 'day' )

  // Get the user executions since the start of day/week
  const executions = Executions.find({
    user: user._id,
    createdAt: {$gte: start.toDate()}
  }, {
    sort: {
      createdAt: 1
    }
  }).fetch()

  // Build the email's basic data
  let email = {
    isWeekly: !!options.weekly,
    isDaily: !options.weekly,
    name: `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim(),
    to: user.emails[0].address,
    flows: []
  }

  // Attach flows executions to the email's data
  _.chain(executions)
    .groupBy('flow')
    .map((list, flow) => {
      const fullFlow = list[0].fullFlow
      email.flows.push({
        title: fullFlow.title,
        href: fullFlow._id,
        executions: list.map(execution => {
          let { _id, status, createdAt, updatedAt } = execution
          let result = {
            title: _id.substr(0, 3),
            href: _id,
            status,
            createdAt,
            updatedAt
          }
          result.isStarted = status === 'started'
          result.isFinished = status === 'finished'
          result.isErrored = status === 'error'
          return result
        })
      })
    })
    .value()

  if (email.flows && email.flows.length)
    tfQueue.jobs.run('_executionLogsSendEmail', email)
  
  return email
}

tfQueue.jobs.register('_executionLogsRun', function() {
  const instance = this

  // Is it Sunday ? 
  const runWeekly = true // new Date().getDay() === 0

  if (runWeekly) {
    let users = getTargetedUsers('weekly')
    users.forEach(async (u) => buildAndScheduleEmail(u, {weekly: true}))
  }

  {
    let users = getTargetedUsers('daily')
    users.forEach(async (u) => buildAndScheduleEmail(u, {daily: true}))
  }

  instance.replicate({
    in: {
      hours: 24
    },
    date: instance.document.due
  })

  instance.success()
})

tfQueue.jobs.register('_executionLogsSendEmail', function(emailData) {
  let data = emailHelper.data([emailData.to], {}, emailData, 'ExecutionLogs')
  emailHelper.send(data)
  this.success()
})


Meteor.startup(() => {
  tfQueue.jobs.run('_executionLogsRun', null, {
    on: {
      hour: 23,
      minute: 59,
      second: 59,
      milliseconds: 0
    },
    priority: 9999999999,
    singular: true
  })
})
