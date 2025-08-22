import { type NextRequest, NextResponse } from "next/server"
import { jsPDF } from "jspdf"

export async function POST(request: NextRequest) {
  try {
    const { content, selectedFrames, format, videoInfo } = await request.json()

    if (format === "pdf") {
      return await exportToPDF(content, selectedFrames, videoInfo)
    } else if (format === "docx") {
      return await exportToDocx(content, selectedFrames, videoInfo)
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}

async function exportToPDF(content: any, selectedFrames: string[], videoInfo: any) {
  const doc = new jsPDF()

  // Add title
  doc.setFontSize(20)
  doc.text(videoInfo.title || "Generated Content", 20, 30)

  // Add content
  doc.setFontSize(12)
  const contentText = Object.values(content).join("\n\n")
  const splitText = doc.splitTextToSize(contentText, 170)
  doc.text(splitText, 20, 50)

  // Add images if selected
  if (selectedFrames.length > 0) {
    doc.addPage()
    doc.setFontSize(16)
    doc.text("Selected Images", 20, 30)

    let yPosition = 50
    for (const frame of selectedFrames) {
      try {
        // In a real implementation, you would fetch and add the actual images
        doc.text(`Image: ${frame}`, 20, yPosition)
        yPosition += 20
      } catch (error) {
        console.error("Failed to add image:", error)
      }
    }
  }

  const pdfBuffer = doc.output("arraybuffer")

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="rehaulx-content.pdf"',
    },
  })
}

async function exportToDocx(content: any, selectedFrames: string[], videoInfo: any) {
  // For DOCX export, you would typically use a library like docx
  // This is a simplified implementation
  const docxContent = `
Title: ${videoInfo.title || "Generated Content"}

Content:
${Object.values(content).join("\n\n")}

Selected Images:
${selectedFrames.map((frame) => `- ${frame}`).join("\n")}
  `

  const buffer = Buffer.from(docxContent, "utf-8")

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": 'attachment; filename="rehaulx-content.docx"',
    },
  })
}
