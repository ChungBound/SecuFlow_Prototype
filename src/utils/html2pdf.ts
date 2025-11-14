import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function htmlToPDF(htmlId: string, title: string = '报表', bgColor = '#fff', selectedTeams: string[]) {
  const pdfDom: HTMLElement | null = document.getElementById(htmlId) as HTMLElement
  pdfDom.style.padding = '0 10px !important'

  // 获取实际内容的尺寸
  const { width, height } = pdfDom.getBoundingClientRect()

  const scale = 2 // 提高清晰度
  const canvas = await html2canvas(pdfDom, {
    scale,
    useCORS: true,
    backgroundColor: bgColor,
  })

  // 计算PDF的尺寸，考虑到scale因子
  const pdfWidth = width / scale
  const pdfHeight = height / scale

  const PDF = new jsPDF({
    orientation: pdfWidth > pdfHeight ? 'l' : 'p',
    unit: 'px',
    format: [pdfWidth, pdfHeight],
  })

  const imgData = canvas.toDataURL('image/jpeg', 1.0)
  PDF.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)

  // 添加密集水印
  PDF.setTextColor(150, 150, 150) // 设置水印颜色为浅灰色
  PDF.setFontSize(10) // 稍微减小字体大小
  PDF.setGState(new PDF.GState({ opacity: 0.2 })) // 略微降低透明度以适应更密集的水印

  const watermarkText = `Only for: ${selectedTeams.join(', ')}`

  // 在整个页面上以网格形式添加水印
  const stepX = 150 // 水平间距
  const stepY = 100 // 垂直间距
  for (let x = 0; x < pdfWidth; x += stepX) {
    for (let y = 0; y < pdfHeight; y += stepY) {
      PDF.text(watermarkText, x, y, {
        angle: 45,
        align: 'left',
      })
    }
  }

  PDF.save(`${title}.pdf`)
}
