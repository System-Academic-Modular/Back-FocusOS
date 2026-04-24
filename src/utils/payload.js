function pickDefinedFields(source = {}, allowedFields = []) {
  return allowedFields.reduce((accumulator, field) => {
    if (source[field] !== undefined) {
      accumulator[field] = source[field]
    }

    return accumulator
  }, {})
}

function getMissingRequiredFields(source = {}, requiredFields = []) {
  return requiredFields.filter((field) => {
    const value = source[field]
    return value === undefined || value === null || value === ""
  })
}

function hasFields(source = {}) {
  return Object.keys(source).length > 0
}

module.exports = {
  pickDefinedFields,
  getMissingRequiredFields,
  hasFields
}
