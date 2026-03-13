const mammoth = require('mammoth')

async function parseDoc(buffer) {
  const result = await mammoth.convertToHtml({ buffer })
  const html = result.value

  // Extract Meta title from paragraph like "Meta title: Some title here"
  const metaTitleMatch = html.match(/Meta title:\s*([^<]+)/i)
  const metaTitle = metaTitleMatch ? metaTitleMatch[1].trim() : ''

  // Extract content between "Introduction" label and "Description" label
  const introMatch = html.match(/<p[^>]*>\s*Introduction\s*<\/p>([\s\S]*?)<p[^>]*>\s*Description\s*<\/p>/i)
  const introduction = introMatch ? introMatch[1].trim() : ''

  // Extract content after "Description" label to end
  const descMatch = html.match(/<p[^>]*>\s*Description\s*<\/p>([\s\S]*?)$/i)
  const description = descMatch ? descMatch[1].trim() : ''

  return { metaTitle, introduction, description }
}

module.exports = { parseDoc }
