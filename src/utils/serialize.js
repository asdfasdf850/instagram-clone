import { Text } from 'slate'
import escapeHtml from 'escape-html'

export default function serialize(node) {
  if (Text.isText(node)) {
    return escapeHtml(node.text)
  }

  const children = node.children.map(n => serialize(n)).join('')

  if (node.type === 'paragraph') {
    return `${children}<br>`
  }

  return children
}
