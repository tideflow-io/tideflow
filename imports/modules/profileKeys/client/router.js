import { Router } from 'meteor/iron:router'

import { Keys } from '../both/collection'

Router.route('/profile/keys', function () {
  this.render('membership.profile.keys')
}, {
  subscriptions: function () {
    return [
      Meteor.subscribe('keys.all', {}, {
        sort: {
          createdAt: -1
        }
      })
    ]
  },
  data: function() {
    if (this.ready) {
      return {
        keys: Keys.find({}, {
          sort: {
            createdAt: -1
          }
        })
      }
    } 
  },
  name: 'membership.profile.keys',
  title: i18n.__('profileKeys.title'),
  parent: 'membership.profile.index'
})