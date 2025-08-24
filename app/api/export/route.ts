import { NextRequest, NextResponse } from "next/server"
import { jsPDF } from "jspdf"
import { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel, AlignmentType } from "docx"
import { cleanHtmlToText } from "@/lib/textUtils"

export async function POST(request: Request) {
  try {
    const { content, videoInfo, keyFrames, format = 'pdf' } = await request.json()
    
    if (format === 'pdf') {
      return await exportToPDF(content, videoInfo, keyFrames)
    } else if (format === 'docx') {
      return await exportToDocx(content, videoInfo, keyFrames)
    } else if (format === 'txt') {
      const cleanedContent = cleanHtmlToText(content)
      return new NextResponse(cleanedContent, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="${(videoInfo?.title || 'content').slice(0, 50).replace(/[^a-zA-Z0-9]/g, '_')}.txt"`,
        },
      })
    }
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}

async function exportToPDF(content: string, videoInfo: any, keyFrames: any[]) {
  try {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)
    let yPosition = margin

    // Title
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    const title = videoInfo.title || "Generated Content"
    const titleLines = doc.splitTextToSize(title, contentWidth)
    doc.text(titleLines, margin, yPosition)
    yPosition += (titleLines.length * 10) + 20

    // Process content with embedded images
    await processContentWithImages(doc, content, margin, yPosition, contentWidth, pageHeight)

    // Add key frames section at the end if available
    if (keyFrames && keyFrames.length > 0) {
      // Add a new page for key frames
      doc.addPage()
      yPosition = margin

      // Key frames title
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Key Visual Moments", margin, yPosition)
      yPosition += 20

      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")

      // Add each key frame
      for (let i = 0; i < keyFrames.length; i++) {
        const frame = keyFrames[i]
        
        // Check if we need a new page
        if (yPosition > pageHeight - 100) {
          doc.addPage()
          yPosition = margin
        }

        // Format timestamp
        const minutes = Math.floor(frame.timestamp / 60)
        const seconds = Math.floor(frame.timestamp % 60)
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`

        // Add frame number and timestamp
        doc.setFont("helvetica", "bold")
        doc.text(`${i + 1}. [${timeStr}] ${frame.description || 'Key moment'}`, margin, yPosition)
        yPosition += 15

        // Add the image if available
        if (frame.imageUrl) {
          try {
            let base64Data = frame.imageUrl
            
            // Handle different base64 formats
            if (frame.imageUrl.startsWith('data:image/')) {
              base64Data = frame.imageUrl.split(',')[1]
            } else if (frame.imageUrl.startsWith('/9j/')) {
              base64Data = frame.imageUrl
            }
            
            // Add the actual image to PDF
            const imgWidth = Math.min(contentWidth * 0.8, 100)
            const imgHeight = imgWidth * 0.5625 // 16:9 aspect ratio
            
            doc.addImage(`data:image/jpeg;base64,${base64Data}`, 'JPEG', margin, yPosition, imgWidth, imgHeight)
            yPosition += imgHeight + 20
          } catch (imageError) {
            console.warn('Could not load key frame image:', imageError)
            // Add placeholder
            doc.setFillColor(245, 245, 245)
            doc.rect(margin, yPosition, contentWidth * 0.8, 40, 'F')
            doc.setDrawColor(200, 200, 200)
            doc.rect(margin, yPosition, contentWidth * 0.8, 40)
            
            doc.setTextColor(100, 100, 100)
            doc.setFontSize(10)
            doc.text('📷 Image unavailable', margin + 10, yPosition + 25)
            yPosition += 50
            
            doc.setTextColor(0, 0, 0)
            doc.setFontSize(12)
          }
        }

        doc.setFont("helvetica", "normal")
        yPosition += 10
      }
    }

    const pdfBuffer = doc.output("arraybuffer")

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${(videoInfo.title || 'content').slice(0, 50).replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`,
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    throw new Error("Failed to generate PDF")
  }
}

// Helper function to process content with embedded images
async function processContentWithImages(doc: any, content: string, margin: number, startY: number, contentWidth: number, pageHeight: number) {
  let yPosition = startY
  
  // Split content by keyframe suggestions
  const parts = content.split(/(<div class="keyframe-suggestion[^>]*>[\s\S]*?<\/div>)/g)
  
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  
  for (const part of parts) {
    if (part.includes('keyframe-suggestion')) {
      // This is an image part
      const timestampMatch = part.match(/data-timestamp="([^"]*)"/)
      const imgMatch = part.match(/<img[^>]*src="([^"]*)"[^>]*>/)
      const descMatch = part.match(/<p[^>]*>(.*?)<\/p>/)
      
      if (imgMatch && imgMatch[1]) {
        try {
          // Add some space before image
          yPosition += 10

          // Check if we need a new page
          if (yPosition > pageHeight - 120) {
            doc.addPage()
            yPosition = margin
          }

          const imageUrl = imgMatch[1]
          const description = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : 'Visual element'
          
          let base64Data = imageUrl
          
          // Handle different base64 formats
          if (imageUrl.startsWith('data:image/')) {
            base64Data = imageUrl.split(',')[1]
          } else if (imageUrl.startsWith('/9j/')) {
            base64Data = imageUrl
          }
          
          // Add the actual image to PDF
          const imgWidth = Math.min(contentWidth, 120)
          const imgHeight = imgWidth * 0.5625 // 16:9 aspect ratio
          
          doc.addImage(`data:image/jpeg;base64,${base64Data}`, 'JPEG', margin, yPosition, imgWidth, imgHeight)
          yPosition += imgHeight + 5
          
          // Add image caption
          doc.setTextColor(100, 100, 100)
          doc.setFontSize(9)
          const captionLines = doc.splitTextToSize(description, contentWidth)
          doc.text(captionLines, margin, yPosition)
          yPosition += captionLines.length * 4 + 15
          
          doc.setTextColor(0, 0, 0)
          doc.setFontSize(12)
        } catch (imageError) {
          console.warn('Could not load inline image:', imageError)
          // Add placeholder
          doc.setFillColor(245, 245, 245)
          doc.rect(margin, yPosition, contentWidth, 30, 'F')
          doc.setDrawColor(200, 200, 200)
          doc.rect(margin, yPosition, contentWidth, 30)
          
          doc.setTextColor(100, 100, 100)
          doc.setFontSize(10)
          doc.text('📷 Visual element', margin + 10, yPosition + 20)
          yPosition += 40
          
          doc.setTextColor(0, 0, 0)
          doc.setFontSize(12)
        }
      }
    } else if (part.trim()) {
      // This is text content
      const cleanText = cleanHtmlToText(part)
      if (cleanText.trim()) {
        const lines = doc.splitTextToSize(cleanText, contentWidth)
        
        for (const line of lines) {
          if (yPosition > pageHeight - 30) {
            doc.addPage()
            yPosition = margin
          }
          
          doc.text(line, margin, yPosition)
          yPosition += 7
        }
        
        yPosition += 10 // Extra spacing after paragraphs
      }
    }
  }
}

async function exportToDocx(content: string, videoInfo: any, keyFrames: any[]) {
  try {
    const children: any[] = []

    // Add title
    if (videoInfo?.title) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: videoInfo.title,
              bold: true,
              size: 32,
            }),
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      )
    }

    // Add video info
    if (videoInfo?.author || videoInfo?.duration) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${videoInfo.author ? `By: ${videoInfo.author}` : ''}${videoInfo.author && videoInfo.duration ? ' • ' : ''}${videoInfo.duration ? `Duration: ${videoInfo.duration}` : ''}`,
              italics: true,
              size: 20,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
        })
      )
    }

    // Process content and images
    await processContentForDocx(children, content, keyFrames)

    // Add key frames section if available
    if (keyFrames && keyFrames.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Key Visual Moments",
              bold: true,
              size: 24,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 800, after: 400 },
        })
      )

      for (let i = 0; i < keyFrames.length; i++) {
        const frame = keyFrames[i]
        const minutes = Math.floor(frame.timestamp / 60)
        const seconds = Math.floor(frame.timestamp % 60)
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`

        // Add frame description
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${i + 1}. [${timeStr}] ${frame.description || 'Key moment'}`,
                bold: true,
              }),
            ],
            spacing: { before: 200, after: 200 },
          })
        )

        // Add image if available
        if (frame.imageUrl) {
          try {
            let base64Data = frame.imageUrl
            
            if (frame.imageUrl.startsWith('data:image/')) {
              base64Data = frame.imageUrl.split(',')[1]
            } else if (frame.imageUrl.startsWith('/9j/')) {
              base64Data = frame.imageUrl
            }

            const imageBuffer = Buffer.from(base64Data, 'base64')
            
            children.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: imageBuffer,
                    transformation: {
                      width: 400,
                      height: 225,
                    },
                    type: "jpg",
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
              })
            )
          } catch (imageError) {
            console.warn('Could not add key frame image to DOCX:', imageError)
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: '📷 Image unavailable',
                    italics: true,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
              })
            )
          }
        }
      }
    }

    // Create the document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children,
        },
      ],
    })

    // Generate the buffer
    const buffer = await Packer.toBuffer(doc)

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${(videoInfo?.title || 'content').slice(0, 50).replace(/[^a-zA-Z0-9]/g, '_')}.docx"`,
      },
    })
  } catch (error) {
    console.error("DOCX generation error:", error)
    throw new Error("Failed to generate DOCX")
  }
}

