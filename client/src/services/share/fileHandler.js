/**
 * File Receiver & MIME Validator for Web Share Target
 * Safely processes incoming files from native share sheet or drag-and-drop
 */

export const FILE_CATEGORIES = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  PDF: 'PDF',
  DOCUMENT: 'DOCUMENT',
  OTHER: 'OTHER'
};

/**
 * Format bytes to readable human string
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Classifies a file into a high-level category based on MIME type and file extension
 */
export function classifyFile(file) {
  const mime = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();
  const ext = name.split('.').pop() || '';

  // Blocked / Risky extensions
  const dangerousExtensions = ['exe', 'bat', 'cmd', 'sh', 'msi', 'vbs', 'ps1', 'jar', 'apk'];
  const isDangerous = dangerousExtensions.includes(ext);

  if (isDangerous) {
    return {
      category: FILE_CATEGORIES.OTHER,
      isDangerous: true,
      previewType: 'UNSUPPORTED',
      suggestedResourceType: 'DOCUMENT',
      suggestedCategory: 'other',
      icon: 'AlertTriangle',
      label: 'Executables / Executable scripts cannot be executed.'
    };
  }

  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(ext)) {
    return {
      category: FILE_CATEGORIES.IMAGE,
      previewType: 'IMAGE',
      suggestedResourceType: 'IMAGE',
      suggestedCategory: 'art',
      icon: 'ImageIcon',
      label: 'Image File'
    };
  }

  if (mime.startsWith('video/') || ['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext)) {
    return {
      category: FILE_CATEGORIES.VIDEO,
      previewType: 'VIDEO',
      suggestedResourceType: 'VIDEO',
      suggestedCategory: 'entertainment',
      icon: 'Video',
      label: 'Video File'
    };
  }

  if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext)) {
    return {
      category: FILE_CATEGORIES.AUDIO,
      previewType: 'AUDIO',
      suggestedResourceType: 'MUSIC',
      suggestedCategory: 'music',
      icon: 'Music',
      label: 'Audio File'
    };
  }

  if (mime === 'application/pdf' || ext === 'pdf') {
    return {
      category: FILE_CATEGORIES.PDF,
      previewType: 'PDF',
      suggestedResourceType: 'DOCUMENT',
      suggestedCategory: 'education',
      icon: 'FileText',
      label: 'PDF Document'
    };
  }

  if (
    mime.startsWith('text/') ||
    ['txt', 'md', 'markdown', 'csv', 'json', 'xml', 'html', 'doc', 'docx'].includes(ext)
  ) {
    return {
      category: FILE_CATEGORIES.DOCUMENT,
      previewType: 'DOCUMENT',
      suggestedResourceType: 'ARTICLE',
      suggestedCategory: 'education',
      icon: 'FileText',
      label: 'Document / Text File'
    };
  }

  return {
    category: FILE_CATEGORIES.OTHER,
    previewType: 'GENERIC',
    suggestedResourceType: 'DOCUMENT',
    suggestedCategory: 'other',
    icon: 'File',
    label: 'Generic File'
  };
}

/**
 * Enrich raw file/blob with metadata, category, and safe object URL preview
 */
export function processSharedFile(rawFile) {
  if (!rawFile) return null;

  // If rawFile is an IndexedDB record with .blob property
  const blobOrFile = rawFile.blob instanceof Blob ? rawFile.blob : (rawFile instanceof Blob ? rawFile : null);
  const fileName = rawFile.name || (rawFile instanceof File ? rawFile.name : 'shared_file');
  const fileSize = rawFile.size || (blobOrFile ? blobOrFile.size : 0);
  const fileType = rawFile.type || (blobOrFile ? blobOrFile.type : 'application/octet-stream');
  const lastModified = rawFile.lastModified || Date.now();

  const classification = classifyFile({ name: fileName, type: fileType });

  let objectUrl = null;
  if (blobOrFile && typeof URL !== 'undefined' && URL.createObjectURL) {
    try {
      objectUrl = URL.createObjectURL(blobOrFile);
    } catch (err) {
      console.warn('Failed to create object URL for file:', err);
    }
  }

  return {
    name: fileName,
    size: fileSize,
    sizeFormatted: formatFileSize(fileSize),
    type: fileType,
    lastModified,
    blob: blobOrFile,
    objectUrl,
    classification,
    isLarge: fileSize > 50 * 1024 * 1024 // Flag files > 50MB
  };
}

/**
 * Safely revoke Object URLs to prevent browser memory leaks
 */
export function revokeFilePreviews(files = []) {
  files.forEach((f) => {
    if (f && f.objectUrl) {
      try {
        URL.revokeObjectURL(f.objectUrl);
      } catch (e) {
        // ignore
      }
    }
  });
}
