import { FilesTemplatesCategories } from '/imports/modules/filesTemplatesCategories/both/collection'

module.exports.run = async () => {
  const categories = [
    {
      id: 'bash',
      name: 'Bash commands'
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
