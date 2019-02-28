import delve from 'dlv';

/**
 * 
 * @param {array} links 
 * @param {object} map
 * @param {boolean} cleanObjects 
 */
const buildLinks = (links, map, cleanObjects) => {
  return links.map(link => {
    let newProperties = {}

    newProperties['tf_author'] = map ? delve(link, map.author) || null :
      link.creator ||
      link['db:creator'] ||
      link.author
    
    newProperties['tf_title'] = map ? delve(link, map.title) || null :
      link.title

    newProperties['tf_link'] = map ? delve(link, map.link) || null :
      link.link ||
      link.url

    newProperties['tf_tags'] = map ? delve(link, map.tags) || null :
      link.tags ||
      link.categories

    newProperties['tf_isoDate'] = map ? delve(link, map.date) || null :
      link.date ||
      link.created_at ||
      link.createdAt ||
      link.isoDate

    newProperties['tf_snippet'] = map ? delve(link, map.snippet) || null :
      newProperties.contentSnippet ||
      link.description ||
      link.content

    newProperties['tf_snippet'] = newProperties['tf_snippet'] ? newProperties['tf_snippet'].replace('&nbsp;', '') : ''

    return cleanObjects ? newProperties : Object.assign(link, newProperties)
  })
}

module.exports.buildLinks = buildLinks