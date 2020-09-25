import socket_io from 'socket.io'

import { Meteor } from 'meteor/meteor'
import { WebApp } from 'meteor/webapp';
import { ExecutionsLogs } from '/imports/modules/executionslogs/both/collection'
import { Services } from '/imports/modules/services/both/collection'

import { executeNextStep, executionError } from '/imports/queue/server'
import { pick } from '/imports/helpers/both/objects'

// Server
const io = socket_io(WebApp.httpServer)

const logUpdate = (context, messages, extras) => {
  const { log, execution } = context

  let push = {
    msgs: { $each: messages }
  }

  if (messages && messages.length) {
    push['stepResult.data'] = { $each: (messages||[]).map(l => l.m) }
  }

  return ExecutionsLogs.update({_id: log, execution}, {
    $set: Object.assign({}, extras, { 'stepResult.type': 'array' }),
    $push: push
  })
}

Meteor.startup(async () => {
  await Services.update(
    { type: 'agent' },
    {
      $set: { 'details.online': false },
      $unset: { 'secrets.socketId': '' }
    },
    { multi: true }
  )
  
  // middleware
  io.use(async (socket, next) => {
    let token = socket.handshake.query.token
    let c = await Services.findOne({
      type: 'agent',
      'config.token': token
    })

    if(!c) return next(new Error('authentication error'))

    socket.tf = {
      _id: c._id,
      token,
      user: c.user,
      title: c.title,
      description: c.description
    }
    return next()
  })

  // New client
  io.on('connection', async (socket) => {
    let auth = socket.tf
    await Services.update(
      { _id: auth._id },
      { 
        $set: {
          'details.online': true,
          'secrets.socketId': socket.id
        },
        $unset: { 'details.lastSeen': '' }
      }
    )
    
    socket.emit('tf.authz', auth)

    // An agent is reporting std/err output.
    // Add this to the list of messages for the workflow's execution step.
    socket.on('tf.notify.progress', async message => {
      console.log('progress', message.stdLines)
      await logUpdate(
        message,
        message.stdLines
      )
    })

    // An agent is reporting std/err output.
    // Add this to the list of messages for the workflow's execution step.
    socket.on('tf.notify.finishBulk', async message => {
      let err = !!message.error

      await logUpdate(
        message,
        message.stdLines,
        { status: err ? 'error' : 'success' }
      )

      if (err) {
        executionError(pick(message, ['flow', 'execution']))
      }
      else {
        executeNextStep(pick(message, ['flow', 'execution', 'log', 'step']))
      }
    })

    // An agent is reporting std/err and the exit code
    // Add this to the list of messages for the workflow's execution step.
    socket.on('tf.notify.finish', async message => {
      console.log('finih', message.stdLines)
      await logUpdate(
        message,
        message.stdLines,
        { status: message.error ? 'error' : 'success' }
      )

      if (message.error) {
        executionError(pick(message, ['flow', 'execution']))
      }
      else {
        executeNextStep(pick(message, ['flow', 'execution', 'log', 'step']))
      }
      // Once reported, check if the Workflow have more steps to execute
    })


    // An agent is reporting an exception when executing the command
    socket.on('tf.notify.exception', async message => {
      await logUpdate(
        message,
        [
          { m: message.ex, p: null, err: true, d: new Date() }
        ],
        { status: 'error' }
      )
      executionError(pick(message, ['flow', 'execution']))
    })
    
    socket.on('disconnect', async socket => {
      await Services.update(
        { _id: auth._id },
        {
          $set: {
            'details.online': false,
            'details.lastSeen': new Date()
          },
          $unset: { 'secrets.socketId': '' }
        }
      )
    })
  })
})

/**
 * Sends a message to an agent.
 * 
 * @param {Object} agent 
 * @param {*} message 
 * @param {*} topic 
 */
const ioTo = (agent, message, topic) => {
  if (agent === 'any') {
    // TODO Select the most recent-online agent and send it the message.
    // If not agents found, set the execution and the step as failed.
  }
  else {
    try {
      if (!agent.secrets.socketId) throw new Error('agent-not-connected')
      return io
        .to(agent.secrets.socketId)
        .emit(topic, message)
    }
    catch (ex) {
      console.error(ex)
      executionError(pick(message, ['flow', 'execution']))
      return null
    }
  }
}

module.exports.ioTo = ioTo