// Helper function to process content for DOCX
async function processContentForDocx(children: any[], content: string, keyFrames: any[]) {
  // Split content by keyframe suggestions and other HTML elements
  const parts = content.split(/(<div class="keyframe-suggestion[^>]*>[\s\S]*?<\/div>|<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>|<strong[^>]*>[\s\S]*?<\/strong>|<em[^>]*>[\s\S]*?<\/em>)/g)
  
  for (const part of parts) {
    if (part.includes('keyframe-suggestion')) {
      // Handle embedded images
      const imgMatch = part.match(/<img[^>]*src="([^"]*)"[^>]*>/)
      const descMatch = part.match(/<p[^>]*>(.*?)<\/p>/)
      
      if (imgMatch && imgMatch[1]) {
        try {
          const imageUrl = imgMatch[1]
          const description = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : 'Visual element'
          
          let base64Data = imageUrl
          
          if (imageUrl.startsWith('data:image/')) {
            base64Data = imageUrl.split(',')[1]
          } else if (imageUrl.startsWith('/9j/')) {
            base64Data = imageUrl
          }

          const imageBuffer = Buffer.from(base64Data, 'base64')
          
          children.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageBuffer,
                  transformation: {
                    width: 400,
                    height: 225,
                  },
                  type: "jpg",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 },
            })
          )

          // Add image caption
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: description,
                  italics: true,
                  size: 18,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            })
          )
        } catch (imageError) {
          console.warn('Could not add inline image to DOCX:', imageError)
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: '📷 Visual element',
                  italics: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            })
          )
        }
      }
    } else if (part.match(/<h[1-6]/)) {
      // Handle headings
      const headingMatch = part.match(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/)
      if (headingMatch) {
        const level = parseInt(headingMatch[1])
        const headingText = headingMatch[2].replace(/<[^>]*>/g, '').trim()
        
        const headingLevel = level === 1 ? HeadingLevel.HEADING_1 : 
                           level === 2 ? HeadingLevel.HEADING_2 : 
                           level === 3 ? HeadingLevel.HEADING_3 : HeadingLevel.HEADING_4

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: headingText,
                bold: true,
                size: level === 1 ? 28 : level === 2 ? 24 : level === 3 ? 22 : 20,
              }),
            ],
            heading: headingLevel,
            spacing: { before: 400, after: 200 },
          })
        )
      }
    } else if (part.match(/<strong/)) {
      // Handle bold text
      const boldMatch = part.match(/<strong[^>]*>(.*?)<\/strong>/)
      if (boldMatch) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: boldMatch[1].replace(/<[^>]*>/g, '').trim(),
                bold: true,
              }),
            ],
            spacing: { after: 200 },
          })
        )
      }
    } else if (part.match(/<em/)) {
      // Handle italic text
      const italicMatch = part.match(/<em[^>]*>(.*?)<\/em>/)
      if (italicMatch) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: italicMatch[1].replace(/<[^>]*>/g, '').trim(),
                italics: true,
              }),
            ],
            spacing: { after: 200 },
          })
        )
      }
    } else if (part.trim()) {
      // Handle regular text content
      const cleanText = cleanHtmlToText(part)
      if (cleanText.trim()) {
        // Split into paragraphs
        const paragraphs = cleanText.split('\n\n').filter(p => p.trim())
        
        for (const paragraph of paragraphs) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: paragraph.trim(),
                }),
              ],
              spacing: { after: 200 },
            })
          )
        }
      }
    }
  }
}
