/**
 * 
 * @param {*} links 
 */
const buildLinks = (links) => {
  return links.map(link => {
    link['tf_author'] = 
      link.creator ||
      link['db:creator'] ||
      link.author
    
    link['tf_title'] = 
      link.title

    link['tf_link'] = 
      link.link ||
      link.url

    link['tf_tags'] = 
      link.tags ||
      link.categories

    link['tf_isoDate'] = 
      link.date ||
      link.created_at ||
      link.createdAt ||
      link.isoDate

    link['tf_snippet'] = 
      link.contentSnippet ||
      link.description ||
      link.content

    link['tf_snippet'] = link['tf_snippet'].replace('&nbsp;', '')
    if (link['tf_snippet'].length < 20) {
      link['tf_snippet'] = undefined
    }
  
    return link
  })
}

module.exports.buildLinks = buildLinks