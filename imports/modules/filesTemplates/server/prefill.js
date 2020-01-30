import { FilesTemplates } from '/imports/modules/filesTemplates/both/collection'
import { FilesTemplatesCategories } from '/imports/modules/filesTemplatesCategories/both/collection'

import { run as runCategories } from '/imports/modules/filesTemplatesCategories/server/prefill'

const run = async () => {

  await FilesTemplates.remove({})
  await FilesTemplatesCategories.remove({})

  const categories = await runCategories()
  const tplCategories = [
    {
      categoryId: 'bash',
      templates: [
        'prefill/bash/s3buildpublish.json'
      ]
    },
    {
      categoryId: 'html-template',
      templates: [
        'prefill/html-template/basic.json'
      ]
    },
    {
      categoryId: 'webparsy',
      templates: [
        'prefill/webparsy/browserSettings.json',
        'prefill/webparsy/weather.json',
        'prefill/webparsy/form.json',
        'prefill/webparsy/html.json',
        'prefill/webparsy/many.json',
        'prefill/webparsy/transform.json',
        'prefill/webparsy/basicauth.json'
      ]
    },
    {
      categoryId: 'nodesfc',
      templates: [
        'prefill/nodesfc/basics.json'
      ]
    }
  ]
  
  let numberOfSystemTemplates = FilesTemplates.find({
    userCreated: false
  }).count()
  
  if (numberOfSystemTemplates > 0) {
    return
  }
  
  tplCategories.map(tplCategory => {
    const category = categories.find(c => c.id === tplCategory.categoryId)
    if (!category) {
      console.error(`No file template category found for ${tplCategory.categoryId}`)
      return
    }

    let p = tplCategory.templates.length
    tplCategory.templates.map(tpl => {
      const templateInfo = JSON.parse(Assets.getText(tpl))
      FilesTemplates.insert(Object.assign(
        templateInfo, {
          category: category._id,
          content: Assets.getText(`prefill/${tplCategory.categoryId}/${templateInfo.fileName}`),
          priority: p--
        }))
    })
  })
}

run()

module.exports.run = run
