import j from "meteor/jquery"

let buildSelector = (field) => {
  if (typeof field === 'string'){
    return field
  }
  else if (Array.isArray(field)) {
    return field.join('.')
  }
  else {
    return null
  }
  
}

module.exports.fieldValue = (field, value) => {
  let ffield = buildSelector(field)
  if (ffield !== null) {
    if (typeof value === 'undefined') {
      return j.jQuery(`[name="${ffield}"]`).val()
    }
    if (value === null) {
      return j.jQuery(`[name="${ffield}"]`).val()
    }
    j.jQuery(`[name="${ffield}"]`).val(value)
  }
}

module.exports.fieldText = (field, value) => {
  let ffield = buildSelector(field)
  if (ffield !== null) {
    if (typeof value === 'undefined') {
      return j.jQuery(`[name="${ffield}"]`).text()
    }
    if (value === null) {
      return j.jQuery(`[name="${ffield}"]`).text()
    }
    j.jQuery(`[name="${ffield}"]`).text(value)
  }
}