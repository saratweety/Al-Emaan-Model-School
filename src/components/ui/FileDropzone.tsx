"use client";

import { useState, type ChangeEvent, type ComponentType, type Ref } from "react";
import { CloudUploadIcon, FileTextIcon } from "@/components/icons";

type Preview = { kind: "image"; url: string; name: string } | { kind: "file"; name: string };

function isImagePath(path: string) {
  return /\.(png|jpe?g)$/i.test(path.split("?")[0]);
}

function fileNameFromPath(path: string) {
  const last = path.split("/").pop() ?? path;
  return last.split("?")[0];
}

export default function FileDropzone({
  name,
  label,
  hint = "JPG, PNG or PDF (Max 2MB)",
  accept = "image/png,image/jpeg,application/pdf",
  height = 120,
  round = false,
  icon: Icon = CloudUploadIcon,
  imageCaption,
  inputRef,
  existingUrl,
  existingPath,
  onFileSelected,
}: {
  name?: string;
  label: string;
  hint?: string;
  accept?: string;
  height?: number;
  round?: boolean;
  icon?: ComponentType<{ className?: string }>;
  imageCaption?: string;
  inputRef?: Ref<HTMLInputElement>;
  existingUrl?: string | null;
  existingPath?: string | null;
  onFileSelected?: (file: File) => void;
}) {
  const [preview, setPreview] = useState<Preview | null>(() => {
    if (!existingUrl || !existingPath) return null;
    return isImagePath(existingPath)
      ? { kind: "image", url: existingUrl, name: fileNameFromPath(existingPath) }
      : { kind: "file", name: fileNameFromPath(existingPath) };
  });

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(
      file.type.startsWith("image/") ? { kind: "image", url: URL.createObjectURL(file), name: file.name } : { kind: "file", name: file.name }
    );
    onFileSelected?.(file);
  }

  return (
    <label
      className={`relative flex cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden border-2 border-dashed border-gray-200 bg-[#F4F6F5] px-3 text-center hover:border-[#3AB67D] ${
        round ? "rounded-full" : "rounded-xl"
      }`}
      style={{ height, width: round ? height : undefined }}
    >
      <input ref={inputRef} type="file" name={name} accept={accept} className="hidden" onChange={handleChange} />
      {preview?.kind === "image" ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview.url} alt={preview.name} className="absolute inset-0 h-full w-full object-cover" />
          {!round && (
            <span className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-2 py-1 text-xs font-semibold text-white">
              {imageCaption ?? preview.name}
            </span>
          )}
        </>
      ) : preview?.kind === "file" ? (
        <>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500">
            <FileTextIcon className="h-4 w-4" />
          </span>
          <span className="line-clamp-2 text-xs font-semibold text-gray-700">{preview.name}</span>
          <span className="text-xs text-[#13714C]">Click to change</span>
        </>
      ) : (
        <>
          <Icon className="h-6 w-6 text-gray-400" />
          <span className="text-sm font-semibold text-gray-600">{label}</span>
          <span className="text-xs text-gray-400">{hint}</span>
        </>
      )}
    </label>
  );
}
