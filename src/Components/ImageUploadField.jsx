import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Upload, Loader2 } from 'lucide-react';
import { uploadFile } from '../lib/uploadFile';

const ImageUploadField = ({ label, value, onChange, folder }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = await uploadFile(file, folder, 'images');
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>}
      <div className="flex items-center gap-3">
        <div className="shrink-0 w-14 h-14 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
          {value ? (
            <img src={value} alt={label || 'preview'} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 text-[9px]">None</div>
          )}
        </div>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Image URL"
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-red-600"
        />
        <label className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all">
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          Upload
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
      </div>
      {error && <p className="text-[10px] text-red-600 italic">{error}</p>}
    </div>
  );
};

ImageUploadField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  folder: PropTypes.string.isRequired,
};

export default ImageUploadField;
