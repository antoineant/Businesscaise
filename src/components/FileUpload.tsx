import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatFileSize, fileToBase64 } from '../utils/gameEngine';

interface Props {
  onFileSelect: (fileData: {
    fileName: string;
    fileSize: number;
    fileType: string;
    base64Data: string;
  }) => void;
  acceptedFormats: string[];
  maxSize: number; // in MB
  disabled?: boolean;
}

export default function FileUpload({ onFileSelect, acceptedFormats, maxSize, disabled }: Props) {
  const { t } = useTranslation('common');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      return t('fileUpload.invalidType', { formats: acceptedFormats.join(', ') });
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return t('fileUpload.tooLarge', { maxSize });
    }

    return null;
  };

  const handleFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setSelectedFile(file);
    setUploading(true);

    try {
      const base64Data = await fileToBase64(file);

      onFileSelect({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        base64Data,
      });

      setUploading(false);
    } catch (err) {
      setError(t('fileUpload.failed'));
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-gray-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary-400'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept={acceptedFormats.join(',')}
          disabled={disabled || uploading}
        />

        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
            <p className="text-sm text-gray-600">{t('fileUpload.processing')}</p>
          </div>
        ) : selectedFile ? (
          <div className="space-y-2">
            <div className="text-4xl">📄</div>
            <p className="font-semibold text-gray-800">{selectedFile.name}</p>
            <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
              }}
              className="text-sm text-red-600 hover:text-red-700 underline"
            >
              {t('buttons.remove')}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">📁</div>
            <p className="font-semibold text-gray-700">
              {t('fileUpload.dropHere')}
            </p>
            <p className="text-sm text-gray-500">
              {t('fileUpload.acceptedFormats', { formats: acceptedFormats.join(', '), maxSize })}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
