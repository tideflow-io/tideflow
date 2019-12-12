import { FilesTemplatesCategories } from '/imports/modules/filesTemplatesCategories/both/collection'

module.exports.run = async () => {
  const categories = [
    {
      id: 'bash',
      name: 'Bash commands'
    },
    {
      id: 'html-template',
      name: 'HTML Templates'
    },
    {
      id: 'webparsy',
      name: 'Web scraping definitions'
    },
    {
      id: 'nodesfc',
      name: 'NodeJS scripts'
    }
  ]

  let numberOfCategories = FilesTemplatesCategories.find({})
  
  if (numberOfCategories.count() > 0) {
    return numberOfCategories.fetch()
  }

  let promises = categories.map(category => {
    return new Promise((resolve, reject) => {
      try {
        let _id = FilesTemplatesCategories.insert(category)
        resolve(Object.assign({}, category, { _id }))
      }
      catch (ex) {
        reject(ex)
      }
    })
  })

  return await Promise.all(promises)
}
