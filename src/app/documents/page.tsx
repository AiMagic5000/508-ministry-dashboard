'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { FileText, Plus, Edit2, Trash2, Download, Upload } from 'lucide-react'

interface Document {
  id: string
  name: string
  type: string
  category: string
  upload_date: string
  file_size: string
  url: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: '2024 Annual Report.pdf',
      type: 'PDF',
      category: 'Financial',
      upload_date: '2024-01-15',
      file_size: '2.4 MB',
      url: '#'
    },
    {
      id: '2',
      name: 'Board Meeting Minutes Q4.docx',
      type: 'DOCX',
      category: 'Minutes',
      upload_date: '2024-01-10',
      file_size: '1.1 MB',
      url: '#'
    }
  ])

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter(doc => doc.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-light-200">
      <Sidebar />

      <div style={{ marginLeft: '256px' }} className="hidden lg:block">
        <Header />

        <main className="p-4 md:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-light-900 mb-2 flex items-center gap-2">
                <FileText className="w-8 h-8 text-primary-500" />
                Documents
              </h1>
              <p className="text-light-500">Manage ministry documents and files</p>
            </div>
            <button className="btn-primary flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="card flex items-center justify-between hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary-50">
                    <FileText className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-light-900">{doc.name}</h3>
                    <p className="text-sm text-light-500">
                      {doc.category} • {doc.file_size} • Uploaded {new Date(doc.upload_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-light-100 transition-colors">
                    <Download className="w-4 h-4 text-primary-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
