/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  FolderDown, 
  Upload, 
  Search, 
  X, 
  Download, 
  Trash2, 
  FileText, 
  BookOpen, 
  FileCheck,
  ArrowDownToLine 
} from 'lucide-react';
import { NoteFile, User } from '../types';

interface NotesModuleProps {
  notes: NoteFile[];
  currentUser: User;
  onUploadNote: (data: Omit<NoteFile, 'id' | 'createdAt'>) => Promise<any>;
  onDeleteNote: (id: string) => Promise<boolean>;
}

export default function NotesModule({ 
  notes, 
  currentUser, 
  onUploadNote, 
  onDeleteNote 
}: NotesModuleProps) {

  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');

  // Modal upload controller
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Biology');
  const [className, setClassName] = useState('Class 10');
  const [selectedFile, setSelectedFile] = useState<{ name: string, size: string, dataUrl: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract unique subjects & classes
  const subjects = ['All', ...Array.from(new Set(notes.map(n => n.subject)))];
  const targetClasses = ['All', ...Array.from(new Set(notes.map(n => n.className)))];

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.uploaderName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // If student, auto-filter to only show notes for their class!
    let matchesClass = true;
    if (currentUser.role === 'student' && currentUser.classAllocated) {
      const studentClassOnly = currentUser.classAllocated.split('-')[0]; // e.g. "Class 10"
      matchesClass = note.className === studentClassOnly;
    } else {
      matchesClass = classFilter === 'All' || note.className === classFilter;
    }

    const matchesSubject = subjectFilter === 'All' || note.subject === subjectFilter;

    return matchesSearch && matchesClass && matchesSubject;
  });

  // Drag and drop events logic
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        dataUrl: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !selectedFile) {
      setFormError('Please input Title, Description and Select a slide or document Note file attachment');
      return;
    }

    setIsUploading(true);
    setFormError('');

    try {
      await onUploadNote({
        title,
        description,
        subject,
        className,
        uploadedBy: currentUser.id,
        uploaderName: currentUser.name,
        uploaderRole: currentUser.role,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        contentUrl: selectedFile.dataUrl
      });

      // Clear states
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setIsUploadOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Transmission failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete '${name}' syllabus resource?`)) {
      await onDeleteNote(id);
    }
  };

  const triggerDownloadAction = (note: NoteFile) => {
    // Generate simulated download triggers
    const a = document.createElement('a');
    a.href = note.contentUrl.startsWith('data:') ? note.contentUrl : 'data:text/plain;base64,U2ltdWxhdGVkIGZpbGU=';
    a.download = note.fileName;
    a.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Top search & Filter deck */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search syllabus material repository..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10.5 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-205 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-slate-400 font-bold uppercase">Subject:</span>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="text-xs font-semibold text-slate-655 bg-transparent focus:outline-none cursor-pointer"
            >
              {subjects.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Subjects' : s}</option>
              ))}
            </select>
          </div>

          {currentUser.role !== 'student' && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-205 px-3 py-1.5 rounded-xl">
              <span className="text-xs text-slate-400 font-bold uppercase">Target Class:</span>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="text-xs font-semibold text-slate-655 bg-transparent focus:outline-none cursor-pointer"
              >
                {targetClasses.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Classes' : c}</option>
                ))}
              </select>
            </div>
          )}

          {currentUser.role !== 'student' && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 bg-indigo-650 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 px-4 py-2 rounded-xl text-xs font-bold transition-all transform active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Notes</span>
            </button>
          )}

        </div>
      </div>

      {/* Grid of shared shared document repository cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <div 
              key={note.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden relative"
            >
              {/* Backglow element */}
              <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-indigo-500/5 rounded-full z-0 pointer-events-none group-hover:scale-125 transition-transform"></div>

              <div className="space-y-4 z-10 relative">
                {/* Header info */}
                <div className="flex justify-between items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/70 text-indigo-650 flex items-center justify-center shrink-0">
                    <FileText className="w-5.5 h-5.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-indigo-750 uppercase bg-indigo-50 border border-indigo-150 rounded px-2 py-0.5 inline-block mb-1">
                      {note.subject}
                    </span>
                    <h4 className="font-extrabold text-slate-900 group-hover:text-indigo-650 leading-tight transition-colors truncate">
                      {note.title}
                    </h4>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {note.description}
                </p>

                {/* Sender credentials details */}
                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-450 font-medium space-y-1">
                  <div className="flex justify-between">
                    <span>Uploaded by:</span>
                    <span className="font-semibold text-slate-700">{note.uploaderName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Class Audience:</span>
                    <span className="font-bold text-slate-700">{note.className}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>File size:</span>
                    <span>{note.fileSize} ({note.fileName})</span>
                  </div>
                </div>
              </div>

              {/* Actions row footer */}
              <div className="pt-4 border-t border-slate-100/70 mt-4 flex items-center justify-between z-10 relative">
                <span className="text-[10px] text-slate-400 font-bold font-mono">
                  {new Date(note.createdAt).toLocaleDateString(undefined, { dateStyle: 'short' })}
                </span>

                <div className="flex gap-2">
                  {currentUser.id === note.uploadedBy && (
                    <button
                      onClick={() => handleDelete(note.id, note.title)}
                      className="p-2 border border-rose-100 text-rose-500 bg-rose-50/10 hover:bg-rose-50 rounded-xl transition-all"
                      title="Delete notes resource"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => triggerDownloadAction(note)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-55/70 hover:bg-indigo-650 border border-indigo-150/70 hover:border-indigo-650 text-indigo-700 hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-205 rounded-2xl p-12 text-center text-slate-450 col-span-full">
            <FolderDown className="w-12 h-12 stroke-1 mx-auto mb-3 text-slate-350" />
            <span className="font-semibold block font-sans">No Notes Shared</span>
            <p className="text-xs text-slate-400/80 mt-1">Teachers have not posted any study slides or guidelines files for this class yet</p>
          </div>
        )}
      </div>

      {/* Slide notes upload drawer dialog with full drag-n-drop capabilities */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-xl overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-5 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-650" />
                <span>Upload Course Material Syllabus Notes</span>
              </h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Content inputs for notes sharing */}
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg animate-pulse-none">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Subject Type *</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-1.5 border border-slate-250 rounded-lg text-xs bg-slate-50/50"
                  >
                    <option value="Biology">Biology & LifeSciences</option>
                    <option value="Chemistry">Chemistry Lab Science</option>
                    <option value="Calculus">Mathematics & Calculus</option>
                    <option value="English Literature">English Literature</option>
                    <option value="Creative Writing">Creative Writing & Poetry</option>
                    <option value="World History">World History</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Target Class audience *</label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-3.5 py-1.5 border border-slate-250 rounded-lg text-xs bg-slate-50/50"
                  >
                    <option value="Class 9">Class 9 (Freshman)</option>
                    <option value="Class 10">Class 10 (Sophomore)</option>
                    <option value="Class 11">Class 11 (Junior)</option>
                    <option value="Class 12">Class 12 (Senior)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Notes Document Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unit 4 Cellular Osmosis and Membrane transports"
                  className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-sm bg-slate-50/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Brief Description *</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mention guidelines, page reference numbers, or learning targets..."
                  className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-xs bg-slate-50/50 focus:outline-none"
                />
              </div>

              {/* DRAG AND DROP ZONE */}
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">File Attachment (PDF / Slide PDF / Doc) *</label>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleTriggerFileInput}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 ${
                    isDragging 
                      ? 'border-indigo-600 bg-indigo-50/50 scale-98 shadow-inner' 
                      : (selectedFile ? 'border-emerald-450 bg-emerald-50/5' : 'border-slate-250 bg-slate-50 hover:bg-slate-100')
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                    className="hidden"
                  />

                  {selectedFile ? (
                    <>
                      <FileCheck className="w-8 h-8 text-emerald-500" />
                      <div className="text-xs font-bold text-slate-750">{selectedFile.name}</div>
                      <span className="text-[10px] text-slate-400 font-mono">Attachment lock ready ({selectedFile.size})</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400" />
                      <span className="text-xs font-bold text-indigo-650">Click to locate or Drag & Drop File</span>
                      <p className="text-[10px] text-slate-400">PDF, PowerPoint, Word docs (Up to 10MB limit)</p>
                    </>
                  )}
                </div>
              </div>

              {/* Upload actions footer */}
              <div className="pt-4 border-t border-slate-150 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 border border-slate-250 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="px-6 py-2 bg-indigo-650 hover:bg-indigo-755 font-bold text-xs text-white rounded-lg shadow-md disabled:opacity-50"
                >
                  {isUploading ? 'Dispatching Files...' : 'Publish Material'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
