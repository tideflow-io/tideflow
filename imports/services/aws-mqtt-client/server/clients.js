let awsIot = require('aws-iot-device-sdk')

import { Meteor } from 'meteor/meteor'
import { Flows } from '/imports/modules/flows/both/collection'
import { Services } from '/imports/modules/services/both/collection'

import filesLib from '/imports/modules/files/server/lib'
import { triggerFlows } from '/imports/queue/server'

/**
 * List of connected AWS IOT DEVICE clients
 * 
 * {
 *   client,
 *   device,
 *   thingName: thingName,
 *   topics: [
 *     { topic: 'dt/temperature', flow: 'QdwzDDQD6XX2iMMRo' },
 *     { topic: 'dt/humidity', flow: 'XgCPK3wzqMb9WnMY6' },
 *   ]
 * }
 */
let cachedClients = []

module.exports.cachedClients = cachedClients

const onConnect = async clientId => {
  // let cachedClient = cachedClients.find(cc => cc.client._id === clientId)
  await Services.update(
    { _id: clientId },
    {
      $set: { 'details.online': true },
      $unset: { 'details.lastSeen': '' }
    }
  )
}

const onOffline = async clientId => {
  // let cachedClient = cachedClients.find(cc => cc.client._id === clientId)
  await Services.update(
    { _id: clientId },
    {
      $set: {
        'details.online': false,
        'details.lastSeen': new Date()
      }
    }
  )
}

const onMessage = (clientId, topic, payload) => {
  let cachedClient = cachedClients.find(cc => cc.client._id === clientId)

  const matchedTopics = cachedClient.topics.filter(t => {
    return t.topic === topic
  })

  if (!matchedTopics.length) return console.log('ignored topic');

  matchedTopics.map(async matchedTopic => {
    // Fire flow
    const flow = Flows.findOne({
      status: 'enabled',
      _id: matchedTopic.flow,
      'trigger.type': 'aws-mqtt-client',
      'trigger._id': clientId,
      'trigger.config.topic': matchedTopic.topic
    })

    if (!flow) return

    let user = Meteor.users.findOne({_id: flow.user}, {
      fields: { services: false }
    })

    if (!user) return

    try {
      payload = JSON.parse(payload)
    } catch (ex) {
      if (Buffer.isBuffer(payload)) {
        payload = {
          files: [
            await filesLib.fileFromBuffer(payload, 'file')
          ]
        }
      }
    }

    triggerFlows(
      flow.trigger,
      user,
      null,
      payload,
      [flow]
    )
  })
}

const connectClient = async client => {
  if (!client) throw new Meteor.Error('no-client')

  if (typeof client === 'string') {
    client = Services.findOne({ _id: client, type: 'aws-mqtt-client' })
  }

  if (!client) throw new Meteor.Error('not-found')

  const thingName = client.config.clientId

  const device = awsIot.device({
    privateKey: Buffer.from(client.config.key),
    clientCert: Buffer.from(client.config.cert),
    caCert: Buffer.from(client.config.ca),
    clientId: thingName,
    host: client.config.host
  })

  let cachedClient = {
    client,
    device,
    thingName: thingName,
    topics: []
  }

  device.on('offline', () => onOffline(client._id))
  device.on('connect', () => onConnect(client._id))
  device.on('message', (topic, payload) => onMessage(client._id, topic, payload))
  
  return cachedClient
}

module.exports.connectClient = connectClient

const disconnectClient = cachedClient => {
  cachedClient.device.end()
  _.remove(cachedClients, cc => {
    return cc.client._id === cachedClient.client._id
  })

  Services.update(
    { _id: cachedClient.client._id },
    {
      $set: {
        'details.online': false,
        'details.lastSeen': new Date()
      }
    }
  )
}

/**
 * 
 * @param {String} clientId Service ID
 * @param {String} flowId Flow's id
 * @param {String} topic MQTT Topic name/filter
 */
const subscribe = async (clientId, flowId, topic) => {
  let cachedClient = cachedClients.find(cc => cc.client._id === clientId)

  if (!cachedClient) {
    let client = Services.findOne({ _id: clientId, type: 'aws-mqtt-client' })
    if (!client) {
      throw new Meteor.Error('not-found')
    }
    // connect client
    cachedClient = await connectClient(client)
    cachedClients.push(cachedClient)
  }

  let matchingTopic = cachedClient.topics.find(t => {
    return t.topic = topic && t.flow === flowId
  })
  
  if (matchingTopic) {
    throw new Meteor.Error('already-subscribed')
  }

  await cachedClient.device.subscribe(topic)
  cachedClient.topics.push({ flow: flowId, topic })
}

module.exports.subscribe = subscribe

/**
 * 
 * @param {String} clientId Service ID
 * @param {String} flowId Flow's id
 * @param {String} topic MQTT Topic name/filter
 */
const unSubscribe = async (clientId, flowId, topic) => {
  let cachedClient = cachedClients.find(cc => cc.client._id === clientId)

  if (!cachedClient) {
    throw new Meteor.Error('no-cachedClient-found')
  }

  let matchingTopic = cachedClient.topics.find(t => {
    return t.topic === topic && t.flow === flowId
  })
  
  if (matchingTopic) {
    await cachedClient.device.unsubscribe(topic)
    _.remove(cachedClient.topics, { topic })
  }

  if (!cachedClient.topics.length) {
    disconnectClient(cachedClient)
  }
}

module.exports.unSubscribe = unSubscribe