const pdfKit = require('pdfkit')
const moment = require('moment')

const TEXT_SIZE = 12
const CONTENT_LEFT_PADDING = 50

/**
 * 
 * @param {*} trigger 
 * @param {*} user 
 * @param {*} currentStep 
 * @param {*} stepsResults 
 */
const build = (trigger, user, currentStep, data) => {
  let {
    bill,
    company,
    customer,
    items
  } = data

  if (!bill) return null

  if (!bill.currency) bill.currency = '€'

  const date = new Date()
  const charge = {
    createdAt: `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}`,
    amount: items.reduce((acc, item) => acc + item.amount, 0)
  }

  const doc = new pdfKit({
    size: 'A4',
    margin: 50
  })

  doc.fillColor('#333333')

  const divMaxWidth = 550;
  const table = {
    x: CONTENT_LEFT_PADDING,
    y: 280,
    inc: 300
  }

  let genHeader = () => {
    doc
      .fontSize(20)
      .text(bill.id, CONTENT_LEFT_PADDING, 50)

    const borderOffset = doc.currentLineHeight() + 70

    doc
      .fontSize(16)
      .fillColor('#cccccc')
      .text(moment().format('MMMM, DD, YYYY'), CONTENT_LEFT_PADDING, 50, {
        align: 'right',
      })
      .fillColor('#333333')

    doc
      .strokeColor('#cccccc')
      .moveTo(CONTENT_LEFT_PADDING, borderOffset)
      .lineTo(divMaxWidth, borderOffset)
  }

  let getCompanyInfo = () => {
    doc.fontSize(12).text('From:', CONTENT_LEFT_PADDING, 100)
    doc.text(company.name)
    doc.text(company.address)
    doc.text(company.city)
    doc.text(company.pc)
    doc.text(company.country)
    doc.text(company.vat)

    doc.fillColor('#333333')
  }

  let genFooter = () => {
    if (!bill.footer) return
    doc.fontSize(12)
    doc.text(bill.footer, CONTENT_LEFT_PADDING, 600)
  }

  let genCustomerInfos = () => {
    doc.fontSize(12)
    doc.text(`Billed to:`, CONTENT_LEFT_PADDING + 200, 100)
    doc.text(customer.name)
    doc.text(customer.address)
    doc.text(customer.city)
    doc.text(customer.pc)
    doc.text(customer.country)
    doc.text(customer.vat)
  }

  let genTableHeaders = () => {
    [
      'Name',
      'Price'
    ].forEach((text, i) => {
      doc
        .fontSize(TEXT_SIZE)
        .text(text, table.x + i * table.inc, table.y)
    })
  }

  let genTableRow = () => {
    items
      .map(item => Object.assign({}, item, {
        amount: item.amount
      }))
      .forEach((item, itemIndex) => {
        [
          'name',
          'price',
        ].forEach((field, i) => {
          if (field === 'price') { item[field] = `${item[field]} ${bill.currency}` }
          doc
            .fontSize(TEXT_SIZE)
            .text(item[field], table.x + i * table.inc, table.y + TEXT_SIZE + 6 + itemIndex * 20)
        })
      })
  }

  let genTableLines = () => {
    const offset = doc.currentLineHeight() + 2
    doc
      .moveTo(table.x, table.y + offset)
      .lineTo(divMaxWidth, table.y + offset)
      .stroke()
  }

  let genTotalLines = () => {
    const offset = doc.currentLineHeight() + 2
    doc.lineWidth(2)
    doc
      .moveTo(table.x, table.y + TEXT_SIZE + 6 + items.length * 20)
      .lineTo(divMaxWidth, table.y + TEXT_SIZE + 6 + items.length * 20)
      .stroke()
  }

  let genTotal = () => {
    let total = 0
    items.map(i => total += Number(i.price))
    doc.font('Courier-Bold')
    doc.text('Total:', CONTENT_LEFT_PADDING, (table.y + TEXT_SIZE + 6 + items.length * 20) + 10)
    doc.text(`${total.toString()} ${bill.currency}` , table.x + 1 * table.inc, (table.y + TEXT_SIZE + 6 + items.length * 20) + 10)
  }

  let generate = () => {
    genHeader()
    getCompanyInfo()
    genTableHeaders()
    genTableLines()
    genTableRow()
    genTotalLines()
    genCustomerInfos()
    genFooter()
    genTotal()
    doc.end()
    return doc
  }

  return generate()
}

module.exports.build = build