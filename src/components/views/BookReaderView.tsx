import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import {
  BookOpen,
  Upload,
  Search,
  Bot,
  Send,
  Loader2,
  FileCode,
  CheckCircle2,
  FolderOpen,
  Sparkles,
  HardDrive,
  PlusCircle,
  FileText,
  Wand2,
  Cpu,
  ArrowRight,
  X,
  Check,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BookDocument, BookChapterFile } from '../../types';
import {
  callNvidiaChat,
  DEFAULT_NVIDIA_MODEL,
  identifyAndRenamePdfChapterWithNim,
  identifyChapterFromFileNameWithNim,
  NCERT_CODEBOOK_MAP,
  NimChapterIdentificationResult,
  NVIDIA_MODELS,
} from '../../lib/nvidiaApi';
import { savePdfToStorage, loadPdfFromStorage } from '../../lib/pdfStorage';
import { PdfViewer } from '../common/PdfViewer';

export const BookReaderView: React.FC = () => {
  const {
    books,
    subjects,
    addBook,
    updateBook,
    deleteBook,
    deleteBooksByClass,
    deleteChapterFromBook,
    restoreDefaultBooks,
    updateNvidiaConfig,
    user,
    setActiveView,
  } = useApp();

  // Hidden File & Folder Picker Refs
  const folderInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);

  // Class Filter & Search
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>(user.classGrade || 'Class 9');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Book & Chapter File
  const [selectedBook, setSelectedBook] = useState<BookDocument | null>(() => {
    return books.find(b => b.classGrade === (user.classGrade || 'Class 9')) || books[0] || null;
  });
  const [selectedChapterFile, setSelectedChapterFile] = useState<BookChapterFile | null>(() => {
    const first = books.find(b => b.classGrade === (user.classGrade || 'Class 9')) || books[0];
    return first?.chapterFiles?.[0] || null;
  });

  // Reader Maximize & AI Drawer state
  const [isMaximizedReader, setIsMaximizedReader] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(true);

  // Live PDF Page Text Tracking for AI Tutor
  const [activePageText, setActivePageText] = useState<string>('');
  const [activePageNum, setActivePageNum] = useState<number>(1);
  const [activeTotalPages, setActiveTotalPages] = useState<number>(1);

  const handlePageTextExtracted = (text: string, pageNum: number, totalPages: number) => {
    setActivePageText(text);
    setActivePageNum(pageNum);
    setActiveTotalPages(totalPages);
  };

  // Manual Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadClassGrade, setUploadClassGrade] = useState(user.classGrade || 'Class 9');
  const [uploadSubjectId, setUploadSubjectId] = useState(subjects[0]?.id || 'sub-maths');
  const [uploadBookTitle, setUploadBookTitle] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Feedback Notification Banner
  const [folderLoadStatus, setFolderLoadStatus] = useState<string | null>(null);

  // NIM AI Sequential Chapter Processor State
  const [isNimModalOpen, setIsNimModalOpen] = useState(false);
  const [isNimProcessing, setIsNimProcessing] = useState(false);
  const [nimProgress, setNimProgress] = useState<{
    current: number;
    total: number;
    currentFileName: string;
    currentIdentifiedName: string;
  }>({
    current: 0,
    total: 0,
    currentFileName: '',
    currentIdentifiedName: '',
  });
  const [nimProcessedList, setNimProcessedList] = useState<{
    original: string;
    identified: string;
    chapterNumber: number;
    subject: string;
    summary: string;
  }[]>([]);
  const isCancelledNimRef = useRef<boolean>(false);

  // AI Textbook Assistant Chat state
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: `Hello ${user.name || 'Student'}! I am your NVIDIA NIM AI Textbook Study Tutor. Select any chapter from your ${selectedClassFilter} NCERT books or load a folder from your phone, and ask me to explain concepts, solve exercises, or derive formulas!`,
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Filter books by Class Grade and Search Query
  const filteredBooks = books.filter(b => {
    const matchesClass =
      selectedClassFilter === 'all'
        ? true
        : b.classGrade === 'Device Storage' || (b.classGrade || 'Class 9') === selectedClassFilter;
    const matchesSearch = searchQuery.trim()
      ? b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.subjectName?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesClass && matchesSearch;
  });

  const handleSelectBook = (book: BookDocument) => {
    setSelectedBook(book);
    setSelectedChapterFile(book.chapterFiles?.[0] || null);
  };

  // Trigger Device Folder Picker
  const triggerFolderPicker = () => {
    if (folderInputRef.current) {
      folderInputRef.current.value = '';
      folderInputRef.current.click();
    }
  };

  // Trigger Multi-File PDF Picker
  const triggerMultiFilePicker = () => {
    if (filesInputRef.current) {
      filesInputRef.current.value = '';
      filesInputRef.current.click();
    }
  };

  // Handle Folder Selection from Device Storage / SD card
  const handleFolderSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const allFiles = Array.from(fileList);
    const pdfFiles = allFiles.filter(f => f.name.toLowerCase().endsWith('.pdf'));

    if (pdfFiles.length === 0) {
      setFolderLoadStatus('⚠️ No PDF files found in the selected folder.');
      setTimeout(() => setFolderLoadStatus(null), 4000);
      return;
    }

    const firstRelPath = (pdfFiles[0] as any).webkitRelativePath || '';
    const folderName = firstRelPath ? firstRelPath.split('/')[0] : 'Device Folder';

    setFolderLoadStatus(`⏳ Saving ${pdfFiles.length} chapter(s) permanently into offline app storage...`);

    pdfFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    const bookId = `book-folder-${Date.now()}`;
    const chapterFiles: BookChapterFile[] = [];

    for (let index = 0; index < pdfFiles.length; index++) {
      const file = pdfFiles[index];
      const storageKey = `pdf-${bookId}-ch${index + 1}`;
      let persistentUri = '';
      try {
        persistentUri = await savePdfToStorage(storageKey, file);
      } catch (err) {
        console.warn('IndexedDB save fallback to blob for ch:', err);
        persistentUri = URL.createObjectURL(file);
      }

      const baseCode = file.name.toLowerCase().replace(/\.pdf$/i, '').trim();
      const codeMatch = NCERT_CODEBOOK_MAP[baseCode];

      let name = codeMatch ? codeMatch.chapterTitle : '';
      let chapterNumber = codeMatch ? codeMatch.chapterNumber : index + 1;

      if (!name) {
        const cleanName = file.name
          .replace(/\.pdf$/i, '')
          .replace(/^[_\-.\s]+/, '')
          .replace(/[_\-]+/g, ' ');
        name = cleanName ? `Ch ${index + 1}: ${cleanName}` : `Ch ${index + 1}`;
      }

      chapterFiles.push({
        name,
        pdfPath: persistentUri,
        chapterNumber,
      });
    }

    const newBook: Omit<BookDocument, 'id' | 'uploadedAt'> = {
      title: `📁 ${folderName}`,
      classGrade: selectedClassFilter === 'all' ? (user.classGrade || 'Class 9') : selectedClassFilter,
      subjectId: 'sub-custom-folder',
      subjectName: 'Device Storage (Permanent)',
      fileName: folderName,
      fileUrl: chapterFiles[0].pdfPath,
      fileSize: `${pdfFiles.length} PDF Chapters (Saved Permanently)`,
      chapterFiles,
    };

    const createdBook: BookDocument = {
      ...newBook,
      id: bookId,
      uploadedAt: new Date().toISOString(),
    };

    addBook(newBook);
    setSelectedBook(createdBook);
    setSelectedChapterFile(chapterFiles[0]);

    setFolderLoadStatus(`✓ Successfully saved ${pdfFiles.length} chapters permanently into your app!`);
    setTimeout(() => setFolderLoadStatus(null), 5000);
  };

  // Handle Multi-File Selection
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const pdfFiles = Array.from(fileList).filter(f => f.name.toLowerCase().endsWith('.pdf'));
    if (pdfFiles.length === 0) return;

    setFolderLoadStatus(`⏳ Saving ${pdfFiles.length} PDF(s) permanently into offline app storage...`);

    pdfFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    const bookId = `book-files-${Date.now()}`;
    const chapterFiles: BookChapterFile[] = [];

    for (let index = 0; index < pdfFiles.length; index++) {
      const file = pdfFiles[index];
      const storageKey = `pdf-${bookId}-ch${index + 1}`;
      let persistentUri = '';
      try {
        persistentUri = await savePdfToStorage(storageKey, file);
      } catch (err) {
        console.warn('IndexedDB save fallback to blob for file:', err);
        persistentUri = URL.createObjectURL(file);
      }

      const baseCode = file.name.toLowerCase().replace(/\.pdf$/i, '').trim();
      const codeMatch = NCERT_CODEBOOK_MAP[baseCode];

      let name = codeMatch ? codeMatch.chapterTitle : '';
      let chapterNumber = codeMatch ? codeMatch.chapterNumber : index + 1;

      if (!name) {
        const cleanName = file.name.replace(/\.pdf$/i, '').replace(/[_\-]+/g, ' ');
        name = cleanName ? `Ch ${index + 1}: ${cleanName}` : `Ch ${index + 1}`;
      }

      chapterFiles.push({
        name,
        pdfPath: persistentUri,
        chapterNumber,
      });
    }

    const title = pdfFiles.length === 1 ? pdfFiles[0].name.replace(/\.pdf$/i, '') : `Selected ${pdfFiles.length} PDFs`;

    const newBook: Omit<BookDocument, 'id' | 'uploadedAt'> = {
      title,
      classGrade: selectedClassFilter === 'all' ? (user.classGrade || 'Class 9') : selectedClassFilter,
      subjectId: 'sub-custom-files',
      subjectName: 'Device Storage (Permanent)',
      fileName: pdfFiles[0].name,
      fileUrl: chapterFiles[0].pdfPath,
      fileSize: `${pdfFiles.length} PDF(s) (Saved Permanently)`,
      chapterFiles,
    };

    const createdBook: BookDocument = {
      ...newBook,
      id: bookId,
      uploadedAt: new Date().toISOString(),
    };

    addBook(newBook);
    setSelectedBook(createdBook);
    setSelectedChapterFile(chapterFiles[0]);

    setFolderLoadStatus(`✓ Saved ${pdfFiles.length} PDF(s) permanently into your app!`);
    setTimeout(() => setFolderLoadStatus(null), 5000);
  };

  // =========================================================================
  // NVIDIA NIM AI FAST CHAPTER RECOGNIZER & RENAMER ENGINE
  // =========================================================================
  const handleStartNimChapterProcessing = async () => {
    if (!selectedBook || !selectedBook.chapterFiles || selectedBook.chapterFiles.length === 0) {
      return;
    }

    setIsNimModalOpen(true);
    setIsNimProcessing(true);
    isCancelledNimRef.current = false;
    setNimProcessedList([]);

    const totalChapters = selectedBook.chapterFiles.length;
    const updatedChapterFiles: BookChapterFile[] = [...selectedBook.chapterFiles];

    for (let i = 0; i < totalChapters; i++) {
      if (isCancelledNimRef.current) break;

      const ch = updatedChapterFiles[i];
      const chLabel = `Ch ${i + 1}`;

      setNimProgress({
        current: i + 1,
        total: totalChapters,
        currentFileName: chLabel,
        currentIdentifiedName: `Reading PDF text & querying NVIDIA NIM AI for ${chLabel}...`,
      });

      let extractedPdfText = '';

      // 1. Extract text from first 2 pages of the PDF file
      try {
        let pdfData: Uint8Array | null = null;
        if (ch.pdfPath.startsWith('idb://')) {
          pdfData = await loadPdfFromStorage(ch.pdfPath);
        } else if (ch.pdfPath.startsWith('blob:') || ch.pdfPath.startsWith('data:')) {
          const res = await fetch(ch.pdfPath);
          const buf = await res.arrayBuffer();
          pdfData = new Uint8Array(buf);
        }

        const doc = await pdfjsLib.getDocument(
          pdfData
            ? {
                data: pdfData,
                cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
                cMapPacked: true,
              }
            : {
                url: ch.pdfPath,
                cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
                cMapPacked: true,
              }
        ).promise;

        const maxP = Math.min(doc.numPages, 2);
        for (let p = 1; p <= maxP; p++) {
          const page = await doc.getPage(p);
          const textContent = await page.getTextContent();
          const pText = textContent.items.map((item: any) => item.str).join(' ');
          extractedPdfText += ` Page ${p}: ${pText}`;
        }
      } catch (err) {
        console.warn(`PDF text extraction error for ${chLabel}:`, err);
      }

      // 2. Identify chapter title and subject from PDF text using NVIDIA NIM AI
      let nimResult: NimChapterIdentificationResult;
      try {
        nimResult = await identifyAndRenamePdfChapterWithNim(
          extractedPdfText,
          chLabel,
          selectedBook.classGrade || selectedClassFilter,
          {
            apiKey: user.nvidiaApiKey,
            model: user.nvidiaModel || DEFAULT_NVIDIA_MODEL,
            baseUrl: user.nvidiaBaseUrl,
          }
        );
      } catch {
        nimResult = {
          chapterNumber: i + 1,
          chapterTitle: `${chLabel}: Chapter Content`,
          subjectName: selectedBook.subjectName || 'Subject',
          summary: 'NCERT Textbook Chapter',
        };
      }

      if (isCancelledNimRef.current) break;

      // 3. Update chapter file
      const updatedChapter: BookChapterFile = {
        ...ch,
        name: nimResult.chapterTitle,
        chapterNumber: nimResult.chapterNumber || i + 1,
      };
      updatedChapterFiles[i] = updatedChapter;

      setNimProgress(prev => ({
        ...prev,
        currentIdentifiedName: nimResult.chapterTitle,
      }));

      setNimProcessedList(prev => [
        ...prev,
        {
          original: chLabel,
          identified: nimResult.chapterTitle,
          chapterNumber: nimResult.chapterNumber || i + 1,
          subject: nimResult.subjectName,
          summary: nimResult.summary,
        },
      ]);
    }

    setIsNimProcessing(false);

    // 3. Persist updated chapters in AppContext
    if (!isCancelledNimRef.current) {
      updateBook(selectedBook.id, { chapterFiles: updatedChapterFiles });
      const updatedBook = { ...selectedBook, chapterFiles: updatedChapterFiles };
      setSelectedBook(updatedBook);
      if (selectedChapterFile) {
        const found = updatedChapterFiles.find(c => c.pdfPath === selectedChapterFile.pdfPath);
        if (found) setSelectedChapterFile(found);
      }
      setFolderLoadStatus(`🎉 All ${totalChapters} chapters successfully recognized and renamed with NVIDIA NIM AI!`);
      setTimeout(() => setFolderLoadStatus(null), 6000);
    }
  };

  const handleManualUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    const bookId = `book-manual-${Date.now()}`;
    const storageKey = `pdf-${bookId}-ch1`;
    let fileUrl = '';
    try {
      fileUrl = await savePdfToStorage(storageKey, uploadFile);
    } catch (err) {
      console.warn('IndexedDB manual upload fallback:', err);
      fileUrl = URL.createObjectURL(uploadFile);
    }

    const sub = subjects.find(s => s.id === uploadSubjectId);
    const title = uploadBookTitle.trim() || uploadFile.name.replace(/\.[^/.]+$/, '');

    const newBook: Omit<BookDocument, 'id' | 'uploadedAt'> = {
      title,
      classGrade: uploadClassGrade,
      subjectId: uploadSubjectId,
      subjectName: sub?.name || `${uploadClassGrade} Subject`,
      fileName: uploadFile.name,
      fileUrl,
      fileSize: `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB (Saved Permanently)`,
      chapterFiles: [
        { name: title, pdfPath: fileUrl, chapterNumber: 1 },
      ],
    };

    const createdBook: BookDocument = {
      ...newBook,
      id: bookId,
      uploadedAt: new Date().toISOString(),
    };

    addBook(newBook);
    setSelectedBook(createdBook);
    setSelectedChapterFile(createdBook.chapterFiles?.[0] || null);
    setIsUploadModalOpen(false);
    setUploadFile(null);
    setUploadBookTitle('');
  };

  const handleAskAi = async (customPrompt?: string) => {
    const query = customPrompt || inputQuery;
    if (!query.trim() || isLoadingAi) return;

    const userMsg = { role: 'user' as const, text: query };
    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInputQuery('');
    setIsLoadingAi(true);

    try {
      const subject = subjects.find(s => s.id === selectedBook?.subjectId);
      const activeChapterName = selectedChapterFile?.name || selectedBook?.title || `${selectedClassFilter} Curriculum`;

      const systemPrompt = `You are an expert CBSE Class ${selectedClassFilter} NCERT Study Tutor.
Your mission is to deliver 100% accurate, deeply structured, clear, and step-by-step textbook solutions directly for the student.

CONTEXT:
• Subject: ${subject?.name || selectedBook?.subjectName || `NCERT ${selectedClassFilter}`}
• Chapter / Book: ${activeChapterName}
• Active Page: Page ${activePageNum || 1} of ${activeTotalPages || 'N/A'}

CURRENT LIVE PDF PAGE CONTENT (EXACT TEXT FROM STUDENT'S VIEW):
"""
${activePageText ? activePageText.slice(0, 3500) : '(Viewing ' + activeChapterName + ')'}
"""

CRITICAL OUTPUT RULES:
- DO NOT output any internal chain of thought, drafts, outlines, meta-commentary, or headers like "Here's a thinking process" or "1. Analyze user input".
- Jump DIRECTLY into the final, well-structured solution for the student.
- Structure answers clearly using Markdown:
  • 📌 **Concept & Definition** (in crystal-clear, intuitive terms)
  • 🔢 **Step-by-Step Working & Solutions** (Given, Formula, Step-by-Step Substitution, Highlighted Final Answer with SI Units)
  • 💡 **Key NCERT Board Exam Points** (high-yield keywords to secure full marks)
  • ⚠️ **Common Student Traps & Pitfalls** (frequent mistakes to avoid)
- Use standard math formatting ($...$ and $$...$$).`;

      const aiResponse = await callNvidiaChat(
        [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.text })),
          { role: 'user', content: query },
        ],
        {
          apiKey: user.nvidiaApiKey,
          model: user.nvidiaModel || DEFAULT_NVIDIA_MODEL,
          baseUrl: user.nvidiaBaseUrl,
          temperature: 0.3,
          maxTokens: 1400,
        }
      );

      setMessages(prev => [...prev, { role: 'assistant', text: aiResponse }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `⚠️ AI Request Failed: ${err instanceof Error ? err.message : 'Please verify your NVIDIA API Key in Settings.'}`,
        },
      ]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleAskAiAboutPage = (pageText: string, pageNum: number) => {
    setIsAiDrawerOpen(true);
    setActivePageText(pageText);
    setActivePageNum(pageNum);
    const prompt = `From Page ${pageNum} of ${selectedChapterFile?.name || selectedBook?.title}:\n"${pageText}"\n\nPlease explain the key concept, formulas, and examination significance of this page in simple terms.`;
    handleAskAi(prompt);
  };

  const rawPdfUrl = selectedChapterFile?.pdfPath || selectedBook?.fileUrl || '';
  const activePdfUrl = rawPdfUrl ? encodeURI(rawPdfUrl) : '';

  const classTabs = [
    { id: 'all', label: 'All Classes' },
    { id: 'Class 7', label: 'Class 7th' },
    { id: 'Class 8', label: 'Class 8th' },
    { id: 'Class 9', label: 'Class 9th' },
    { id: 'Class 10', label: 'Class 10th' },
  ];

  const getBookCoverUrl = (book: BookDocument) => {
    if (book.id === 'book-maths-9') return encodeURI('/book/class 9th/maths9/iemh1dd/iemk1cc.jpg');
    if (book.id === 'book-eng-9') return encodeURI('/book/class 9th/English9/iebe1dd/iebe1cc.png');
    if (book.id === 'book-hin-9') return encodeURI('/book/class 9th/hindi9/ihga1dd/ihga1cc.jpg');
    if (book.id === 'book-sst-9') return encodeURI('/book/class 9th/social science9/iest1dd/iest1cc.jpg');
    return null;
  };

  return (
    <div className="space-y-5 animate-fade-in pb-16">
      {/* Hidden Folder Picker Input */}
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderSelected}
        // @ts-ignore
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
      />

      {/* Hidden Multi-File PDF Picker Input */}
      <input
        type="file"
        ref={filesInputRef}
        onChange={handleFilesSelected}
        accept="application/pdf"
        multiple
        className="hidden"
      />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              NCERT Textbook Library & PDF Reader
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-1 font-mono">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{selectedClassFilter === 'all' ? 'All NCERT' : selectedClassFilter}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Offline NCERT PDF textbooks with NVIDIA NIM AI chapter recognition and tutor
          </p>
        </div>

        {/* Primary Action Buttons: Select Folder, Pick Files & Auto-Name with NIM AI */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* NIM AI Chapter Auto-Rename Button */}
          {selectedBook && selectedBook.chapterFiles && selectedBook.chapterFiles.length > 0 && (
            <button
              type="button"
              onClick={handleStartNimChapterProcessing}
              title="Use NVIDIA NIM AI to inspect all PDF pages one by one and label correct chapter names"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <Cpu className="w-4 h-4 text-emerald-200" />
              <span>Auto-Name with NIM AI</span>
            </button>
          )}

          <button
            type="button"
            onClick={triggerFolderPicker}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Select Folder from Phone</span>
          </button>

          <button
            type="button"
            onClick={triggerMultiFilePicker}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <span>Pick PDF(s)</span>
          </button>
        </div>
      </div>

      {/* Notification Toast for Folder Import */}
      {folderLoadStatus && (
        <div className="p-3.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center gap-2.5 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{folderLoadStatus}</span>
        </div>
      )}

      {/* Class Folder Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
        {classTabs.map(tab => {
          const isActive = selectedClassFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSelectedClassFilter(tab.id);
                const classMatch = books.find(b => tab.id === 'all' || b.classGrade === tab.id);
                if (classMatch) {
                  setSelectedBook(classMatch);
                  setSelectedChapterFile(classMatch.chapterFiles?.[0] || null);
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 border border-indigo-500/40'
                  : 'bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Reader Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Col: Class Bookshelf & Chapter Index (Hidden if reader maximized) */}
        {!isMaximizedReader && (
          <div className="lg:col-span-3 space-y-4">
            {/* Book Shelf */}
            <div className="p-4 rounded-3xl bg-slate-850 border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {selectedClassFilter === 'all' ? 'NCERT Textbooks' : `${selectedClassFilter} Books`}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-indigo-400 font-mono mr-1">
                    {filteredBooks.length} Books
                  </span>
                  {/* Restore Default NCERT Library Button */}
                  <button
                    type="button"
                    onClick={() => {
                      restoreDefaultBooks(selectedClassFilter);
                      setFolderLoadStatus(`✓ Restored default NCERT library for ${selectedClassFilter}!`);
                      setTimeout(() => setFolderLoadStatus(null), 4000);
                    }}
                    title="Restore standard NCERT textbooks"
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-indigo-300 border border-slate-700 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  {/* Delete All Books in Current Class Filter */}
                  {filteredBooks.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = selectedClassFilter === 'all' ? 'ALL classes' : selectedClassFilter;
                        if (window.confirm(`Are you sure you want to delete ALL ${filteredBooks.length} books & PDFs for ${target}?`)) {
                          deleteBooksByClass(selectedClassFilter);
                          setSelectedBook(null);
                          setSelectedChapterFile(null);
                          setFolderLoadStatus(`🗑️ Deleted all books and PDFs for ${target}`);
                          setTimeout(() => setFolderLoadStatus(null), 4000);
                        }
                      }}
                      title={`Delete all ${selectedClassFilter} books & PDFs`}
                      className="p-1 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400 border border-red-500/30 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Select Folder Callout Card */}
              <div
                onClick={triggerFolderPicker}
                className="p-3 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 hover:border-indigo-400/60 cursor-pointer transition-all flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform flex-shrink-0">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white group-hover:text-indigo-300 truncate">
                    Open Folder on Phone
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">Select any directory of NCERT PDFs</div>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter subjects & books..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Books List Cards */}
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {filteredBooks.length === 0 ? (
                  <div className="text-center py-6 px-3 bg-slate-900/60 rounded-2xl border border-dashed border-slate-800">
                    <p className="text-xs text-slate-400 font-medium">No books found in this class.</p>
                    <button
                      type="button"
                      onClick={() => restoreDefaultBooks(selectedClassFilter)}
                      className="mt-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                    >
                      Restore Default NCERT Books
                    </button>
                  </div>
                ) : (
                  filteredBooks.map(book => {
                    const isSelected = selectedBook?.id === book.id;
                    const coverUrl = getBookCoverUrl(book);

                    return (
                      <div
                        key={book.id}
                        onClick={() => handleSelectBook(book)}
                        className={`w-full p-2.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer group ${
                          isSelected
                            ? 'bg-gradient-to-r from-indigo-950/80 to-slate-850 border-indigo-500 shadow-md ring-1 ring-indigo-500/40'
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-750 hover:bg-slate-850'
                        }`}
                      >
                        <div className="w-10 h-12 rounded-xl bg-indigo-950/50 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 overflow-hidden shadow">
                          {coverUrl ? (
                            <img
                              src={coverUrl}
                              alt={book.title}
                              className="w-full h-full object-cover"
                              onError={e => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <BookOpen className="w-5 h-5 text-indigo-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider truncate">
                            {book.subjectName}
                          </div>
                          <div className={`text-xs font-bold truncate mt-0.5 ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                            {book.title}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>{book.chapterFiles?.length || 1} PDFs</span>
                            <span>•</span>
                            <span>{book.fileSize || 'NCERT'}</span>
                          </div>
                        </div>

                        {/* Delete Single Book Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete "${book.title}" from your library?`)) {
                              deleteBook(book.id);
                              if (selectedBook?.id === book.id) {
                                const remaining = filteredBooks.filter(b => b.id !== book.id);
                                setSelectedBook(remaining[0] || null);
                                setSelectedChapterFile(remaining[0]?.chapterFiles?.[0] || null);
                              }
                            }
                          }}
                          title="Delete this book & all its PDFs"
                          className="p-1.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/20 opacity-70 group-hover:opacity-100 cursor-pointer flex-shrink-0 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chapter Index for Selected Book */}
            {selectedBook && selectedBook.chapterFiles && (
              <div className="p-4 rounded-3xl bg-slate-850 border border-slate-800 space-y-2.5 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider truncate block">
                      {selectedBook.title}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-mono">
                      {selectedBook.chapterFiles.length} Chapters
                    </span>
                  </div>

                  {/* Auto Name Chapter Button */}
                  <button
                    type="button"
                    onClick={handleStartNimChapterProcessing}
                    title="Run NVIDIA NIM AI to identify chapter names"
                    className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 flex items-center gap-1 text-[10px] font-bold cursor-pointer flex-shrink-0"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>NIM Auto-Name</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-72 overflow-y-auto custom-scrollbar">
                  {selectedBook.chapterFiles.map((ch, idx) => {
                    const isChapterActive = selectedChapterFile?.pdfPath === ch.pdfPath;

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedChapterFile(ch)}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between group cursor-pointer ${
                          isChapterActive
                            ? 'bg-gradient-to-r from-indigo-600/30 to-cyan-600/20 border-indigo-500 text-white font-bold shadow'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2 flex-1 min-w-0">
                          <FileCode className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                          <span className="truncate">{ch.name}</span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {isChapterActive && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          {/* Delete Chapter PDF Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete chapter "${ch.name}"?`)) {
                                deleteChapterFromBook(selectedBook.id, idx);
                                if (selectedChapterFile?.pdfPath === ch.pdfPath) {
                                  const remaining = selectedBook.chapterFiles?.filter((_, i) => i !== idx) || [];
                                  setSelectedChapterFile(remaining[0] || null);
                                }
                              }
                            }}
                            title="Delete this chapter PDF"
                            className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/20 opacity-60 group-hover:opacity-100 cursor-pointer transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Center: Canvas-Based PDF Viewer */}
        <div
          className={`${
            isMaximizedReader
              ? 'lg:col-span-12'
              : isAiDrawerOpen
              ? 'lg:col-span-5'
              : 'lg:col-span-9'
          } p-5 rounded-3xl bg-slate-850 border border-slate-800 shadow-xl flex flex-col justify-between transition-all duration-300 min-h-[640px] space-y-4`}
        >
          <div className="space-y-3">
            {/* Header with Title & Controls */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">
                  NCERT Interactive Reader • {selectedBook?.classGrade || selectedClassFilter}
                </span>
                <h3 className="text-sm font-bold text-white truncate">
                  {selectedChapterFile?.name || selectedBook?.title || 'Select a Chapter'}
                </h3>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartNimChapterProcessing}
                  title="Run NVIDIA NIM AI to recognize and name all chapters in this book"
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:text-white flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">NIM Auto-Name</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAiDrawerOpen(prev => !prev)}
                  title={isAiDrawerOpen ? 'Minimize AI Tutor' : 'Open AI Tutor'}
                  className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                    isAiDrawerOpen
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  <span className="hidden sm:inline">AI Tutor</span>
                </button>
              </div>
            </div>

            {/* Offline Canvas PDF Viewer */}
            {activePdfUrl ? (
              <PdfViewer
                pdfUrl={activePdfUrl}
                title={selectedChapterFile?.name || selectedBook?.title}
                isMaximized={isMaximizedReader}
                onToggleMaximize={() => setIsMaximizedReader(prev => !prev)}
                onAskAiAboutPage={handleAskAiAboutPage}
                onPageTextExtracted={handlePageTextExtracted}
                onPickDeviceFolder={triggerFolderPicker}
                className={isMaximizedReader ? 'min-h-[750px]' : 'min-h-[540px]'}
              />
            ) : (
              <div className="w-full h-[520px] bg-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <FolderOpen className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">Select a Book or Folder on Your Phone</h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Select any folder containing your NCERT PDF textbook chapters from your phone or choose a subject from the left panel.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={triggerFolderPicker}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Choose Folder from Phone</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick AI Prompts Bar */}
          <div className="pt-3 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            <button
              type="button"
              onClick={() => handleAskAi(`From Page ${activePageNum} of ${selectedChapterFile?.name || 'this chapter'}, explain the key concepts, formulas, and definitions in detail with step-by-step points.`)}
              className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold whitespace-nowrap cursor-pointer"
            >
              💡 Explain Page {activePageNum}
            </button>
            <button
              type="button"
              onClick={() => handleAskAi(`Solve all exercises, numerical problems, and questions present on Page ${activePageNum} of ${selectedChapterFile?.name || 'this chapter'} with complete step-by-step CBSE marking solutions.`)}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold whitespace-nowrap cursor-pointer"
            >
              📝 Solve Page {activePageNum}
            </button>
            <button
              type="button"
              onClick={() => handleAskAi(`Summarize the core concepts, theorems, and definitions from ${selectedChapterFile?.name || 'this chapter'} for ${selectedClassFilter} revision.`)}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold whitespace-nowrap cursor-pointer"
            >
              ✨ Summarize Chapter
            </button>
            <button
              type="button"
              onClick={() => handleAskAi(`What are the top 3 most common student mistakes in ${selectedChapterFile?.name || 'this chapter'} during school examinations?`)}
              className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[11px] font-semibold whitespace-nowrap cursor-pointer"
            >
              ⚠️ Common Mistakes
            </button>
          </div>
        </div>

        {/* Right Col: NVIDIA AI Textbook Tutor (Side-by-side) */}
        {isAiDrawerOpen && !isMaximizedReader && (
          <div className="lg:col-span-4 p-5 rounded-3xl bg-slate-850 border border-slate-800 shadow-xl flex flex-col justify-between min-h-[640px]">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-xs font-extrabold text-white">AI Tutor</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Live Page {activePageNum}/{activeTotalPages || 1}
                      </span>
                    </div>
                    {/* Model Switcher Dropdown */}
                    <select
                      value={user.nvidiaModel || DEFAULT_NVIDIA_MODEL}
                      onChange={e => updateNvidiaConfig(user.nvidiaApiKey || '', e.target.value, user.nvidiaBaseUrl)}
                      className="bg-slate-900 border border-slate-750 text-[10px] text-indigo-300 font-mono font-bold rounded-lg px-1.5 py-0.5 mt-0.5 focus:outline-none focus:border-indigo-500 cursor-pointer max-w-[200px] truncate"
                    >
                      {NVIDIA_MODELS.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {!user.nvidiaApiKey && (
                  <button
                    type="button"
                    onClick={() => setActiveView('settings')}
                    className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-lg border border-amber-500/30 hover:underline cursor-pointer flex-shrink-0"
                  >
                    Set Key
                  </button>
                )}
              </div>

              {/* Chat Messages */}
              <div className="space-y-3 h-[410px] overflow-y-auto custom-scrollbar pr-1">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-indigo-600/30 border border-indigo-500/40 text-white ml-6'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 mr-2 shadow'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase mb-1 text-slate-400">
                      {m.role === 'user' ? (
                        <span className="text-indigo-300">You ({user.name || 'Student'})</span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          <span>NVIDIA NIM AI Tutor (Reading PDF)</span>
                        </span>
                      )}
                    </div>
                    <div className="whitespace-pre-wrap">{m.text}</div>
                  </div>
                ))}

                {isLoadingAi && (
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs text-indigo-300">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>NVIDIA NIM AI is analyzing Page {activePageNum} and reasoning...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Live Page Prompt Chips & Input Form */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                <button
                  type="button"
                  onClick={() => handleAskAi(`Explain everything on Page ${activePageNum} in simple, easy-to-understand terms with bullet points.`)}
                  className="px-2 py-0.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold whitespace-nowrap cursor-pointer"
                >
                  💡 Explain Page {activePageNum}
                </button>
                <button
                  type="button"
                  onClick={() => handleAskAi(`Solve all numerical problems and exercise questions on Page ${activePageNum} with step-by-step working.`)}
                  className="px-2 py-0.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold whitespace-nowrap cursor-pointer"
                >
                  📝 Solve Page {activePageNum}
                </button>
                <button
                  type="button"
                  onClick={() => handleAskAi(`Give me 3 quiz questions based on Page ${activePageNum} to test my understanding.`)}
                  className="px-2 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[10px] font-semibold whitespace-nowrap cursor-pointer"
                >
                  ❓ Quiz on Page {activePageNum}
                </button>
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleAskAi();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={`Ask AI about Page ${activePageNum} or ${selectedChapterFile?.name || 'this chapter'}...`}
                  value={inputQuery}
                  onChange={e => setInputQuery(e.target.value)}
                  disabled={isLoadingAi}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isLoadingAi}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-md cursor-pointer transition-all active:scale-95 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* NVIDIA NIM AI CHAPTER PROCESSOR & AUTO-NAMER MODAL */}
      {/* ========================================================================= */}
      {isNimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-navy-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-scale-in text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">NVIDIA NIM AI Chapter Recognizer</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{user.nvidiaModel || DEFAULT_NVIDIA_MODEL}</p>
                </div>
              </div>
              {!isNimProcessing && (
                <button
                  type="button"
                  onClick={() => setIsNimModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Active Processing State */}
            {isNimProcessing ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl bg-slate-850 border border-slate-750 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-300">
                      Processing Chapter {nimProgress.current} of {nimProgress.total}
                    </span>
                    <span className="font-mono font-bold text-slate-400">
                      {Math.round((nimProgress.current / (nimProgress.total || 1)) * 100)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-emerald-500 to-cyan-400 transition-all duration-300 rounded-full"
                      style={{
                        width: `${(nimProgress.current / (nimProgress.total || 1)) * 100}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-300 truncate pt-1">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400 flex-shrink-0" />
                    <span className="truncate font-mono">{nimProgress.currentFileName}</span>
                  </div>
                  <div className="text-[11px] text-emerald-300 font-semibold truncate pl-6">
                    ➔ {nimProgress.currentIdentifiedName}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400">
                    Inspecting PDF vector layout & chapter headings...
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      isCancelledNimRef.current = true;
                      setIsNimProcessing(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-rose-300 hover:bg-slate-750 text-xs font-bold border border-slate-700 cursor-pointer"
                  >
                    Stop AI
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>
                    NVIDIA NIM successfully identified and renamed all <strong>{nimProcessedList.length}</strong> chapters in this book!
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                  {nimProcessedList.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-850 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-white">{item.identified}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {item.subject}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <span className="line-through">{item.original}</span>
                        <ArrowRight className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300 font-semibold">{item.identified}</span>
                      </div>
                      {item.summary && (
                        <p className="text-[10px] text-slate-400 italic">"{item.summary}"</p>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsNimModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer transition-all"
                >
                  Done & Continue Reading
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-850 border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Add Custom Book / PDF</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Target Class Grade
                </label>
                <select
                  value={uploadClassGrade}
                  onChange={e => setUploadClassGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Class 7">Class 7th</option>
                  <option value="Class 8">Class 8th</option>
                  <option value="Class 9">Class 9th</option>
                  <option value="Class 10">Class 10th</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Subject
                </label>
                <select
                  value={uploadSubjectId}
                  onChange={e => setUploadSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Book / Chapter Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. NCERT Exemplar Chapter 6"
                  value={uploadBookTitle}
                  onChange={e => setUploadBookTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Select PDF File
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={e => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Add to Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
