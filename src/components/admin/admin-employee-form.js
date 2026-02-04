'use client';

import { useState } from 'react';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseDb, firebaseStorage } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function normalizeEmployeeId(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return '';
  return trimmed.toUpperCase().startsWith('MBC-') ? trimmed : `MBC-${trimmed}`;
}

function stripMbcPrefix(raw) {
  const trimmed = String(raw || '').trim();
  return trimmed.toUpperCase().startsWith('MBC-') ? trimmed.slice(4) : trimmed;
}

export default function AdminEmployeeForm() {
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [position, setPosition] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f && !['image/jpeg', 'image/png'].includes(f.type)) {
      setError('Only JPG and PNG images are allowed.');
      setFile(null);
      setPreviewUrl('');
      return;
    }
    setError('');
    setFile(f || null);
    setPreviewUrl(f ? URL.createObjectURL(f) : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const normalizedEmployeeId = normalizeEmployeeId(employeeId);
    if (!name.trim() || !normalizedEmployeeId || !employmentType.trim()) {
      setError('Name, Employee ID, and Employment Type are required.');
      return;
    }

    setLoading(true);
    try {
      let photoURL = '';
      let photoPath = '';

      if (file) {
        const ext =
          file.type === 'image/png'
            ? 'png'
            : file.type === 'image/jpeg'
              ? 'jpg'
              : 'jpg';
        const storagePath = `employeeProfiles/${normalizedEmployeeId}.${ext}`;
        const storageRef = ref(firebaseStorage, storagePath);
        await uploadBytes(storageRef, file);
        photoURL = await getDownloadURL(storageRef);
        photoPath = storagePath;
      }

      const teachersCol = collection(firebaseDb, 'teachers');
      const empDoc = doc(teachersCol, normalizedEmployeeId);

      await setDoc(empDoc, {
        name: name.trim(),
        schoolId: normalizedEmployeeId,
        // Employees are always saved with role "employee"
        role: 'employee',
        position: position.trim() || null,
        employmentType: employmentType.trim(),
        photoURL,
        photoPath,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setMessage('Employee saved successfully.');
      setName('');
      setEmployeeId('');
      setEmploymentType('');
      setPosition('');
      setFile(null);
      setPreviewUrl('');
    } catch (err) {
      console.error('Failed to save employee', err);
      setError('Failed to save employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-700">
          Add Employee
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-4 items-start"
        >
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Employee ID</label>
              <div className="flex items-center">
                <span className="px-3 py-2 border border-r-0 border-slate-300 rounded-l-md text-sm bg-slate-50 text-slate-700 font-mono select-none">
                  MBC-
                </span>
                <input
                  type="text"
                  value={stripMbcPrefix(employeeId)}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-r-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent font-mono"
                  placeholder="e.g. 0001"
                />
              </div>
              <p className="text-[11px] text-slate-500">Saved as {normalizeEmployeeId(stripMbcPrefix(employeeId) || '...')}</p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Employment Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white"
              >
                <option value="">Select employment type</option>
                <option value="JOB ORDER - Office">JOB ORDER - Office</option>
                <option value="JOB ORDER - Field">JOB ORDER - Field</option>
                <option value="PERMANENT">PERMANENT</option>
                <option value="CASUAL">CASUAL</option>
                <option value="CONTRACT OF SERVICE (COS) - Full Time">
                  CONTRACT OF SERVICE (COS) - Full Time
                </option>
                <option value="CONTRACT OF SERVICE (COS) - Part Time">
                  CONTRACT OF SERVICE (COS) - Part Time
                </option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Position (optional)</label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                placeholder="e.g. Clerk, Staff, Officer"
              />
            </div>

            <Button
              type="submit"
              className="mt-1 bg-lime-600 hover:bg-lime-700"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Employee'}
            </Button>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
                {error}
              </p>
            )}
            {message && (
              <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded px-3 py-2">
                {message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Profile Image (upload file)</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={handleFileChange}
                className="block w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-lime-50 file:text-lime-700 hover:file:bg-lime-100"
              />
            </div>
            {previewUrl && (
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-slate-500">Preview</span>
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="w-24 h-24 rounded-full object-cover border border-slate-200"
                />
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


