import { useState, useCallback } from 'react';
import { TaskType } from '../../types';
import { validate, readAsDataURL } from '../../fileHandler';

interface FileUploadZoneProps {
  taskType: TaskType;
  onFile: (file: File, dataUrl: string) => void;
  onError: (msg: string) => void;
  preview?: string | null;
}

export default function FileUploadZone({ taskType, onFile, onError, preview }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    const result = validate(file, taskType);
    if (!result.accepted) {
      onError(result.error ?? 'File validation failed');
      return;
    }
    try {
      const dataUrl = await readAsDataURL(file);
      onFile(file, dataUrl);
    } catch {
      onError('Failed to read file');
    }
  }, [taskType, onFile, onError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-4 md:p-6 text-center cursor-pointer transition-colors min-h-[100px] flex flex-col items-center justify-center ${
        isDragging ? 'border-[#00D4FF] bg-[#00D4FF]/5' : 'border-white/20 hover:border-white/40'
      }`}
      onClick={() => document.getElementById(`file-input-${taskType}`)?.click()}
      role="button"
      tabIndex={0}
      aria-label="Upload file"
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById(`file-input-${taskType}`)?.click(); }}
    >
      <input
        id={`file-input-${taskType}`}
        type="file"
        className="hidden"
        onChange={handleSelect}
        aria-hidden="true"
      />
      {preview && taskType !== 'pdf_qa' && taskType !== 'contract_analyzer' && taskType !== 'redline_comparison' && taskType !== 'deep_doc_qa' ? (
        <img src={preview} alt="Uploaded file preview" className="max-w-xs max-h-48 mx-auto mb-4 rounded-lg" />
      ) : null}
      <p className="text-sm text-gray-400">
        Drag & drop or click to upload
      </p>
      <p className="text-xs text-gray-500 mt-1">
        Max 50 MB
      </p>
    </div>
  );
}
