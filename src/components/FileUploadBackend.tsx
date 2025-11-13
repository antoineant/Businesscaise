import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { unifiedUploadAPI as uploadAPI } from '../services/api.unified';

interface FileUploadBackendProps {
  gameId: string;
  teamId: string;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  onUploadComplete?: (fileUrls: string[]) => void;
  onUploadError?: (error: string) => void;
}

interface UploadedFile {
  file: File;
  url?: string;
  progress: number;
  error?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
}

export default function FileUploadBackend({
  gameId,
  teamId,
  maxFiles = 5,
  maxSizeMB = 10,
  acceptedFormats = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg'],
  onUploadComplete,
  onUploadError,
}: FileUploadBackendProps) {
  const { t } = useTranslation('common');
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      return t('fileUpload.invalidTypeShort', { formats: acceptedFormats.join(', ') });
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return t('fileUpload.tooLargeShort', { maxSize: maxSizeMB });
    }

    return null;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);

    // Check if adding these files would exceed the max
    if (selectedFiles.length + fileArray.length > maxFiles) {
      onUploadError?.(t('fileUpload.maxFilesExceeded', { maxFiles }));
      return;
    }

    const newFiles: UploadedFile[] = [];
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        onUploadError?.(error);
        continue;
      }

      newFiles.push({
        file,
        progress: 0,
        status: 'pending',
      });
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Update all files to uploading status
      setSelectedFiles((prev) =>
        prev.map((f) => ({ ...f, status: 'uploading' as const, progress: 50 }))
      );

      // Upload files to backend
      const fileObjects = selectedFiles.map((f) => f.file);
      const uploadedUrls = await uploadAPI.uploadFiles(fileObjects, gameId, teamId);

      // Update files with success status and URLs
      setSelectedFiles((prev) =>
        prev.map((f, i) => ({
          ...f,
          status: 'success' as const,
          progress: 100,
          url: uploadedUrls[i],
        }))
      );

      onUploadComplete?.(uploadedUrls);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Upload failed';

      // Update files with error status
      setSelectedFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: 'error' as const,
          error: errorMessage,
        }))
      );

      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return `0 ${t('fileUpload.fileSizeUnits.bytes')}`;
    const k = 1024;
    const sizeKeys = ['bytes', 'kb', 'mb', 'gb'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + t(`fileUpload.fileSizeUnits.${sizeKeys[i]}`);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      {selectedFiles.length < maxFiles && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            multiple
            accept={acceptedFormats.join(',')}
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="w-12 h-12 text-gray-400" />
            <p className="text-gray-700 font-medium">
              {t('fileUpload.dropFiles')}
            </p>
            <p className="text-sm text-gray-500">
              {acceptedFormats.join(', ')} • {t('fileUpload.maxPerFile', { maxSize: maxSizeMB, maxFiles })}
            </p>
          </label>
        </div>
      )}

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              {t('fileUpload.selectedFiles', { count: selectedFiles.length, max: maxFiles })}
            </h4>
            {!isUploading && selectedFiles.some((f) => f.status === 'pending') && (
              <button
                onClick={uploadFiles}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {selectedFiles.length > 1
                  ? t('fileUpload.uploadFiles_plural', { count: selectedFiles.length })
                  : t('fileUpload.uploadFiles', { count: selectedFiles.length })}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {selectedFiles.map((fileData, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
              >
                <FileText className="w-8 h-8 text-gray-400 flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileData.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(fileData.file.size)}
                  </p>

                  {/* Progress bar */}
                  {fileData.status === 'uploading' && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${fileData.progress}%` }}
                      />
                    </div>
                  )}

                  {/* Error message */}
                  {fileData.status === 'error' && fileData.error && (
                    <p className="text-xs text-red-600 mt-1">{fileData.error}</p>
                  )}
                </div>

                {/* Status Icon */}
                {fileData.status === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                )}
                {fileData.status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                {fileData.status === 'uploading' && (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                )}

                {/* Remove button */}
                {fileData.status === 'pending' && (
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    disabled={isUploading}
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
