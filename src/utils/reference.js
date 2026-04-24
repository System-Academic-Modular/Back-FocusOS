const { supabase } = require("../config/supabase")
const { createAppError } = require("./app-error")
const { handleDatabaseError } = require("./database")

function applyOwnerScope(query, auth, ownerField = "id_login") {
  if (!ownerField) {
    return query
  }

  return query.eq(ownerField, auth.idLogin)
}

async function getOwnedRecordByPublicKey({
  table,
  keyField,
  publicKey,
  auth,
  select = "*",
  ownerField = "id_login",
  notFoundMessage = "Registro nao encontrado"
}) {
  let query = supabase.from(table).select(select).eq(keyField, publicKey)
  query = applyOwnerScope(query, auth, ownerField)

  const response = await query.maybeSingle()
  handleDatabaseError(response.error)

  if (!response.data) {
    throw createAppError(404, notFoundMessage)
  }

  return response.data
}

async function resolveOwnedIdByPublicKey({
  table,
  keyField,
  idField,
  publicKey,
  auth,
  ownerField = "id_login",
  nullable = false,
  notFoundMessage = "Registro relacionado nao encontrado"
}) {
  if (publicKey === undefined) {
    return undefined
  }

  if (publicKey === null) {
    if (nullable) {
      return null
    }

    throw createAppError(400, `${keyField} nao pode ser nulo`)
  }

  const record = await getOwnedRecordByPublicKey({
    table,
    keyField,
    publicKey,
    auth,
    select: idField,
    ownerField,
    notFoundMessage
  })

  return record[idField]
}

module.exports = {
  applyOwnerScope,
  getOwnedRecordByPublicKey,
  resolveOwnedIdByPublicKey
}
