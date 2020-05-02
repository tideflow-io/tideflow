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

  let promises = categories.map(category => {
    return new Promise((resolve, reject) => {
      try {
        let r = FilesTemplatesCategories.upsert({id:category.id}, {
          $set: category
        }, {
          multi: false
        })
        resolve(Object.assign(category, { _id: r.insertedId }))
      }
      catch (ex) {
        reject(ex)
      }
    })
  })

  return await Promise.all(promises)
}
