/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/client';
import bcrypt from 'bcryptjs';
import { 
  FileImage, 
  FileVideo, 
  FileAudio, 
  FileCode, 
  File, 
  Grid3X3, 
  List,
  Download,
  Eye,
  Calendar
} from 'lucide-react';

interface MyFile {
  url: string;
  name: string;
  file_type: string;
  uploaded_at: string;
}

// File type configuration
const FILE_TYPES = {
  pdf: { icon: File, color: "text-red-500", label: "PDF" },
  zip: { icon: File, color: "text-gray-500", label: "Archive" },
  jpg: { icon: FileImage, color: "text-yellow-500", label: "Image" },
  jpeg: { icon: FileImage, color: "text-yellow-500", label: "Image" },
  png: { icon: FileImage, color: "text-yellow-500", label: "Image" },
  gif: { icon: FileImage, color: "text-yellow-500", label: "Image" },
  webp: { icon: FileImage, color: "text-yellow-500", label: "Image" },
  bmp: { icon: FileImage, color: "text-yellow-500", label: "Image" },
  doc: { icon: File, color: "text-blue-500", label: "Document" },
  docx: { icon: File, color: "text-blue-500", label: "Document" },
  xls: { icon: File, color: "text-green-500", label: "Spreadsheet" },
  xlsx: { icon: File, color: "text-green-500", label: "Spreadsheet" },
  ppt: { icon: File, color: "text-orange-500", label: "Presentation" },
  pptx: { icon: File, color: "text-orange-500", label: "Presentation" },
  mp4: { icon: FileVideo, color: "text-purple-500", label: "Video" },
  mov: { icon: FileVideo, color: "text-purple-500", label: "Video" },
  avi: { icon: FileVideo, color: "text-purple-500", label: "Video" },
  webm: { icon: FileVideo, color: "text-purple-500", label: "Video" },
  mkv: { icon: FileVideo, color: "text-purple-500", label: "Video" },
  mp3: { icon: FileAudio, color: "text-pink-500", label: "Audio" },
  wav: { icon: FileAudio, color: "text-pink-500", label: "Audio" },
  aac: { icon: FileAudio, color: "text-pink-500", label: "Audio" },
  ogg: { icon: FileAudio, color: "text-pink-500", label: "Audio" },
  flac: { icon: FileAudio, color: "text-pink-500", label: "Audio" },
  js: { icon: FileCode, color: "text-indigo-500", label: "Code" },
  ts: { icon: FileCode, color: "text-indigo-500", label: "Code" },
  jsx: { icon: FileCode, color: "text-indigo-500", label: "Code" },
  tsx: { icon: FileCode, color: "text-indigo-500", label: "Code" },
  txt: { icon: File, color: "text-gray-500", label: "Text" },
} as const;

const FileIcon = ({ fileType, className = "" }: { fileType: string; className?: string }) => {
  const config = FILE_TYPES[fileType.toLowerCase() as keyof typeof FILE_TYPES];
  const IconComponent = config?.icon || File;
  const colorClass = config?.color || "text-gray-400";

  return <IconComponent size={20} className={`${colorClass} ${className}`} />;
};

