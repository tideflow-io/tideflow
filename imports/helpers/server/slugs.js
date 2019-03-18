import slugify from 'slugify'

const generateSlug = (value, others, count) => {
  const newSlug = slugify(`${value}${count ? '-' + count : ''}`)
  if (others.indexOf(newSlug) >= 0) {
    return generateSlug(value, others, count ? count+1 : 1)
  }
  return newSlug
}

module.exports.generateSlug = generateSlug