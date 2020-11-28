/* eslint-env mocha */
import { assert, expect } from 'chai'
import { process } from './service'

describe('services/conditions/server/service', () => {
  describe('process', () => {
    it('string contains', () => {
      let r = process.string.contains('jose c', 'jose')
      assert.deepEqual(r, true)
    })

    it('string eq', () => {
      assert.deepEqual( process.string.eq('jose c', 'jose'), false )
      assert.deepEqual( process.string.eq('jose', 'jose'), true )
    })

    it('string begins', () => {
      assert.deepEqual( process.string.begins('jose c', 'jo'), true )
      assert.deepEqual( process.string.begins('jose c', 'je'), false )
    })

    it('string ends', () => {
      assert.deepEqual( process.string.ends('jose c', 'c'), true )
      assert.deepEqual( process.string.ends('jose c', 'a'), false )
    })

    it('number eq', () => {
      assert.deepEqual( process.number.eq(1,1), true )
      assert.deepEqual( process.number.eq(1,2), false )
    })

    it('number gt', () => {
      assert.deepEqual( process.number.gt(2,1), true )
      assert.deepEqual( process.number.gt(0.5,1), false )
    })

    it('number gte', () => {
      assert.deepEqual( process.number.gte(2,1), true )
      assert.deepEqual( process.number.gte(1,1), true )
      assert.deepEqual( process.number.gte(0,1), false )
    })

    it('number lt', () => {
      assert.deepEqual( process.number.lt(0,1), true )
      assert.deepEqual( process.number.lt(1,1), false )
    })

    it('number lte', () => {
      assert.deepEqual( process.number.lte(0,1), true )
      assert.deepEqual( process.number.lte(1,1), true )
      assert.deepEqual( process.number.lte(2,1), false )
    })

    it('number between', () => {
      assert.deepEqual( process.number.between( '1,10', 1 ), false )
      assert.deepEqual( process.number.between( '1,10', 2 ), true )
      assert.deepEqual( process.number.between( '1,10', 4 ), true )
      assert.deepEqual( process.number.between( '1,10', 10 ), false )

      expect( process.number.between( '1', 1 ).to.throw() )
      expect( process.number.between( ',10', 1 ).to.throw() )
      expect( process.number.between( ',', 1 ).to.throw() )
      expect( process.number.between( 'a,10', 1 ).to.throw() )
      expect( process.number.between( '10,a', 1 ).to.throw() )
      expect( process.number.between( '1,1', 1 ).to.throw() )
      expect( process.number.between( '10,1', 1 ).to.throw() )
    })
  })
})