const defaultPdfOptionKey = process.env.HCEP_DEFAULT_PDF_OPTION_KEY || 'A4'
const { defaultPdfOptionPresets } = require('./default-pdf-option-presets')
const { PdfOption } = require('./pdf-option')
const myPdfOptionPresetsFilePath = process.env.HCEP_MY_PDF_OPTION_PRESETS_FILE_PATH

let pdfOptionPresets = defaultPdfOptionPresets
const loadMyPdfOptionPresets = () => {
  if (!myPdfOptionPresetsFilePath) {
    return null
  }
  const { myPdfOptionPresets } = require(myPdfOptionPresetsFilePath)
  return myPdfOptionPresets
}

const myPdfOptionPresets = loadMyPdfOptionPresets()
if (myPdfOptionPresets) {
  const mergeOptions = require('merge-options')
  pdfOptionPresets = mergeOptions(defaultPdfOptionPresets, myPdfOptionPresets)
}

const pdfOptionExists = key => {
  return (key in pdfOptionPresets)
}

const getPdfOption = key => {
  if (!key) {
    key = defaultPdfOptionKey
  } else if (!pdfOptionExists(key)) {
    key = defaultPdfOptionKey
  }
  return new PdfOption(pdfOptionPresets[key])
}

module.exports.loadMyPdfOptionPresets = loadMyPdfOptionPresets
module.exports.pdfOptionPresets = pdfOptionPresets
module.exports.pdfOptionExists = pdfOptionExists
module.exports.getPdfOption = getPdfOption
module.exports.defaultPdfOptionKey = defaultPdfOptionKey
