"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, CheckCircle, X, Loader2, Shield } from "lucide-react";

const docTypes = [
  { value: "AADHAAR", label: "Aadhaar Card" },
  { value: "BIRTH_CERTIFICATE", label: "Birth Certificate" },
  { value: "SPORTS_CERTIFICATE", label: "Sports Certificate" },
  { value: "MEDICAL_CERTIFICATE", label: "Medical Fitness Certificate" },
  { value: "PHOTO", label: "Passport Photo" },
  { value: "OTHER", label: "Other Document" },
];

interface UploadedFile {
  file: File;
  docType: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export default function DocumentsPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedType, setSelectedType] = useState("SPORTS_CERTIFICATE");

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles = accepted.map((f) => ({
      file: f,
      docType: selectedType,
      status: "pending" as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, [selectedType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png"],
      "application/pdf": [".pdf"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleUpload = async (index: number) => {
    const uf = files[index];
    if (!uf || uf.status !== "pending") return;

    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, status: "uploading" } : f))
    );

    const formData = new FormData();
    formData.append("file", uf.file);
    formData.append("docType", uf.docType);

    try {
      const res = await fetch("/api/documents", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: "done" } : f))
      );
    } catch (e: any) {
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: "error", error: e.message } : f))
      );
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadAll = async () => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === "pending") {
        await handleUpload(i);
      }
    }
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="text-base font-semibold text-primary">Upload Documents</h1>
          <p className="text-xs" style={{ color: "#64748b" }}>Upload your sports certificates, ID proofs, and photos</p>
        </div>
      </div>

      <div className="dashboard-content max-w-3xl">
        {/* Security Notice */}
        <div className="flex items-start gap-3 p-4 rounded-xl mb-6"
          style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
          <Shield className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-400" />
          <div>
            <div className="text-sm font-medium text-primary">Secure Document Storage</div>
            <div className="text-xs mt-1" style={{ color: "#94a3b8" }}>
              All documents are encrypted and accessible only to authorized government officials. 
              Accepted formats: PDF, JPG, PNG (max 5MB per file).
            </div>
          </div>
        </div>

        {/* Document Type Selector */}
        <div className="glass-card p-6 mb-6">
          <label className="form-label mb-3">Document Type</label>
          <div className="grid grid-cols-3 gap-2">
            {docTypes.map((dt) => (
              <button
                key={dt.value}
                type="button"
                onClick={() => setSelectedType(dt.value)}
                className="p-3 rounded-xl text-left text-sm transition-all"
                style={{
                  background: selectedType === dt.value ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selectedType === dt.value ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.07)"}`,
                  color: selectedType === dt.value ? "#60a5fa" : "#64748b",
                }}
              >
                {dt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`upload-zone mb-6 ${isDragActive ? "drag-over" : ""}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-10 h-10 mx-auto mb-4" style={{ color: isDragActive ? "#3b82f6" : "#1e3a8a" }} />
          <h3 className="font-semibold text-primary mb-2">
            {isDragActive ? "Drop files here..." : "Drag & drop files here"}
          </h3>
          <p className="text-sm" style={{ color: "#64748b" }}>or click to browse — PDF, JPG, PNG up to 5MB</p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-primary">Files to Upload ({files.length})</h3>
              <button onClick={uploadAll} className="btn-primary text-sm">
                <Upload className="w-3.5 h-3.5" /> Upload All
              </button>
            </div>

            <div className="space-y-3">
              {files.map((uf, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(59,130,246,0.12)" }}>
                    <File className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-primary text-sm truncate">{uf.file.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                      {docTypes.find((d) => d.value === uf.docType)?.label} ·{" "}
                      {(uf.file.size / 1024).toFixed(0)} KB
                    </div>
                    {uf.error && <div className="text-xs mt-1" style={{ color: "#f87171" }}>{uf.error}</div>}
                  </div>

                  <div className="flex items-center gap-2">
                    {uf.status === "pending" && (
                      <button onClick={() => handleUpload(i)} className="btn-primary text-xs py-1.5">
                        Upload
                      </button>
                    )}
                    {uf.status === "uploading" && (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                    )}
                    {uf.status === "done" && (
                      <CheckCircle className="w-5 h-5 text-emerald-700" />
                    )}
                    {uf.status !== "uploading" && uf.status !== "done" && (
                      <button onClick={() => removeFile(i)} className="p-1 rounded hover:opacity-70 transition-opacity"
                        style={{ color: "#ef4444" }}>
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
