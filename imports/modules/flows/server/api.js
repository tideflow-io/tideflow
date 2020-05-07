import { Router } from 'meteor/iron:router'
import { authenticate, catchHandler, reply } from '../../_common/server/api'
import { Flows } from '../both/collection'

Router.route('/api/flows', function () {
  const req = this.request
  const res = this.response

  authenticate(req.headers)
    .then(user => {
      let flowsQuery = { user: user._id }

      if (req.query.triggerType) {
        flowsQuery['trigger.type'] = req.query.triggerType
      }

      let flows = Flows.find(flowsQuery, {
        fields: { _id: true, title: true, 'trigger.type': true, 'trigger.config': true }
      }).fetch()

      reply(res, flows)
    })
    .catch(ex => catchHandler(res, ex))

}, {where: 'server'})