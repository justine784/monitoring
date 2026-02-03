'use client';

import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseStorage } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminFreeUpload() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f && !['image/jpeg', 'image/png'].includes(f.type)) {
      setError('Only JPG and PNG images are allowed.');
      setFile(null);
      setPreviewUrl('');
      setDownloadUrl('');
      return;
    }
    setFile(f || null);
    setPreviewUrl(f ? URL.createObjectURL(f) : '');
    setDownloadUrl('');
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please choose an image to upload.');
      return;
    }
    setLoading(true);
    setError('');
    setDownloadUrl('');

    try {
      const filePath = `freeUploads/${Date.now()}_${file.name}`;
      const storageRef = ref(firebaseStorage, filePath);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setDownloadUrl(url);
    } catch (err) {
      console.error('Free upload failed', err);
      setError('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-700">
          Free Image Upload (choose image file)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <input
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            onChange={handleFileChange}
            className="block w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
          />
          {previewUrl && (
            <div className="flex items-center gap-3">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-16 h-16 rounded-md object-cover border border-slate-200"
              />
              <span className="text-xs text-slate-500 truncate max-w-xs">
                {file?.name}
              </span>
            </div>
          )}
        </div>

        <Button
          type="button"
          onClick={handleUpload}
          disabled={loading}
          className="bg-sky-600 hover:bg-sky-700"
        >
          {loading ? 'Uploading...' : 'Upload to Firebase'}
        </Button>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
            {error}
          </p>
        )}

        {downloadUrl && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-700">Download URL</p>
            <textarea
              readOnly
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-slate-50"
              rows={2}
              value={downloadUrl}
            />
            <p className="text-[10px] text-slate-500">
              Copy this URL to display the image anywhere in your app.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


