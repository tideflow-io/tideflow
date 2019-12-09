import { FilesTemplates } from '/imports/modules/filesTemplates/both/collection'

import { run as runCategories } from '/imports/modules/filesTemplatesCategories/server/prefill'

const run = async () => {

  const categories = await runCategories()

  const templates = [
    {
      categoryId: 'bash',
      template: {
        name: 'Demo 1',
        description: '1230m',
        fileName: 'demo1.txt',
        type: 'text',
        content: ''
      }
    },
    {
      categoryId: 'bash',
      template: {
        name: 'Demo 2',
        description: '1230m',
        fileName: 'demo1.txt',
        type: 'text',
        content: 'holaquease'
      }
    },
    {
      categoryId: 'bash',
      template: {
        name: 'Demo 3',
        description: '1230m',
        fileName: 'demo1.txt',
        type: 'text',
        content: 'holaquease'
      }
    },
    {
      categoryId: 'bash',
      template: {
        name: 'Demo 4',
        description: '1230m',
        fileName: 'demo1.txt',
        type: 'text',
        content: 'holaquease'
      }
    },
    {
      categoryId: 'html',
      template: {
        name: 'Oh html',
        description: '1230m',
        fileName: 'demo1.html',
        type: 'text',
        content: 'holaquease'
      }
    }
  ]
  
  let numberOfSystemTemplates = FilesTemplates.find({
    userCreated: false
  }).count()
  
  if (numberOfSystemTemplates > 0) {
    return
  }
  
  templates.map(tpl => {
    const category = categories.find(c => c.id === tpl.categoryId)
    if (!category) {
      console.error(`No file template category found for ${tpl.categoryId}`)
      return
    }
    FilesTemplates.insert(Object.assign(tpl.template, {
      category: category._id
    }))
  })
}

run()

module.exports.run = run
