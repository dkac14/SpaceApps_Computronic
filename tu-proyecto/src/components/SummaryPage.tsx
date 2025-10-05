import React from "react";

interface SummaryPageProps {
  summaryData: {
    title: string;
    source: string;
    summary: string;
  };
  onBack: () => void;
}

export default function SummaryPage({ summaryData, onBack }: SummaryPageProps) {
  // Function to format the summary content
  const formatSummaryContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
      .replace(/\*\*Título del artículo:\*\*/g, '<h4 class="font-bold text-lg mt-4">Article Title:</h4>')
      .replace(/\*\*Fuente:\*\*/g, '<h4 class="font-bold text-lg mt-4">Source:</h4>')
      .replace(/\*\*Resumen:\*\*/g, '<h4 class="font-bold text-lg mt-4">Summary:</h4>');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 to-white text-gray-900">
      {/* Header - Same as existing */}
      <header className="w-full bg-white border-b border-black/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-black text-white flex items-center justify-center font-semibold">
              N
            </div>
            <div>
              <div className="text-lg font-bold text-black leading-tight">NASA BioSpace</div>
              <div className="text-xs text-gray-600">Space Biology Portal</div>
            </div>
          </div>

          <button
            onClick={onBack}
            className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-emerald-800 transition"
          >
            ← Back
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <div className="bg-white rounded-xl border border-black/10 shadow-sm p-8">
          {/* Article Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-4 leading-tight">
            {summaryData.title}
          </h1>
          
          {/* Source */}
          <div className="mb-8">
            <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
              Source: {summaryData.source}
            </div>
          </div>

          {/* Summary */}
          <div className="prose prose-lg max-w-none">
            <div 
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: formatSummaryContent(summaryData.summary) 
              }}
            />
          </div>

          {/* Back Button at the Bottom */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-black text-white rounded-md font-medium hover:bg-emerald-800 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Search
            </button>
          </div>
        </div>
      </main>

      {/* Footer - Same as existing */}
      <footer className="mt-auto bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-white text-black rounded-md flex items-center justify-center font-semibold">N</div>
            <div>NASA BioSpace — Space Biology Portal</div>
          </div>
          <div className="text-gray-200 mt-4 md:mt-0">© 2025 — Science with purpose and clarity</div>
        </div>
      </footer>
    </div>
  );
}
