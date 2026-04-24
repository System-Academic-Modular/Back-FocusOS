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
  "key_tarefa",
  "data_criacao",
  "data_atualizacao",
  "titulo",
  "descricao",
  "status",
  "prioridade",
  "data_vencimento",
  "posicao",
  "categorias(key_categoria)",
  "times(key_time)"
].join(", ")

function serializeTask(task) {
  return {
    key_tarefa: task.key_tarefa,
    data_criacao: task.data_criacao,
    data_atualizacao: task.data_atualizacao,
    titulo: task.titulo,
    descricao: task.descricao,
    status: task.status,
    prioridade: task.prioridade,
    data_vencimento: task.data_vencimento,
    posicao: task.posicao,
    key_categoria: task.categorias?.key_categoria || null,
    key_time: task.times?.key_time || null
  }
}

async function list(auth) {
  let query = supabase.from("tarefas").select(publicSelect)
  query = applyOwnerScope(query, auth).order("id_tarefa", { ascending: true })

  const response = await query
  handleDatabaseError(response.error)
  return (response.data || []).map(serializeTask)
}

async function getTaskRecordByKey(keyTarefa, auth) {
  return getOwnedRecordByPublicKey({
    table: "tarefas",
    keyField: "key_tarefa",
    publicKey: keyTarefa,
    auth,
    select: `${publicSelect}, id_tarefa`,
    notFoundMessage: "Tarefa nao encontrada"
  })
}

async function getByKey(keyTarefa, auth) {
  const task = await getTaskRecordByKey(keyTarefa, auth)
  return serializeTask(task)
}

async function buildForeignKeyUpdates(payload, auth) {
  const updates = {}

  if (payload.key_categoria !== undefined) {
    updates.id_categoria = await resolveOwnedIdByPublicKey({
      table: "categorias",
      keyField: "key_categoria",
      idField: "id_categoria",
      publicKey: payload.key_categoria,
      auth,
      nullable: true,
      notFoundMessage: "Categoria nao encontrada"
    })
  }

  if (payload.key_time !== undefined) {
    updates.id_time = await resolveOwnedIdByPublicKey({
      table: "times",
      keyField: "key_time",
      idField: "id_time",
      publicKey: payload.key_time,
      auth,
      nullable: true,
      notFoundMessage: "Time nao encontrado"
    })
  }

  return updates
}

async function create(payload, auth) {
  const record = pickDefinedFields(payload, [
    "titulo",
    "descricao",
    "status",
    "prioridade",
    "data_vencimento",
    "posicao"
  ])

  const missingFields = getMissingRequiredFields(record, ["titulo"])

  if (missingFields.length > 0) {
    throw createAppError(400, `Campos obrigatorios nao informados: ${missingFields.join(", ")}`)
  }

  const foreignKeys = await buildForeignKeyUpdates(payload, auth)

  const response = await supabase
    .from("tarefas")
    .insert({
      ...record,
      ...foreignKeys,
      key_tarefa: generatePublicKey("tarefa"),
      id_login: auth.idLogin
    })
    .select(publicSelect)
    .single()

  handleDatabaseError(response.error)
  return serializeTask(response.data)
}

async function update(keyTarefa, payload, auth) {
  await getTaskRecordByKey(keyTarefa, auth)

  const updates = pickDefinedFields(payload, [
    "titulo",
    "descricao",
    "status",
    "prioridade",
    "data_vencimento",
    "posicao"
  ])

  Object.assign(updates, await buildForeignKeyUpdates(payload, auth))

  if (!hasFields(updates)) {
    throw createAppError(400, "Nenhum campo valido foi informado para atualizacao")
  }

  updates.data_atualizacao = new Date().toISOString()

  let query = supabase.from("tarefas").update(updates).select(publicSelect).eq("key_tarefa", keyTarefa)
  query = applyOwnerScope(query, auth)

  const response = await query.single()
  handleDatabaseError(response.error)
  return serializeTask(response.data)
}

async function remove(keyTarefa, auth) {
  await getTaskRecordByKey(keyTarefa, auth)

  let query = supabase.from("tarefas").delete().select(publicSelect).eq("key_tarefa", keyTarefa)
  query = applyOwnerScope(query, auth)

  const response = await query
  handleDatabaseError(response.error)
  return response.data?.[0] ? serializeTask(response.data[0]) : null
}

module.exports = {
  list,
  getByKey,
  create,
  update,
  remove
}
