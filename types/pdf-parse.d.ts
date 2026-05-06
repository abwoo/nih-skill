declare module 'pdf-parse' {
  interface PdfData {
    text: string
    numpages: number
    numrender: number
    info?: Record<string, any>
    metadata?: Record<string, any>
    version?: string
  }

  function pdf(data: Buffer | ArrayBuffer): Promise<PdfData>

  export default pdf
}
