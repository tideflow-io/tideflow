let awsIot = require('aws-iot-device-sdk')

import { Meteor } from 'meteor/meteor'

import { triggerFlows } from '/imports/queue/server'
import { Services } from '/imports/modules/services/both/collection'
import { Flows } from '/imports/modules/flows/both/collection'
import filesLib from '/imports/modules/files/server/lib'

/**
 * List of connected AWS IOT DEVICE clients
 * 
 * {
 *   client,
 *   device,
 *   thingName: thingName,
 *   topics: []
 * }
 */
let cachedClients = []

module.exports.cachedClients = cachedClients

const connected = client => {
  Services.update(
    { _id: client._id },
    {
      $set: { 'details.online': true },
      $unset: { 'details.lastSeen': '' }
    }
  )
}

Meteor.startup(async () => {

  await Services.update(
    { type: 'aws-mqtt-client' },
    { $set: { 'details.online': false } },
    { multi: true }
  )

  const clientsInDb = Services.find({ type: 'aws-mqtt-client' })

  clientsInDb.forEach(async client => {

    // Find flows using client as trigger
    const clientFlows = Flows.find({
      'trigger.type': 'aws-mqtt-client',
      'trigger._id': client._id
    })

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

    device.on('connect', async () => {
      clientFlows.forEach(flow => {
        const { topic } = flow.trigger.config
        device.subscribe(topic)
        cachedClient.topics.push({
          topic,
          flow: flow._id
        })
      })
    })

    device.on('message', (topic, payload) => {
      console.log(`  "${thingName}" message on "${topic}"`)
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
          'trigger._id': client._id,
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

        await triggerFlows(
          flow.trigger,
          user,
          null,
          payload,
          [flow]
        )
      })
    })

    cachedClients.push(cachedClient)
  })
})