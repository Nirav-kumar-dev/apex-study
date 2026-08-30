import React, { useState } from 'react';
import {
  BookOpen,
  Upload,
  Search,
  ExternalLink,
  Bot,
  Send,
  Loader2,
  Bookmark,
  Layers,
  ChevronRight,
  FileCode,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  FolderOpen,
  Plus,
  PanelRightClose,
  PanelRightOpen,
  GraduationCap,
  Sparkles,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BookDocument, BookChapterFile } from '../../types';
import { callNvidiaChat, DEFAULT_NVIDIA_MODEL } from '../../lib/nvidiaApi';

export const BookReaderView: React.FC = () => {
  const { books, subjects, addBook, user, setActiveView } = useApp();

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

  // PDF Viewer Controls: Zoom & Maximize Reader
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isMaximizedReader, setIsMaximizedReader] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(true);

  // Manual Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadClassGrade, setUploadClassGrade] = useState(user.classGrade || 'Class 9');
  const [uploadSubjectId, setUploadSubjectId] = useState(subjects[0]?.id || 'sub-maths');
  const [uploadBookTitle, setUploadBookTitle] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // AI Textbook Assistant Chat state
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: `Hello ${user.name}! I am your NVIDIA AI Textbook Study Tutor. Select any chapter from your ${selectedClassFilter} NCERT books and ask me to explain concepts, derive formulas, or generate practice questions!`,
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Filter books by Class Grade and Search Query
  const filteredBooks = books.filter(b => {
    const matchesClass =
      selectedClassFilter === 'all' ? true : (b.classGrade || 'Class 9') === selectedClassFilter;
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

  const handleManualUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    const fileUrl = URL.createObjectURL(uploadFile);
    const sub = subjects.find(s => s.id === uploadSubjectId);
    const title = uploadBookTitle.trim() || uploadFile.name.replace(/\.[^/.]+$/, '');

    const newBook: Omit<BookDocument, 'id' | 'uploadedAt'> = {
      title,
      classGrade: uploadClassGrade,
      subjectId: uploadSubjectId,
      subjectName: sub?.name || `${uploadClassGrade} Subject`,
      fileName: uploadFile.name,
      fileUrl,
      fileSize: `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`,
      chapterFiles: [
        { name: title, pdfPath: fileUrl, chapterNumber: 1 },
      ],
    };

    addBook(newBook);
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

      const systemPrompt = `You are a dedicated AI study tutor for CBSE ${selectedClassFilter} students preparing for examinations.
Current Subject: ${subject?.name || selectedBook?.subjectName || `NCERT ${selectedClassFilter}`}
Current Chapter / Topic: ${activeChapterName}
Context: The student is reading this exact chapter from their NCERT textbook PDF.
Provide clear, step-by-step mathematical derivations, scientific explanations, or exam questions aligned with the CBSE curriculum. Use markdown equations and bullet points.`;

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
          maxTokens: 1200,
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

  const rawPdfUrl = selectedChapterFile?.pdfPath || selectedBook?.fileUrl || '';
  const activePdfUrl = rawPdfUrl ? encodeURI(rawPdfUrl) : '';

  const classTabs = [
    { id: 'all', label: 'All Classes' },
    { id: 'Class 7', label: 'Class 7th' },
    { id: 'Class 8', label: 'Class 8th' },
    { id: 'Class 9', label: 'Class 9th' },
    { id: 'Class 10', label: 'Class 10th' },
  ];

  // Helper to resolve cover image for Class 9 NCERT books
  const getBookCoverUrl = (book: BookDocument) => {
    if (book.id === 'book-maths-9') return encodeURI('/book/class 9th/maths9/iemh1dd/iemk1cc.jpg');
    if (book.id === 'book-eng-9') return encodeURI('/book/class 9th/English9/iebe1dd/iebe1cc.png');
    if (book.id === 'book-hin-9') return encodeURI('/book/class 9th/hindi9/ihga1dd/ihga1cc.jpg');
    if (book.id === 'book-sst-9') return encodeURI('/book/class 9th/social science9/iest1dd/iest1cc.jpg');
    return null;
  };

  return (
    <div className="space-y-5 animate-fade-in pb-16">
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
            Offline NCERT PDF textbooks loaded directly from your <code className="text-indigo-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">book/</code> folder
          </p>
        </div>

        {/* Upload Custom PDF Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Add PDF to Library</span>
          </button>
        </div>
      </div>

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
                <span className="text-xs font-extrabold text-indigo-400 font-mono">
                  {filteredBooks.length} Books
                </span>
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
                {filteredBooks.map(book => {
                  const isSelected = selectedBook?.id === book.id;
                  const coverUrl = getBookCoverUrl(book);

                  return (
                    <button
                      key={book.id}
                      type="button"
                      onClick={() => handleSelectBook(book)}
                      className={`w-full p-2.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer group ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-950/80 to-slate-850 border-indigo-500 shadow-md ring-1 ring-indigo-500/40'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-750 hover:bg-slate-850'
                      }`}
                    >
                      {/* Thumbnail Cover or Icon */}
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
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chapter Index for Selected Book */}
            {selectedBook && selectedBook.chapterFiles && (
              <div className="p-4 rounded-3xl bg-slate-850 border border-slate-800 space-y-2.5 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider truncate pr-2">
                    {selectedBook.title}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-400 font-mono flex-shrink-0">
                    {selectedBook.chapterFiles.length} Chapters
                  </span>
                </div>

                <div className="space-y-1.5 max-h-72 overflow-y-auto custom-scrollbar">
                  {selectedBook.chapterFiles.map((ch, idx) => {
                    const isChapterActive = selectedChapterFile?.pdfPath === ch.pdfPath;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedChapterFile(ch)}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between group cursor-pointer ${
                          isChapterActive
                            ? 'bg-gradient-to-r from-indigo-600/30 to-cyan-600/20 border-indigo-500 text-white font-bold shadow'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <FileCode className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                          <span className="truncate">{ch.name}</span>
                        </div>
                        {isChapterActive && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Center: BIG ZOOMABLE PDF Canvas */}
        <div
          className={`${
            isMaximizedReader
              ? 'lg:col-span-12'
              : isAiDrawerOpen
              ? 'lg:col-span-5'
              : 'lg:col-span-9'
          } p-5 rounded-3xl bg-slate-850 border border-slate-800 shadow-xl flex flex-col justify-between transition-all duration-300 min-h-[640px]`}
        >
          <div className="space-y-3">
            {/* Header with Title & Zoom Toolbar */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">
                  NCERT Interactive Reader • {selectedBook?.classGrade || selectedClassFilter}
                </span>
                <h3 className="text-sm font-bold text-white truncate">
                  {selectedChapterFile?.name || selectedBook?.title || 'Select a Chapter'}
                </h3>
              </div>

              {/* Toolbar Controls */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Zoom Controls */}
                <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-0.5">
                  <button
                    type="button"
                    onClick={() => setZoomLevel(prev => Math.max(50, prev - 25))}
                    title="Zoom Out"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-[11px] font-mono font-bold text-indigo-300 select-none">
                    {zoomLevel}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(prev => Math.min(250, prev + 25))}
                    title="Zoom In"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(100)}
                    title="Reset Zoom (100%)"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border-l border-slate-800 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>

                {/* Maximize Reader Toggle */}
                <button
                  type="button"
                  onClick={() => setIsMaximizedReader(prev => !prev)}
                  title={isMaximizedReader ? 'Exit Full Reader Mode' : 'Expand Full Reader Mode'}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {isMaximizedReader ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* AI Tutor Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsAiDrawerOpen(prev => !prev)}
                  title={isAiDrawerOpen ? 'Minimize AI Tutor' : 'Open AI Tutor'}
                  className={`p-2 rounded-xl border transition-all flex items-center gap-1 text-xs font-bold cursor-pointer ${
                    isAiDrawerOpen
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  <span className="hidden sm:inline">AI Tutor</span>
                </button>

                {/* External Tab Link */}
                {activePdfUrl && (
                  <a
                    href={activePdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    title="Open PDF in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Embedded Zoomable PDF Viewer */}
            {activePdfUrl ? (
              <div
                className={`w-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col items-center justify-center relative shadow-inner ${
                  isMaximizedReader ? 'h-[750px]' : 'h-[520px]'
                }`}
              >
                <div
                  style={{
                    width: `${zoomLevel}%`,
                    height: `${zoomLevel}%`,
                    minWidth: '100%',
                    minHeight: '100%',
                    transition: 'all 0.15s ease-out',
                  }}
                  className="w-full h-full"
                >
                  <object
                    data={`${activePdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                    type="application/pdf"
                    className="w-full h-full rounded-2xl"
                  >
                    <iframe
                      src={`${activePdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                      className="w-full h-full rounded-2xl"
                      title={selectedChapterFile?.name || 'Textbook PDF'}
                    >
                      <div className="p-6 text-center text-slate-400 space-y-3">
                        <BookOpen className="w-10 h-10 mx-auto text-indigo-400" />
                        <p className="text-xs">Your browser is displaying this PDF chapter:</p>
                        <a
                          href={activePdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-md"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Chapter PDF</span>
                        </a>
                      </div>
                    </iframe>
                  </object>
                </div>
              </div>
            ) : (
              <div className="w-full h-[520px] bg-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <BookOpen className="w-12 h-12 text-indigo-400" />
                <h4 className="font-bold text-sm text-white">No Chapter Selected</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Select a chapter on the left to read its official NCERT PDF directly from your book folder.
                </p>
              </div>
            )}
          </div>

          {/* Quick AI Prompts Bar */}
          <div className="pt-3 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            <button
              type="button"
              onClick={() => handleAskAi(`Summarize the core concepts, theorems, and definitions from ${selectedChapterFile?.name || 'this chapter'} for ${selectedClassFilter} revision.`)}
              className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold whitespace-nowrap cursor-pointer"
            >
              ✨ Summarize Chapter
            </button>
            <button
              type="button"
              onClick={() => handleAskAi(`Generate 4 high-yield numerical or conceptual practice problems from ${selectedChapterFile?.name || 'this chapter'} with step-by-step CBSE marking solutions.`)}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold whitespace-nowrap cursor-pointer"
            >
              📐 4 Practice Numericals
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
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white flex items-center justify-center shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-white">NVIDIA AI Textbook Tutor</h3>
                    <p className="text-[10px] text-slate-400 font-mono">{user.nvidiaModel || DEFAULT_NVIDIA_MODEL}</p>
                  </div>
                </div>

                {!user.nvidiaApiKey && (
                  <button
                    type="button"
                    onClick={() => setActiveView('settings')}
                    className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-lg border border-amber-500/30 hover:underline cursor-pointer"
                  >
                    Set Key
                  </button>
                )}
              </div>

              {/* Chat Messages */}
              <div className="space-y-3 h-[440px] overflow-y-auto custom-scrollbar pr-1">
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
                          <span>NVIDIA AI Tutor</span>
                        </span>
                      )}
                    </div>
                    <div className="whitespace-pre-wrap">{m.text}</div>
                  </div>
                ))}

                {isLoadingAi && (
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs text-indigo-300">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>NVIDIA AI is reasoning over the chapter...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Input Form */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleAskAi();
              }}
              className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={`Ask AI about ${selectedChapterFile?.name || 'this chapter'}...`}
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
        )}
      </div>

      {/* Manual Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-850 border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Add PDF to Class Library</span>
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
