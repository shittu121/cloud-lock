/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/client';
import bcrypt from 'bcryptjs';

interface MyFile {
  url: string;
  name: string;
  uploaded_at: string;
}

const PasswordModal = ({ open, onClose, onSubmit, loading, error }: {
  open: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  loading: boolean;
  error: string | null;
}) => {
  const [password, setPassword] = useState('');
  useEffect(() => { if (!open) setPassword(''); }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs">
        <h2 className="text-lg font-semibold mb-2">Enter your password</h2>
        <input
          type="password"
          className="w-full border rounded px-3 py-2 mb-3"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
          autoFocus
        />
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className="flex gap-2 justify-end">
          <button className="px-3 py-1 rounded bg-gray-100" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={() => onSubmit(password)} disabled={loading || !password}>{loading ? 'Checking...' : 'Submit'}</button>
        </div>
      </div>
    </div>
  );
};

const MyFilesUI = () => {
  const [files, setFiles] = useState<MyFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordModalLoading, setPasswordModalLoading] = useState(false);
  const [passwordModalError, setPasswordModalError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<MyFile | null>(null);

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
          .select('files, secured')
          .eq('user_id', userId)
          .single();
        if (fetchError) {
          setError(fetchError.message);
          setLoading(false);
          return;
        }
        setFiles(data?.files || []);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch files');
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  // Password modal logic
  const handleFileClick = (file: MyFile) => {
    setPendingFile(file);
    setPasswordModalError(null);
    setPasswordModalOpen(true);
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
        setPasswordModalError('Incorrect password.');
        setPasswordModalLoading(false);
        return;
      }
      // Fetch current files for the user
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data: myfilesRow, error: myfilesError } = await supabase
        .from('myfiles')
        .select('files')
        .eq('user_id', userId)
        .single();
      const filesArr = myfilesRow?.files || [];
      // Upsert with files and secured
      const { error: upsertError } = await supabase
        .from('myfiles')
        .upsert([{ user_id: userId, files: filesArr, secured: true }], { onConflict: 'user_id' });
      if (upsertError) {
        setPasswordModalError('Failed to update secured status: ' + upsertError.message);
        setPasswordModalLoading(false);
        return;
      }
      setPasswordModalLoading(false);
      setPasswordModalOpen(false);
      if (pendingFile) {
        window.open(pendingFile.url, '_blank');
      }
    } catch (err: any) {
      setPasswordModalError(err.message || 'Failed to check password');
      setPasswordModalLoading(false);
    }
  };

  // Minimal file grid view
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <PasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handlePasswordModalSubmit}
        loading={passwordModalLoading}
        error={passwordModalError}
      />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Files</h1>
        {loading && <div className="text-center mt-8">Loading files...</div>}
        {error && <div className="text-center text-red-500 mt-8">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file) => (
            <div
              key={file.url + file.uploaded_at}
              className="bg-white rounded-xl shadow p-4 cursor-pointer hover:shadow-lg transition"
              onClick={() => handleFileClick(file)}
            >
              <div className="font-medium text-gray-900 truncate mb-1">{file.name}</div>
              <div className="text-sm text-gray-500">Uploaded: {new Date(file.uploaded_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyFilesUI;