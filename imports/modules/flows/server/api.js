import { Router } from 'meteor/iron:router'
import { authenticate } from '../../_common/server/api'
import { Flows } from '../both/collection'

/**
 * 
 * @param {Object} res 
 * @param {Object} data 
 * @param {Number} status 
 */
const reply = (res, data, status) => {
  if (typeof data === 'object') {
    res.end(JSON.stringify(data, null, 2));
  }
  else {
    res.writeHead(status || 200)
    res.end(data);
  }
}

Router.route('/api/flows', function () {
  const req = this.request
  const res = this.response
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  authenticate(req.headers)
    .then(u => {
      let flowsQuery = {
        user: u._id
      }

      if (req.query.triggerType) {
        flowsQuery['trigger.type'] = req.query.triggerType
      }

      let flows = Flows.find(flowsQuery, {
        fields: { _id: true, title: true, 'trigger.type': true }
      }).fetch()

      reply(res, flows)
    })
    .catch(ex => {
      reply(res, ex.reason, 409)
    })

}, {where: 'server'})