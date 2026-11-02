import type { Diagram } from "@/types/diagram"
import { DocumentationGenerator } from "@/lib/generators/documentation-generator"

export class PDFGenerator {
  private diagram: Diagram

  constructor(diagram: Diagram) {
    this.diagram = diagram
  }

  async generatePDF(): Promise<Blob> {
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const maxWidth = pageWidth - 2 * margin

    const lines = new DocumentationGenerator(this.diagram).generateMarkdown().split("\n")

    let y = margin
    for (const line of lines) {
      const isH1 = line.startsWith("# ")
      const isH2 = line.startsWith("## ")
      const isH3 = line.startsWith("### ")
      const displayLine = line.replace(/^#{1,3}\s/, "")
      doc.setFont("helvetica", isH1 || isH2 || isH3 ? "bold" : "normal")
      doc.setFontSize(isH1 ? 18 : isH2 ? 14 : isH3 ? 11 : 9)
      const wrappedLines = doc.splitTextToSize(displayLine, maxWidth)
      const lineHeight = isH1 ? 8 : isH2 ? 6 : isH3 ? 5 : 4
      if (y + wrappedLines.length * lineHeight > pageHeight - margin) {
        doc.addPage()
        y = margin
      }
      for (const wrappedLine of wrappedLines) {
        doc.text(String(wrappedLine), margin, y)
        y += lineHeight
      }
      if (isH1 || isH2 || isH3) y += 2
    }

    return doc.output("blob")
  }
}
