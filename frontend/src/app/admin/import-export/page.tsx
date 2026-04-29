"use client";

import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, ChevronDown } from 'lucide-react';

type EntityType = 'ingredients' | 'rules' | 'products';

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

interface FileUploadState {
  status: 'idle' | 'loading' | 'success' | 'error';
  result?: ImportResult;
  errorMessage?: string;
}

const ENTITY_CONFIG: Record<EntityType, { label: string; color: string; accent: string; columns: string }> = {
  ingredients: {
    label: 'Ingredients',
    color: 'emerald',
    accent: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    columns: 'name (required), description (optional)',
  },
  rules: {
    label: 'Safety Rules',
    color: 'rose',
    accent: 'bg-rose-50 border-rose-100 text-rose-700',
    columns: 'ingredient_name (or ingredient_id), skin_type, effect',
  },
  products: {
    label: 'Products',
    color: 'slate',
    accent: 'bg-slate-50 border-slate-100 text-slate-700',
    columns: 'name, brand, image_url (optional), ingredients_inci (comma-separated)',
  },
};

function ExportCard({ entity }: { entity: EntityType }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const config = ENTITY_CONFIG[entity];

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/v1/admin/export/${entity}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skinmate_${entity}_${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert(`Failed to export ${config.label}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-rose-50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-8 flex flex-col gap-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <div className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full border ${config.accent} mb-3`}>
            <FileSpreadsheet size={11} />
            {config.label}
          </div>
          <h3 className="text-lg font-serif text-slate-800 tracking-tight">Export to Excel</h3>
          <p className="text-sm text-slate-400 font-light mt-1">Download all {config.label.toLowerCase()} as a .xlsx file</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-3">
          <Download size={20} className="text-slate-400" />
        </div>
      </div>

      <button
        onClick={handleExport}
        disabled={loading}
        className="mt-auto w-full flex items-center justify-center gap-2 py-3 px-6 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download size={15} />
            Download .xlsx
          </>
        )}
      </button>
    </div>
  );
}

function ImportCard({ entity }: { entity: EntityType }) {
  const { token } = useAuth();
  const [state, setState] = useState<FileUploadState>({ status: 'idle' });
  const [dragOver, setDragOver] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const config = ENTITY_CONFIG[entity];

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setState({ status: 'error', errorMessage: 'Only Excel files (.xlsx, .xls) are supported.' });
      return;
    }

    setState({ status: 'loading' });
    setShowErrors(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`http://localhost:5000/api/v1/admin/import/${entity}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setState({ status: 'error', errorMessage: data.error || 'Import failed' });
        return;
      }

      setState({ status: 'success', result: data.result });
    } catch {
      setState({ status: 'error', errorMessage: 'Network error. Please try again.' });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const reset = () => {
    setState({ status: 'idle' });
    setShowErrors(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-rose-50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-8 flex flex-col gap-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <div className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full border ${config.accent} mb-3`}>
            <FileSpreadsheet size={11} />
            {config.label}
          </div>
          <h3 className="text-lg font-serif text-slate-800 tracking-tight">Import from Excel</h3>
          <p className="text-sm text-slate-400 font-light mt-1">
            Upload a .xlsx file to bulk-add or update {config.label.toLowerCase()}
          </p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-3">
          <Upload size={20} className="text-slate-400" />
        </div>
      </div>

      {/* Column hint */}
      <div className="bg-gray-50 rounded-2xl px-4 py-3">
        <p className="text-xs text-slate-400 font-light">
          <span className="font-semibold text-slate-500">Required columns: </span>
          {config.columns}
        </p>
      </div>

      {/* Drop zone */}
      {state.status === 'idle' || state.status === 'error' ? (
        <>
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
              dragOver
                ? 'border-rose-300 bg-rose-50/50 scale-[1.01]'
                : 'border-gray-200 hover:border-rose-200 hover:bg-gray-50/50'
            }`}
          >
            <Upload size={24} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">Drop your Excel file here</p>
            <p className="text-xs text-slate-400 mt-1">or click to browse</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleInputChange}
          />
          {state.status === 'error' && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3">
              <AlertCircle size={15} className="text-rose-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-rose-700 font-light">{state.errorMessage}</p>
            </div>
          )}
        </>
      ) : state.status === 'loading' ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <Loader2 size={28} className="animate-spin text-rose-300" />
          <p className="text-sm text-slate-400 font-light">Processing file...</p>
        </div>
      ) : (
        /* Success state */
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle size={18} />
            <span className="text-sm font-semibold">Import complete</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Created', value: state.result?.created ?? 0, color: 'text-emerald-600' },
              { label: 'Updated', value: state.result?.updated ?? 0, color: 'text-blue-500' },
              { label: 'Skipped', value: state.result?.skipped ?? 0, color: 'text-slate-400' },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-2xl p-4 text-center">
                <p className={`text-2xl font-serif font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-400 tracking-widest uppercase mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Errors collapsible */}
          {(state.result?.errors?.length ?? 0) > 0 && (
            <div className="border border-rose-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowErrors(!showErrors)}
                className="w-full flex items-center justify-between px-4 py-3 bg-rose-50 text-sm font-medium text-rose-700 hover:bg-rose-100 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <AlertCircle size={14} />
                  {state.result!.errors.length} row error{state.result!.errors.length !== 1 ? 's' : ''}
                </span>
                <ChevronDown size={14} className={`transition-transform ${showErrors ? 'rotate-180' : ''}`} />
              </button>
              {showErrors && (
                <div className="max-h-40 overflow-y-auto px-4 py-3 space-y-1.5">
                  {state.result!.errors.map((e, i) => (
                    <p key={i} className="text-xs text-rose-600 font-light">{e}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={reset}
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors text-center"
          >
            Import another file
          </button>
        </div>
      )}
    </div>
  );
}

export default function ImportExportPage() {
  const entities: EntityType[] = ['ingredients', 'rules', 'products'];

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-serif text-slate-900 tracking-tight">Import / Export</h1>
        <p className="text-slate-400 font-light mt-2">
          Manage your database in bulk using Excel (.xlsx) files. Export to back up data or use as import templates.
        </p>
      </div>

      {/* Workflow tip */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-3xl p-6 mb-10 flex gap-4">
        <div className="bg-white rounded-full p-2.5 shadow-sm flex-shrink-0 h-fit">
          <FileSpreadsheet size={18} className="text-rose-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-1">Recommended workflow for new data</p>
          <p className="text-sm text-slate-500 font-light">
            <span className="font-medium text-slate-600">1.</span> Export existing data as a template →{' '}
            <span className="font-medium text-slate-600">2.</span> Edit in Excel →{' '}
            <span className="font-medium text-slate-600">3.</span> Import back. Importing will{' '}
            <span className="font-semibold text-slate-700">create new rows</span> and{' '}
            <span className="font-semibold text-slate-700">update existing ones</span> (matched by name/brand), it will NOT delete any data.
          </p>
        </div>
      </div>

      {/* Section: Export */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-slate-900 rounded-full p-2">
            <Download size={14} className="text-white" />
          </div>
          <h2 className="text-lg font-serif text-slate-800 tracking-tight">Export Database</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {entities.map((entity) => (
            <ExportCard key={entity} entity={entity} />
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-rose-50 mb-12" />

      {/* Section: Import */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-rose-400 rounded-full p-2">
            <Upload size={14} className="text-white" />
          </div>
          <h2 className="text-lg font-serif text-slate-800 tracking-tight">Import from Excel</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {entities.map((entity) => (
            <ImportCard key={entity} entity={entity} />
          ))}
        </div>
      </section>
    </div>
  );
}
