import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api, apiErrorMessage } from '../../lib/api'
import { ErrorNote, PrimaryButton, SecondaryButton, SectionCard } from '../../components/ui'

interface ImportResult {
  counts: Record<string, number>
  errors: string[]
}

const TABLE_LABELS: Record<string, string> = {
  school_classes: 'Classes',
  sections: 'Sections',
  subjects: 'Subjects',
  students: 'Students',
  employees: 'Staff records',
}

export function ImportDataPage() {
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  async function handleDownloadTemplate() {
    setDownloadError(null)
    setIsDownloading(true)
    try {
      const response = await api.get('/import/template', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = 'campus-suite-import-template.xlsx'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setDownloadError(apiErrorMessage(err))
    } finally {
      setIsDownloading(false)
    }
  }

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return (await api.post<ImportResult>('/import', formData)).data
    },
  })

  function handleImport() {
    if (selectedFile) importMutation.mutate(selectedFile)
  }

  const result = importMutation.data

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Import Data</h1>
      <p className="mt-1 text-sm text-slate-500">
        Bring in classes, sections, subjects, students, and staff from one Excel file instead of entering each one
        by hand.
      </p>

      <div className="mt-6 space-y-6">
        <SectionCard title="1. Download the template" description="One workbook, one sheet per record type, with a Read Me sheet explaining each column.">
          <div className="flex items-center gap-3">
            <PrimaryButton onClick={handleDownloadTemplate} disabled={isDownloading}>
              {isDownloading ? 'Preparing…' : 'Download Excel template'}
            </PrimaryButton>
          </div>
          {downloadError && (
            <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{downloadError}</div>
          )}
        </SectionCard>

        <SectionCard
          title="2. Upload it back"
          description="Fill in the sheets you need in the downloaded file, leave the rest empty, then upload it here."
        >
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xlsm"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="text-sm text-slate-600 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-50"
            />
            <PrimaryButton onClick={handleImport} disabled={!selectedFile || importMutation.isPending}>
              {importMutation.isPending ? 'Importing…' : 'Import'}
            </PrimaryButton>
            {selectedFile && (
              <SecondaryButton
                type="button"
                onClick={() => {
                  setSelectedFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
              >
                Clear
              </SecondaryButton>
            )}
          </div>
          <ErrorNote error={importMutation.error} />
        </SectionCard>

        {result && (
          <SectionCard title="Import results">
            {Object.keys(result.counts).length > 0 ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
                {Object.entries(result.counts).map(([table, count]) => (
                  <div key={table} className="flex justify-between border-b border-slate-100 py-1">
                    <span className="text-slate-500">{TABLE_LABELS[table] ?? table}</span>
                    <span className="font-medium text-slate-900">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No rows were created — check the sheet names and required columns.</p>
            )}

            {result.errors.length > 0 && (
              <div className="mt-4 rounded-md bg-amber-50 px-3 py-3 text-sm text-amber-800">
                <p className="mb-1 font-medium">{result.errors.length} row(s) were skipped:</p>
                <ul className="list-inside list-disc space-y-0.5">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </SectionCard>
        )}
      </div>
    </div>
  )
}
