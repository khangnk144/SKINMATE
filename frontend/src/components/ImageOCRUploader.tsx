import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

interface ImageOCRUploaderProps {
  onExtracted: (ingredients: string) => void;
}

export function ImageOCRUploader({ onExtracted }: ImageOCRUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');
      const response = await fetch(`${baseUrl}/api/ocr/ingredients`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to extract text from image');
      }

      const data = await response.json();
      if (data.ingredients) {
        onExtracted(data.ingredients);
      } else {
        setError('No ingredients found in the image.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during extraction');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">
        Trích Xuất Từ Hình Ảnh (OCR)
      </label>
      
      {!previewUrl ? (
        <div 
          className="border-2 border-dashed border-rose-200 rounded-[2rem] p-8 text-center hover:bg-rose-50/50 transition-colors cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-sm text-slate-600 font-medium mb-1">Tải lên hoặc chụp ảnh thành phần</p>
          <p className="text-xs text-slate-400">Hỗ trợ JPG, PNG</p>
        </div>
      ) : (
        <div className="relative border border-slate-200 rounded-[2rem] p-4 bg-stone-50 overflow-hidden">
          <div className="flex items-start gap-6">
            <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
              {loading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-rose-500 animate-spin" />
                </div>
              )}
            </div>
            
            <div className="flex-1 py-2">
              {loading ? (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Đang phân tích hình ảnh...</h4>
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-2 bg-slate-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              ) : error ? (
                <div>
                  <h4 className="text-sm font-semibold text-rose-600 mb-1">Trích xuất thất bại</h4>
                  <p className="text-xs text-rose-500">{error}</p>
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-semibold text-emerald-600 mb-1">Trích xuất thành công</h4>
                  <p className="text-xs text-slate-500">Danh sách thành phần đã được điền vào ô bên dưới.</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={clearImage}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors absolute top-4 right-4 z-10"
              disabled={loading}
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      )}
      
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
}
