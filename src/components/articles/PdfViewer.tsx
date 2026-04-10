import React, { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

// Configuration de pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface PdfViewerProps {
  url: string
  width?: number
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ 
  url, 
  width = 600 
}) => {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => prevPageNumber + offset)
  }

  function previousPage() {
    changePage(-1)
  }

  function nextPage() {
    changePage(1)
  }

  return (
    <div className="pdf-viewer">
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        className="pdf-document"
      >
        <Page 
          pageNumber={pageNumber} 
          width={width} 
          renderTextLayer={false}
          renderAnnotationLayer={true}
        />
      </Document>
      
      <div className="pdf-navigation">
        <p>
          Page {pageNumber || (numPages ? 1 : '--')} sur {numPages || '--'}
        </p>
        <div className="pdf-controls">
          <button 
            type="button" 
            disabled={pageNumber <= 1} 
            onClick={previousPage}
            className="btn btn-secondary"
          >
            Précédent
          </button>
          <button 
            type="button" 
            disabled={pageNumber >= (numPages || 0)} 
            onClick={nextPage}
            className="btn btn-secondary"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  )
}