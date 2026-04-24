const { supabase } = require("../config/supabase")
const { createAppError } = require("../utils/app-error")
const { handleDatabaseError } = require("../utils/database")
const { getMissingRequiredFields, hasFields, pickDefinedFields } = require("../utils/payload")
const { generatePublicKey } = require("../utils/security")
const {
  applyOwnerScope,
  getOwnedRecordByPublicKey,
  resolveOwnedIdByPublicKey
} = require("../utils/reference")

const publicSelect = [
  "key_sessao_foco",
  "data_criacao",
  "data_atualizacao",
  "duracao_minutos",
  "tipo",
  "data_conclusao",
  "tarefas(key_tarefa)"
].join(", ")

function serializeFocusSession(session) {
  return {
    key_sessao_foco: session.key_sessao_foco,
    data_criacao: session.data_criacao,
    data_atualizacao: session.data_atualizacao,
    duracao_minutos: session.duracao_minutos,
    tipo: session.tipo,
    data_conclusao: session.data_conclusao,
    key_tarefa: session.tarefas?.key_tarefa || null
  }
}

async function list(auth) {
  let query = supabase.from("sessoes_foco").select(publicSelect)
  query = applyOwnerScope(query, auth).order("id_sessao_foco", { ascending: true })

  const response = await query
  handleDatabaseError(response.error)
  return (response.data || []).map(serializeFocusSession)
}

async function getSessionRecordByKey(keySessaoFoco, auth) {
  return getOwnedRecordByPublicKey({
    table: "sessoes_foco",
    keyField: "key_sessao_foco",
    publicKey: keySessaoFoco,
    auth,
    select: `${publicSelect}, id_sessao_foco`,
    notFoundMessage: "Sessao de foco nao encontrada"
  })
}

async function getByKey(keySessaoFoco, auth) {
  const session = await getSessionRecordByKey(keySessaoFoco, auth)
  return serializeFocusSession(session)
}

async function buildTaskReference(payload, auth) {
  if (payload.key_tarefa === undefined) {
    return {}
  }

  return {
    id_tarefa: await resolveOwnedIdByPublicKey({
      table: "tarefas",
      keyField: "key_tarefa",
      idField: "id_tarefa",
      publicKey: payload.key_tarefa,
      auth,
      nullable: true,
      notFoundMessage: "Tarefa nao encontrada"
    })
  }
}

async function create(payload, auth) {
  const record = pickDefinedFields(payload, ["duracao_minutos", "tipo", "data_conclusao"])
  const missingFields = getMissingRequiredFields(record, ["duracao_minutos"])

  if (missingFields.length > 0) {
    throw createAppError(400, `Campos obrigatorios nao informados: ${missingFields.join(", ")}`)
  }

  const taskReference = await buildTaskReference(payload, auth)

  const response = await supabase
    .from("sessoes_foco")
    .insert({
      ...record,
      ...taskReference,
      key_sessao_foco: generatePublicKey("sessaofoco"),
      id_login: auth.idLogin
    })
    .select(publicSelect)
    .single()

  handleDatabaseError(response.error)
  return serializeFocusSession(response.data)
}

async function update(keySessaoFoco, payload, auth) {
  await getSessionRecordByKey(keySessaoFoco, auth)

  const updates = pickDefinedFields(payload, ["duracao_minutos", "tipo", "data_conclusao"])
  Object.assign(updates, await buildTaskReference(payload, auth))

  if (!hasFields(updates)) {
    throw createAppError(400, "Nenhum campo valido foi informado para atualizacao")
  }

  updates.data_atualizacao = new Date().toISOString()

  let query = supabase
    .from("sessoes_foco")
    .update(updates)
    .select(publicSelect)
    .eq("key_sessao_foco", keySessaoFoco)

  query = applyOwnerScope(query, auth)

  const response = await query.single()
  handleDatabaseError(response.error)
  return serializeFocusSession(response.data)
}

async function remove(keySessaoFoco, auth) {
  await getSessionRecordByKey(keySessaoFoco, auth)

  let query = supabase
    .from("sessoes_foco")
    .delete()
    .select(publicSelect)
    .eq("key_sessao_foco", keySessaoFoco)

  query = applyOwnerScope(query, auth)

  const response = await query
  handleDatabaseError(response.error)
  return response.data?.[0] ? serializeFocusSession(response.data[0]) : null
}

module.exports = {
  list,
  getByKey,
  create,
  update,
  remove
}
