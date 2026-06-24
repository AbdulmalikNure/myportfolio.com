import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, Download, FileText, BookOpen, Briefcase } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

// ── Static fallback when no backend is connected ──────────────────────────────
const FALLBACK_DOCS = [
  {
    id: "design_1_cv",
    document_type: "design_1_cv",
    document_name: "Design 1 CV",
    description: "Professional CV Design Version 1",
  },
  {
    id: "design_2_cv",
    document_type: "design_2_cv",
    document_name: "Design 2 CV",
    description: "Professional CV Design Version 2",
  },
  {
    id: "complete_professional_portfolio",
    document_type: "complete_professional_portfolio",
    document_name: "Complete Professional Portfolio",
    description:
      "A single PDF that combines all professional documents — CV, Certificates, Recommendation Letters, Awards, Training Certificates, Academic & Project Documentation.",
  },
];

const TYPE_META: Record<
  string,
  { icon: typeof FileText; gradient: string; reviewLabel: string; downloadLabel: string }
> = {
  design_1_cv: {
    icon: FileText,
    gradient: "from-cyan-500 to-blue-500",
    reviewLabel: "Review My CV",
    downloadLabel: "Download My CV",
  },
  design_2_cv: {
    icon: FileText,
    gradient: "from-purple-500 to-indigo-500",
    reviewLabel: "Review My CV",
    downloadLabel: "Download My CV",
  },
  complete_professional_portfolio: {
    icon: Briefcase,
    gradient: "from-pink-500 to-rose-500",
    reviewLabel: "Review My Portfolio",
    downloadLabel: "Download My Portfolio",
  },
};

interface CVDocument {
  id: string;
  document_type: string;
  document_name: string;
  description?: string;
}

interface CVModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CVModal = ({ isOpen, onClose }: CVModalProps) => {
  const [docs, setDocs] = useState<CVDocument[]>(FALLBACK_DOCS);
  const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (!isOpen) return;
    apiClient
      .getCvDocuments()
      .then((data: CVDocument[]) => {
        if (data && data.length > 0) setDocs(data);
      })
      .catch(() => {
        /* use fallback */
      });
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleView = (doc: CVDocument) => {
    const url = `${BASE}/cv-documents/${doc.id}/view`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownload = (doc: CVDocument) => {
    const url = `${BASE}/cv-documents/${doc.id}/download`;
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cv-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="cv-modal"
            role="dialog"
            aria-modal="true"
            aria-label="My Curriculum Vitae & Professional Documents"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-4xl max-h-[90vh] overflow-y-auto
                         card-glass rounded-3xl shadow-2xl border border-border/60"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 card-glass rounded-t-3xl px-8 pt-8 pb-6 border-b border-border/40">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center glow">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                        My Curriculum Vitae &amp;{" "}
                        <span className="text-gradient">Professional Documents</span>
                      </h2>
                    </div>
                    <p className="text-muted-foreground text-base">
                      Choose a document to review or download.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    aria-label="Close modal"
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/60 hover:bg-secondary
                               flex items-center justify-center text-muted-foreground hover:text-foreground
                               transition-all duration-200 hover:scale-110 mt-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Document cards */}
              <div className="px-8 py-8">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {docs.map((doc, index) => {
                    const meta = TYPE_META[doc.document_type] ?? TYPE_META["design_1_cv"];
                    const Icon = meta.icon;

                    return (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        className="card-glass rounded-2xl p-6 flex flex-col gap-5
                                   hover:scale-[1.02] hover:shadow-[0_0_30px_hsla(190,100%,50%,0.15)]
                                   transition-all duration-300 group"
                      >
                        {/* Icon */}
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.gradient}
                                       flex items-center justify-center glow`}
                        >
                          <Icon className="w-7 h-7 text-white" />
                        </div>

                        {/* Text */}
                        <div className="flex-1 space-y-2">
                          <h3 className="text-lg font-semibold text-foreground leading-tight">
                            {doc.document_name}
                          </h3>
                          {doc.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {doc.description}
                            </p>
                          )}
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col gap-3">
                          {/* Review button */}
                          <button
                            onClick={() => handleView(doc)}
                            className="w-full flex items-center justify-center gap-2
                                       bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/60
                                       text-primary font-medium text-sm py-2.5 px-4 rounded-xl
                                       transition-all duration-200 hover:scale-[1.02]"
                          >
                            <Eye className="w-4 h-4" />
                            {meta.reviewLabel}
                          </button>

                          {/* Download button */}
                          <button
                            onClick={() => handleDownload(doc)}
                            className={`w-full flex items-center justify-center gap-2
                                        bg-gradient-to-r ${meta.gradient} hover:opacity-90
                                        text-white font-semibold text-sm py-2.5 px-4 rounded-xl
                                        transition-all duration-200 hover:scale-[1.02] glow`}
                          >
                            <Download className="w-4 h-4" />
                            {meta.downloadLabel}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 pb-8">
                <p className="text-center text-xs text-muted-foreground">
                  Click <strong className="text-foreground">Review</strong> to open in browser ·{" "}
                  Click <strong className="text-foreground">Download</strong> to save a copy
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
