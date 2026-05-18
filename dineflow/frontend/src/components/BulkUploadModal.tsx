import { useState, useRef, useCallback } from 'react';
import { Upload, X, Download, CheckCircle, AlertCircle, FileSpreadsheet, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../lib/axios';

interface ParsedRow {
  category_name: string;
  category_type: string;
  item_name: string;
  description: string;
  image_url: string;
  ingredients: string;
  allergens: string;
  tags: string;
  is_featured: string;
  is_available: string;
  variants: { label: string; price: number }[];
}

interface UploadResult {
  message: string;
  created: number;
  skipped: number;
  errors: string[];
}

interface Props {
  onClose: () => void;
  onDone: () => void;
}

export default function BulkUploadModal({ onClose, onDone }: Props) {
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [dragging, setDragging] = useState(false);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Parse file (XLSX or CSV) ────────────────────────────
  const parseFile = useCallback((file: File) => {
    setErrors([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const wb = XLSX.read(data, { type: 'binary' });

        // Use first sheet
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<any>(ws, { defval: '' });

        if (json.length === 0) {
          setErrors(['File is empty or has no data rows.']);
          return;
        }

        const parseErrors: string[] = [];
        const parsed: ParsedRow[] = [];

        json.forEach((row: any, idx: number) => {
          const rowNum = idx + 2; // +2 because row 1 is header

          if (!row.item_name?.toString().trim()) return; // skip empty rows

          // Build variants array from up to 4 variant columns
          const variants: { label: string; price: number }[] = [];
          for (let i = 1; i <= 4; i++) {
            const label = row[`variant_${i}_label`]?.toString().trim();
            const price = parseFloat(row[`variant_${i}_price`]);
            if (label && !isNaN(price)) {
              variants.push({ label, price });
            }
          }

          // Validate required fields
          if (!row.category_name?.toString().trim()) {
            parseErrors.push(`Row ${rowNum} "${row.item_name}": missing category_name`);
            return;
          }
          if (variants.length === 0) {
            parseErrors.push(`Row ${rowNum} "${row.item_name}": needs at least 1 variant with label + price`);
            return;
          }

          parsed.push({
            category_name: row.category_name?.toString().trim(),
            category_type: row.category_type?.toString().trim() || 'FOOD',
            item_name: row.item_name?.toString().trim(),
            description: row.description?.toString().trim(),
            image_url: row.image_url?.toString().trim(),
            ingredients: row.ingredients?.toString().trim(),
            allergens: row.allergens?.toString().trim(),
            tags: row.tags?.toString().trim(),
            is_featured: row.is_featured?.toString().trim(),
            is_available: row.is_available?.toString().trim(),
            variants,
          });
        });

        if (parsed.length === 0 && parseErrors.length === 0) {
          setErrors(['No valid rows found. Make sure you have data in the file.']);
          return;
        }

        setRows(parsed);
        setErrors(parseErrors);
        if (parsed.length > 0) setStep('preview');
      } catch (err) {
        setErrors(['Could not read file. Make sure it is a valid .xlsx or .csv file.']);
      }
    };
    reader.readAsBinaryString(file);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }, [parseFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const upload = async () => {
    setUploading(true);
    try {
      const { data } = await api.post('/bulk/menu', { rows });
      setResult(data);
      setStep('result');
      if (data.created > 0) setTimeout(onDone, 100);
    } catch (err: any) {
      setErrors([err.response?.data?.error || 'Upload failed']);
    } finally {
      setUploading(false);
    }
  };

  // Group preview rows by category
  const grouped = rows.reduce<Record<string, ParsedRow[]>>((acc, row) => {
    const key = `${row.category_name} (${row.category_type})`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <FileSpreadsheet size={16} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">Bulk upload menu</h3>
              <p className="text-gray-500 text-xs">Upload Excel or CSV with all items at once</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          
          {/* ── STEP 1: UPLOAD ── */}
          {step === 'upload' && (
            <div className="space-y-4">
              {/* Download template */}
              <div className="flex items-center justify-between bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3">
                <div>
                  <div className="text-amber-400 text-sm font-medium">Start with the template</div>
                  <div className="text-gray-500 text-xs mt-0.5">Fill it in, then upload — no guessing the format</div>
                </div>
                <a
                  href="/dineflow-menu-template.csv"
                  download
                  className="flex items-center gap-1.5 text-xs text-amber-400 border border-amber-500/30 hover:border-amber-400 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Download size={12} /> Download template
                </a>
              </div>

              {/* Drop zone */}
              <div
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all"
                style={{
                  borderColor: dragging ? '#c9a84c' : 'rgba(255,255,255,0.1)',
                  background: dragging ? 'rgba(201,168,76,0.05)' : 'transparent',
                }}
              >
                <Upload size={28} className="mx-auto mb-3 text-gray-600" />
                <div className="text-white text-sm font-medium mb-1">
                  Drop your file here
                </div>
                <div className="text-gray-500 text-xs">
                  Supports .xlsx and .csv — or click to browse
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={onFileChange}
                />
              </div>

              {/* Parse errors */}
              {errors.length > 0 && (
                <div className="bg-red-500/8 border border-red-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-2">
                    <AlertCircle size={14} /> {errors.length} issue{errors.length > 1 ? 's' : ''} found
                  </div>
                  <ul className="space-y-1">
                    {errors.map((e, i) => (
                      <li key={i} className="text-red-400/70 text-xs">{e}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Format guide */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wider">Required columns</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    ['category_name', 'e.g. Breakfast'],
                    ['category_type', 'FOOD or DRINK'],
                    ['item_name', 'e.g. Timatim Eggs'],
                    ['variant_1_label', 'e.g. Regular'],
                    ['variant_1_price', 'e.g. 120'],
                    ['image_url', '(optional) Image URL'],
                  ].map(([col, ex]) => (
                    <div key={col} className="flex items-center gap-2">
                      <code className="text-amber-400 text-xs bg-amber-500/8 px-1.5 py-0.5 rounded">{col}</code>
                      <span className="text-gray-600 text-xs">{ex}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  💡 Tip: Add image URLs from Unsplash, Imgur, or any direct image link. Images will be downloaded automatically!
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: PREVIEW ── */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* Summary bar */}
              <div className="flex items-center gap-4 bg-green-500/8 border border-green-500/20 rounded-xl px-4 py-3">
                <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-green-400 text-sm font-medium">{rows.length} items ready to upload</span>
                  <span className="text-gray-500 text-xs ml-2">across {Object.keys(grouped).length} categories</span>
                </div>
                <button onClick={() => { setStep('upload'); setRows([]); setErrors([]); }}
                  className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
                  Change file
                </button>
              </div>

              {/* Parse warnings */}
              {errors.length > 0 && (
                <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-3">
                  <div className="text-amber-400 text-xs font-medium mb-1">
                    {errors.length} row{errors.length > 1 ? 's' : ''} skipped
                  </div>
                  {errors.map((e, i) => (
                    <div key={i} className="text-amber-400/60 text-xs">{e}</div>
                  ))}
                </div>
              )}

              {/* Preview table grouped by category */}
              <div className="space-y-4">
                {Object.entries(grouped).map(([cat, items]) => (
                  <div key={cat}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-gray-400 text-xs uppercase tracking-widest">{cat}</span>
                      <span className="text-gray-700 text-xs">({items.length} items)</span>
                    </div>
                    <div className="bg-gray-800/40 rounded-xl overflow-hidden border border-gray-700/50">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left px-3 py-2 text-gray-500 font-medium">Item</th>
                            <th className="text-left px-3 py-2 text-gray-500 font-medium">Variants</th>
                            <th className="text-left px-3 py-2 text-gray-500 font-medium">Tags</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, i) => (
                            <tr key={i} className="border-b border-gray-700/40 last:border-0">
                              <td className="px-3 py-2">
                                <div className="text-white font-medium">{item.item_name}</div>
                                {item.description && (
                                  <div className="text-gray-600 mt-0.5 truncate max-w-[180px]">{item.description}</div>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex flex-wrap gap-1">
                                  {item.variants.map((v, vi) => (
                                    <span key={vi} className="text-amber-400 bg-amber-500/8 border border-amber-500/15 px-1.5 py-0.5 rounded text-xs">
                                      {v.label} — {v.price}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                {item.is_featured === 'TRUE' && (
                                  <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded mr-1">
                                    ★ Featured
                                  </span>
                                )}
                                {item.tags && item.tags.split(',').slice(0, 2).map((t, ti) => (
                                  <span key={ti} className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded mr-1">
                                    {t.trim()}
                                  </span>
                                ))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 3: RESULT ── */}
          {step === 'result' && result && (
            <div className="text-center py-6 space-y-4">
              <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center ${result.created > 0 ? 'bg-green-500/15' : 'bg-amber-500/15'}`}>
                {result.created > 0
                  ? <CheckCircle size={28} className="text-green-400" />
                  : <AlertCircle size={28} className="text-amber-400" />
                }
              </div>
              <div>
                <div className="text-white text-lg font-semibold mb-1">{result.message}</div>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <span className="text-green-400">{result.created} created</span>
                  {result.skipped > 0 && <span className="text-gray-500">{result.skipped} skipped</span>}
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-4 text-left max-h-40 overflow-y-auto">
                  <div className="text-amber-400 text-xs font-medium mb-2">Notes</div>
                  {result.errors.map((e, i) => (
                    <div key={i} className="text-amber-400/60 text-xs mb-1">{e}</div>
                  ))}
                </div>
              )}
              <button onClick={onClose}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold rounded-lg transition-colors text-sm">
                View menu items
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'preview' && (
          <div className="px-5 py-4 border-t border-gray-800 flex items-center justify-between flex-shrink-0">
            <span className="text-gray-600 text-xs">
              Duplicate item names will be skipped automatically
            </span>
            <button
              onClick={upload}
              disabled={uploading || rows.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-900 font-semibold rounded-lg transition-colors text-sm"
            >
              {uploading
                ? <><Loader2 size={14} className="animate-spin" /> Uploading…</>
                : <><Upload size={14} /> Upload {rows.length} items</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
