const compare = function() {
  let result = true
  let val = null
  Object.values(arguments).map(a => {
    if (typeof a === 'object') {
      a = JSON.stringify(a)
    }
    if (val === null) {
      val = a
    }
    else {
      if (val !== a) {
        result = false
      }
    }
  })
  return result
}

/**
 * 
 */
module.exports.compare = compare