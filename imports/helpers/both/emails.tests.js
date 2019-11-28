/* eslint-env mocha */
import { assert } from 'chai'
import { userEmail } from './emails'

describe('helpers/both/emails', () => {
  describe('userEmail', () => {
    it('should fail if no parameter given', () => {
      try {
        userEmail()
      }
      catch (ex) { assert.isNotNull(ex) }
    })

    it('should fail if no emails', () => {
      try {
        userEmail({
          emails: []
        })
      }
      catch (ex) { assert.isNotNull(ex) }
    })

    it('should fail if no verified email', () => {
      try {
        userEmail({
          emails: [
            {
              verified: false,
              address: 'test@a.com'
            },
            {
              verified: false,
              address: 'test@b.com'
            },
            {
              verified: false,
              address: 'test@c.com'
            }
          ]
        })
      }
      catch (ex) { assert.isNotNull(ex) }
    })

    it('should return verified email', () => {
      try {
        let result = userEmail({
          emails: [
            {
              verified: false,
              address: 'test@a.com'
            },
            {
              verified: true,
              address: 'test@b.com'
            },
            {
              verified: false,
              address: 'test@c.com'
            }
          ]
        })
        assert.equal(result, 'test@b.com')
      }
      catch (ex) { assert.isNull(ex) }
    })
  })
})