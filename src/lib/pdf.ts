import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export async function exportToPdf(element: HTMLElement, filename: string) {
  const scale = 2

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  })

  const A4_WIDTH_MM = 210
  const A4_HEIGHT_MM = 297
  const PAGE_PADDING_MM = 8 // top/bottom padding for continuation pages

  const pxPerMm = canvas.width / A4_WIDTH_MM
  const pageHeightPx = A4_HEIGHT_MM * pxPerMm
  const paddingPx = PAGE_PADDING_MM * pxPerMm

  // Collect section break candidates from the template
  const sections = element.querySelectorAll("[data-pdf-section]")
  const templateRect = element.getBoundingClientRect()
  const breakCandidates: number[] = []

  sections.forEach((section) => {
    const rect = (section as HTMLElement).getBoundingClientRect()
    const topPx = (rect.top - templateRect.top) * scale
    breakCandidates.push(topPx)
  })

  // Sort and deduplicate
  breakCandidates.sort((a, b) => a - b)

  // Build pages by finding optimal break points
  const pages: { startY: number; endY: number }[] = []
  let currentStart = 0

  while (currentStart < canvas.height) {
    // First page uses full height; continuation pages reserve padding
    const isFirstPage = currentStart === 0
    const usableHeight = isFirstPage ? pageHeightPx : pageHeightPx - paddingPx
    const maxEnd = currentStart + usableHeight

    if (maxEnd >= canvas.height) {
      // Everything remaining fits on this page
      pages.push({ startY: currentStart, endY: canvas.height })
      break
    }

    // Find the last break candidate that fits within this page
    let bestBreak = -1
    for (const bp of breakCandidates) {
      if (bp > currentStart + paddingPx && bp <= maxEnd) {
        bestBreak = bp
      }
    }

    if (bestBreak > currentStart) {
      pages.push({ startY: currentStart, endY: bestBreak })
      currentStart = bestBreak
    } else {
      // No good break point found, force break at page boundary
      pages.push({ startY: currentStart, endY: maxEnd })
      currentStart = maxEnd
    }
  }

  const pdf = new jsPDF("p", "mm", "a4")

  pages.forEach((page, index) => {
    if (index > 0) pdf.addPage()

    const segmentHeight = page.endY - page.startY
    const segmentHeightMm = segmentHeight / pxPerMm
    const isFirstPage = index === 0
    const yOffsetMm = isFirstPage ? 0 : PAGE_PADDING_MM

    // Create a cropped canvas for this page segment
    const pageCanvas = document.createElement("canvas")
    pageCanvas.width = canvas.width
    pageCanvas.height = Math.ceil(segmentHeight)
    const ctx = pageCanvas.getContext("2d")!
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
    ctx.drawImage(
      canvas,
      0,
      Math.floor(page.startY),
      canvas.width,
      Math.ceil(segmentHeight),
      0,
      0,
      canvas.width,
      Math.ceil(segmentHeight)
    )

    pdf.addImage(
      pageCanvas.toDataURL("image/png"),
      "PNG",
      0,
      yOffsetMm,
      A4_WIDTH_MM,
      segmentHeightMm
    )
  })

  pdf.save(filename)
}
