
export const formatDate = (dateString?: string, includeTime: boolean = true): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    return date.toLocaleDateString('id-ID', options);
  } catch (error) {
    return dateString; // return original if parsing fails
  }
};

export const getFileExtension = (filename: string): string => {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};

export const getMimeType = (filename: string): string => {
    const extension = getFileExtension(filename).toLowerCase();
    switch (extension) {
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'gif':
            return 'image/gif';
        case 'pdf':
            return 'application/pdf';
        case 'doc':
            return 'application/msword';
        case 'docx':
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        case 'xls':
            return 'application/vnd.ms-excel';
        case 'xlsx':
            return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        case 'txt':
            return 'text/plain';
        case 'mp4':
            return 'video/mp4';
        case 'mov':
            return 'video/quicktime';
        default:
            return 'application/octet-stream';
    }
};

// Simple base64 encoder for POC, in real app use a robust library or FileReader API for actual file content.
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
