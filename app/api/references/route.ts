import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

interface ReferenceMetadata {
  name: string
  lastModified: string
  size: string
  paperCount: number
  domains: string[]
  sizeInBytes: number
}

export async function GET() {
  const referencesDir = path.join(process.cwd(), 'references')

  try {
    const files = await fs.promises.readdir(referencesDir)
    const mdFiles = files.filter(f => f.endsWith('.md')).sort()

    const metadata: ReferenceMetadata[] = []

    for (const file of mdFiles) {
      const filePath = path.join(referencesDir, file)
      const stats = await fs.promises.stat(filePath)
      const content = await fs.promises.readFile(filePath, 'utf-8')

      const paperCount = (content.match(/^## \S+-\d+:/gm) || []).length
      const domains = extractDomains(file, content)

      metadata.push({
        name: file,
        lastModified: stats.mtime.toISOString(),
        size: formatFileSize(stats.size),
        paperCount,
        domains,
        sizeInBytes: stats.size
      })
    }

    return NextResponse.json({
      success: true,
      count: metadata.length,
      files: metadata,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error reading references directory:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to read references directory' },
      { status: 500 }
    )
  }
}

function extractDomains(fileName: string, content: string): string[] {
  const domains: string[] = []

  const domainPattern = /\*\*Domain\*\*: (.+?)(?:\n|$)/g
  let match

  while ((match = domainPattern.exec(content)) !== null) {
    const domainText = match[1].trim()
    if (!domains.includes(domainText)) {
      domains.push(domainText)
    }
  }

  if (domains.length === 0) {
    const nameWithoutExt = fileName.replace('.md', '').replace(/-/g, ' ')
    domains.push(nameWithoutExt.split(' ').slice(0, 3).join(' '))
  }

  return domains.slice(0, 5)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