const PasswordModal = ({ open, onClose, onSubmit, loading, error, isRequired = false }: {
  open: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  loading: boolean;
  error: string | null;
  isRequired?: boolean;
}) => {
  const [password, setPassword] = useState('');
  useEffect(() => { if (!open) setPassword(''); }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Secure Access Required</h2>
          <p className="text-gray-600 mb-4">
            {isRequired 
              ? "Enter your master password to access your files"
              : "Enter your password to preview this file"
            }
          </p>
        </div>
        <input
          type="password"
          className="w-full border rounded-lg px-4 py-3 mb-4 text-center text-lg"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
          autoFocus
          placeholder="Enter your password"
        />
        {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}
        <div className="flex gap-3">
          {!isRequired && (
            <button 
              className="flex-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors" 
              onClick={onClose} 
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button 
            className={`px-4 py-2 rounded-lg text-white transition-colors ${
              loading || !password 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={() => onSubmit(password)} 
            disabled={loading || !password}
          >
            {loading ? 'Verifying...' : 'Access Files'}
          </button>
        </div>
        {isRequired && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> You must enter the correct password to access your files. 
              If you&apos;ve forgotten your password, please contact support.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const FilePreviewModal = ({ open, onClose, file, handleDownload }: {
  open: boolean;
  onClose: () => void;
  file: MyFile | null;
  handleDownload: (file: MyFile) => void;
}) => {
  if (!open || !file) return null;

  // Get file extension from name for better detection
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
  const fileType = file.file_type.toLowerCase();
  
  // Check if it's an image (both by file_type and extension)
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(fileType) || 
                  ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(fileExtension);
  const isVideo = ['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(fileType) || 
                  ['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(fileExtension);
  const isAudio = ['mp3', 'wav', 'aac', 'ogg', 'flac'].includes(fileType) || 
                  ['mp3', 'wav', 'aac', 'ogg', 'flac'].includes(fileExtension);
  const isPdf = fileType === 'pdf' || fileExtension === 'pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileIcon fileType={file.file_type} />
            {file.name}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleDownload(file)}
              className="px-3 py-1 rounded bg-blue-600 text-white flex items-center gap-1"
            >
              <Download size={16} />
              Download
            </button>
            <button className="px-3 py-1 rounded bg-gray-100" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
        
        <div className="overflow-auto max-h-[70vh]">
          {isImage && (
            <div className="flex justify-center">
              <img 
                src={file.url} 
                alt={file.name} 
                className="max-w-full max-h-[70vh] object-contain rounded shadow-lg" 
                onError={(e) => {
                  console.error('Image failed to load:', file.url);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          {isVideo && (
            <div className="flex justify-center">
              <video controls className="max-w-full max-h-[70vh] rounded shadow-lg">
                <source src={file.url} type={`video/${fileType}`} />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
          {isAudio && (
            <div className="flex justify-center">
              <audio controls className="w-full max-w-md">
                <source src={file.url} type={`audio/${fileType}`} />
                Your browser does not support the audio tag.
              </audio>
            </div>
          )}
          {isPdf && (
            <iframe
              src={file.url}
              className="w-full h-[70vh] border rounded"
              title={file.name}
            />
          )}
          {!isImage && !isVideo && !isAudio && !isPdf && (
            <div className="text-center py-8">
              <FileIcon fileType={file.file_type} className="w-16 h-16 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Preview not available for this file type</p>
              <button
                onClick={() => handleDownload(file)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Download to view
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MyFilesUI = () => {
  const [files, setFiles] = useState<MyFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<MyFile | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(true);
  const [passwordModalLoading, setPasswordModalLoading] = useState(false);
  const [passwordModalError, setPasswordModalError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user?.id) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }
        const userId = userData.user.id;
        const { data, error: fetchError } = await supabase
          .from('myfiles')
          .select('files')
          .eq('user_id', userId);
        if (fetchError) {
          setError(fetchError.message);
          setLoading(false);
          return;
        }
        if (!data || data.length === 0) {
          setFiles([]);
          setLoading(false);
          return;
        }
        setFiles(data[0]?.files || []);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch files');
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  const handleFileClick = (file: MyFile) => {
    setPendingFile(file);
  };

  const handlePasswordModalSubmit = async (password: string) => {
    setPasswordModalLoading(true);
    setPasswordModalError(null);
    try {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user?.id) {
        setPasswordModalError('User not authenticated');
        setPasswordModalLoading(false);
        return;
      }
      const userId = userData.user.id;
      // Fetch hashed password from password table
      const { data: pwRow, error: pwError } = await supabase
        .from('password')
        .select('password')
        .eq('user_id', userId)
        .single();
      if (pwError || !pwRow?.password) {
        setPasswordModalError('No password set for this user.');
        setPasswordModalLoading(false);
        return;
      }
      // Compare password
      const match = bcrypt.compareSync(password, pwRow.password);
      if (!match) {
        setPasswordModalError('Incorrect password. Access denied.');
        setPasswordModalLoading(false);
        return;
      }
      setIsAuthenticated(true);
      setPasswordModalLoading(false);
      setPasswordModalOpen(false);
    } catch (err: any) {
      setPasswordModalError(err.message || 'Failed to check password');
      setPasswordModalLoading(false);
    }
  };

  const handlePasswordModalClose = () => {
    setPasswordModalOpen(false);
  };

  const getFileTypeLabel = (fileType: string) => {
    const config = FILE_TYPES[fileType.toLowerCase() as keyof typeof FILE_TYPES];
    return config?.label || fileType.toUpperCase();
  };

  // Download handler for real download (Cloudinary official way, robust for all asset types)
  const handleDownload = (file: MyFile) => {
    // Insert fl_attachment/ after /upload/ (with trailing slash)
    const url = file.url.replace(/(\/upload\/)/, '$1fl_attachment/');
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Grid view component
  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {files.map((file) => (
        <div
          key={file.url + file.uploaded_at}
          className="bg-white rounded-xl shadow p-4 cursor-pointer hover:shadow-lg transition group"
          onClick={() => handleFileClick(file)}
        >
          <div className="flex items-center gap-3 mb-3">
            <FileIcon fileType={file.file_type} className="flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900 truncate">{file.name}</div>
              <div className="text-sm text-gray-500">{getFileTypeLabel(file.file_type)}</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              {new Date(file.uploaded_at).toLocaleDateString()}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(file);
                }}
                className="p-1 hover:bg-gray-100 rounded"
                title="Download"
              >
                <Download size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Table view component
  const TableView = () => (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {files.map((file) => (
            <tr key={file.url + file.uploaded_at} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <FileIcon fileType={file.file_type} className="mr-3" />
                  <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{file.name}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-500">{getFileTypeLabel(file.file_type)}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-500">{new Date(file.uploaded_at).toLocaleString()}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFileClick(file)}
                    className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                  >
                    <Eye size={14} />
                    Preview
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(file);
                    }}
                    className="text-green-600 hover:text-green-900 flex items-center gap-1"
                  >
                    <Download size={14} />
                    Download
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your files...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <PasswordModal
        open={passwordModalOpen && !isAuthenticated}
        onClose={handlePasswordModalClose}
        onSubmit={handlePasswordModalSubmit}
        loading={passwordModalLoading}
        error={passwordModalError}
        isRequired={true}
      />
      <FilePreviewModal
        open={!!pendingFile}
        onClose={() => setPendingFile(null)}
        file={pendingFile}
        handleDownload={handleDownload}
      />
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Files</h1>
          {!loading && !error && files.length > 0 && (
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Grid view"
              >
                <Grid3X3 size={20} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Table view"
              >
                <List size={20} />
              </button>
            </div>
          )}
        </div>
        {!loading && !error && files.length === 0 && (
          <div className="text-center mt-8">
            <div className="bg-white rounded-xl shadow p-8 max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No files added yet</h3>
              <p className="text-gray-500">Upload your first file to get started.</p>
            </div>
          </div>
        )}
        {!loading && !error && files.length > 0 && (
          <>
            {viewMode === 'grid' ? <GridView /> : <TableView />}
          </>
        )}
      </div>
    </div>
  );
};

export default MyFilesUI;