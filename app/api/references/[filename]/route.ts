import * as fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import * as path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params

  if (!filename || !filename.endsWith('.md')) {
    return NextResponse.json(
      { success: false, error: 'Invalid filename. Must be a .md file' },
      { status: 400 }
    );
  }

  const filePath = path.join(process.cwd(), 'references', filename);

  try {
    await fs.promises.access(filePath, fs.constants.R_OK)

    const content = await fs.promises.readFile(filePath, 'utf-8')
    const stats = await fs.promises.stat(filePath)

    const rangeHeader = request.headers.get('range')
    if (rangeHeader) {
      const rangeMatch = rangeHeader.match(/bytes=(\d+)-(\d*)/)

      if (rangeMatch) {
        const start = parseInt(rangeMatch[1])
        const end = rangeMatch[2] ? parseInt(rangeMatch[2]) : content.length - 1
        const chunkContent = content.substring(start, end + 1)

        return new Response(chunkContent, {
          status: 206,
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Content-Range': `bytes ${start}-${end}/${content.length}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': String(chunkContent.length),
            'Cache-Control': 'no-cache',
            'Last-Modified': stats.mtime.toUTCString()
          }
        })
      }
    }

    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Last-Modified': stats.mtime.toUTCString(),
        'Content-Length': String(content.length)
      }
    })
  } catch (error) {
    console.error(`Error reading file ${filename}:`, error)

    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json(
        { success: false, error: `File not found: ${filename}` },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to read file' },
      { status: 500 }
    )
  }
}
