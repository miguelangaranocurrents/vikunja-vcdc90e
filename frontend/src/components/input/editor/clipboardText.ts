import type {Fragment, Slice, Node as ProseMirrorNode} from '@tiptap/pm/model'

/**
 * Plain-text form of a copied editor selection. Lists keep their markers so a copied
 * bullet or numbered list still reads as a list outside the editor, and blocks are
 * separated by blank lines. Items of one list are separated by single newlines.
 */
export function serializeSliceAsText(slice: Slice): string {
	return blocksToText(slice.content).join('\n\n')
}

function blocksToText(fragment: Fragment): string[] {
	const blocks: string[] = []

	fragment.forEach(node => {
		const text = nodeToText(node)
		if (text !== '') {
			blocks.push(text)
		}
	})

	return blocks
}

function nodeToText(node: ProseMirrorNode): string {
	if (node.isText) {
		return node.text ?? ''
	}

	if (node.type.name === 'bulletList' || node.type.name === 'orderedList') {
		return listToText(node)
	}

	if (node.isTextblock) {
		return node.textContent
	}

	if (node.isLeaf) {
		return node.textContent
	}

	return blocksToText(node.content).join('\n\n')
}

function listToText(list: ProseMirrorNode): string {
	const ordered = list.type.name === 'orderedList'
	const start = typeof list.attrs.start === 'number' ? list.attrs.start : 1
	const items: string[] = []

	list.forEach((item, _offset, index) => {
		const marker = ordered ? `${start + index}. ` : '- '
		const indent = ' '.repeat(marker.length)
		const body = blocksToText(item.content).join('\n').split('\n')

		items.push(body
			.map((line, lineIndex) => (lineIndex === 0 ? marker : indent) + line)
			.join('\n'))
	})

	return items.join('\n')
}
