/* eslint-env mocha */
import { assert } from 'chai'
import { getConfig, data } from './emails'

import { Settings } from '/imports/modules/management/both/collection'

describe('emails tests', () => {
  describe('getConfig', () => {

    it('fail with wrong address', () => {
      process.env.MAIL_URL = 'wrong-adress'
      const result = getConfig()
      assert.equal(result, null)
    })

    it('fail with http address', () => {
      process.env.MAIL_URL = 'https://example.com:888'
      const result = getConfig()
      assert.equal(result, null)
    })

    it('fail with bad smtp address', () => {
      process.env.MAIL_URL = 'smtps://user:password@:465'
      const result = getConfig()
      assert.equal(result, null)
    })

    it('ignore tls in localhost urls', () => {
      process.env.MAIL_URL = 'smtps://user:password@localhost'
      const result = getConfig()
      assert.equal(result.ignoreTLS, true)
    })

    it('work with smtps address', () => {
      process.env.MAIL_URL = 'smtps://user:password@server.com:465'
      const result = getConfig()
      assert.equal(result.host, 'server.com')
      assert.equal(result.port, 465)
      assert.equal(result.secure, true)
      assert.equal(result.auth.user, 'user')
      assert.equal(result.auth.pass, 'password')
    })

    it('work with smtp address', () => {
      process.env.MAIL_URL = 'smtp://user:password@server.com:465'
      const result = getConfig()
      assert.equal(result.host, 'server.com')
      assert.equal(result.port, 465)
      assert.equal(result.secure, false)
      assert.equal(result.auth.user, 'user')
      assert.equal(result.auth.pass, 'password')
    })
  })


  describe('data', function() {
    this.timeout(5000)

    before(() => {
      Settings.remove({})
      Settings.insert({
        type: 'siteSettings',
        settings: {
          title: 'Test site'
        }
      })
    })

    it('should result correct data for full url', () => {
      try {
        process.env.MAIL_URL = 'smtp://user:password@server.com:465'
        const result = data(
          ['jon@example.com', 'ann@example.com'],
          { config: { subject: 'Subject', body: 'Body' } }, 
          { name: 'jon' },
          'ExecutionLogs'
        )
  
        assert.equal(result.from, 'Test site <user>')
        assert.equal(result.to, 'jon@example.com ann@example.com')
        assert.equal(result.text, 'Test site: Body')
        assert.deepEqual(result.attachments, [])
      }
      catch (ex) {
        console.error(ex)
        assert.equal(ex, null)
      }
    })

    it('should result in noreply@localhost if not auth in url', () => {
      process.env.MAIL_URL = 'smtp://server.com:465'
      const result = data(
        ['jon@example.com', 'ann@example.com'],
        { config: { subject: 'Subject', body: 'Body' } }, 
        { name: 'jon' },
        'ExecutionLogs'
      )

      assert.equal(result.from, 'Test site <noreply@localhost>')
      assert.equal(result.to, 'jon@example.com ann@example.com')
      assert.equal(result.text, 'Test site: Body')
      assert.deepEqual(result.attachments, [])
    })
  })
})
