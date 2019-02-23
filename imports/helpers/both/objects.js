function pick(object, keys) {
  return keys.reduce((obj, key) => {
    if (object[key]) {
      obj[key] = object[key]
    }
    return obj
  }, {})
}

module.exports.pick = pick