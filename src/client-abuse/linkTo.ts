import { HasPos } from "position/types"

/**
 * Generate string for a clickable link to the given room
 * @param roomName name of the target room
 * @param text string to display as button
 * @param onClick addition script
 * @returns an html link string
 */
export function getLinkToRoom(roomName: string, text: string, onClick = "") {
  return `<a href="#!/room/${roomName}" onClick="${onClick}">${htmlEscape(text)}</a>`
}

/**
 * Generate string for a clickable link to the given game object
 * @author semperrabbit 20170114
 * @author helam
 * @param it target game object
 * @param text string to display as button
 * @param memWatch optionally add a memory watch
 * @returns an html link string
 */
export function getLinkToObject(
  it: HasPos & _HasId,
  text: string,
  memWatch?: string | undefined | false
) {
  return getLinkToRoom(
    it.pos.roomName,
    text,
    selectById(it.id) + (memWatch ? addWatch(memWatch) : "")
  )
}
const selectById = (id: string) =>
  `angular.element('body').injector().get('RoomViewPendingSelector').set('${id}'):`
const addWatch = (memWatch: string) =>
  `angular.element($('section.memory')).scope().Memory.addWatch('${memWatch}');angular.element($('section.memory')).scope().Memory.selectedObjectWatch='${memWatch}';`

/**
 * Generate string for a clickable link to the given creep
 * @author semperrabbit 20170114
 * @author helam
 * @param it target creep
 * @param text optional string to display as button
 * @returns an html link string
 */
export function getLinkToCreep(it: Creep, text?: string | undefined) {
  return getLinkToObject(it, text ?? `[Creep ${it.name} #${it.id}]`, it.my && `creeps.${it.name}`)
}

/**
 * Generate string for a clickable link to the given spawn
 * @author semperrabbit 20170114
 * @author helam
 * @param it target spawn
 * @param text optional string to display as button
 * @returns an html link string
 */
export function getLinkToSpawn(it: StructureSpawn, text?: string | undefined) {
  return getLinkToObject(it, text ?? `[Spawn ${it.name} #${it.id}]`, it.my && `spawns.${it.name}`)
}

/**
 * Generate string for a clickable link to the given flag
 * @author semperrabbit 20170114
 * @author helam
 * @param it target flag
 * @param text optional string to display as button
 * @returns an html link string
 */
export function getLinkToFlag(it: Flag, text?: string | undefined) {
  return getLinkToRoom(
    it.pos.roomName,
    text ?? `[Flag ${it.name}]`,
    selectById(it.name) + addWatch(`flags.${it.name}`)
  )
}

/**
 * Convert string to html safe characters
 * @param s string to escape
 * @returns string without bad html characters
 */
export function htmlEscape(s: string) {
  const lookup: Record<string, string> = {
    "&": "&amp;",
    '"': "&quot;",
    "'": "&apos;",
    "<": "&lt;",
    ">": "&gt;",
  }
  return s.replace(/[&"'<>]/g, (c) => lookup[c])
}
