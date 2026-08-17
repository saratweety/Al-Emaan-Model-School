"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/lib/toast";
import { getSignedFileUrls, type SignedFile } from "@/app/dashboard/files-actions";
import { FileTextIcon, DownloadIcon } from "@/components/icons";

export default function PersonFilesButton({
  bucket,
  personName,
  files,
}: {
  bucket: "student-files" | "teacher-files";
  personName: string;
  files: { label: string; path: string }[];
}) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signedFiles, setSignedFiles] = useState<SignedFile[]>([]);

  function handleOpen() {
    if (files.length === 0) {
      showToast("No documents uploaded for this record yet.", "info");
      return;
    }
    setOpen(true);
    setLoading(true);
    getSignedFileUrls(bucket, files)
      .then(({ files: fresh, error }) => {
        if (error) showToast(error, "error");
        setSignedFiles(fresh);
      })
      .finally(() => setLoading(false));
  }

  return (
    <>
      <button
        type="button"
        aria-label="View documents"
        onClick={handleOpen}
        className={`rounded-lg border p-1.5 ${
          files.length === 0
            ? "border-gray-100 text-gray-300"
            : "border-gray-200 text-gray-500 hover:bg-gray-50"
        }`}
      >
        <FileTextIcon className="h-4 w-4" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={`${personName} — Documents`}>
        {loading ? (
          <p className="py-4 text-center text-sm text-gray-400">Loading…</p>
        ) : signedFiles.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500">Couldn&apos;t load any documents.</p>
        ) : (
          <ul className="space-y-2">
            {signedFiles.map((f) => (
              <li key={f.label}>
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 px-3.5 py-2.5 text-sm font-semibold text-gray-700 hover:border-[#3AB67D]/40 hover:bg-[#A2E494]/10"
                >
                  <span className="flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4 text-[#13714C]" />
                    {f.label}
                  </span>
                  <DownloadIcon className="h-4 w-4 text-gray-400" />
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-gray-400">Links expire after 5 minutes.</p>
      </Modal>
    </>
  );
}
