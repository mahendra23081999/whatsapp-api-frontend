"use client";

import { Button } from "@/src/elements/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/elements/ui/dialog";
import { Input } from "@/src/elements/ui/input";
import { useCreateAttachmentMutation } from "@/src/redux/api/mediaApi";
import { MediaUploadModalPropsData } from "@/src/types/media";
import { CloudUpload, Loader2, X, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface FileItem {
  file: File;
  previewUrl: string;
}

const MediaUploadModal: React.FC<MediaUploadModalPropsData> = ({ isOpen, onClose, onUploadSuccess }) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [createAttachment, { isLoading }] = useCreateAttachmentMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFilesToList = (fileList: FileList) => {
    const newFiles: FileItem[] = Array.from(fileList).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToList(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToList(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      const removed = updated.splice(index, 1)[0];
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return updated;
    });
  };

  const handleClearAll = () => {
    files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      const formData = new FormData();
      files.forEach(({ file }) => {
        formData.append("attachments", file);
      });
      await createAttachment(formData).unwrap();
      toast.success(t("file_upload_success"));
      handleClearAll();
      onClose();
      if (onUploadSuccess) onUploadSuccess();
    } catch (error: any) {
      const errorMessage = error?.data?.message || t("file_upload_failed");
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    return () => {
      files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md dark:bg-(--card-color)">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{t("upload_files")}</DialogTitle>
          <Button
            onClick={() => {
              onClose();
              handleClearAll();
            }}
            className="p-1 hover:bg-gray-100 bg-gray-50 dark:bg-transparent dark:hover:bg-(--table-hover) rounded-lg transition-colors absolute right-4 top-4 rtl:right-auto rtl:left-4"
          >
            <X size={20} className="dark:text-amber-50 text-slate-500" />
          </Button>
        </DialogHeader>

        <p className="text-sm text-gray-500 mb-4">{t("upload_files_desc")}</p>

        {files.length === 0 ? (
          <div
            className="border border-dashed border-gray-300 dark:border-(--card-border-color) dark:hover:bg-(--table-hover) rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="bg-(--light-primary) dark:bg-(--dark-body) text-primary overflow-hidden w-20 h-20 rounded-lg mb-4 flex items-center justify-center">
              <CloudUpload size={48} className="text-primary" />
            </div>

            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{t("drag_and_drop")}</h3>
            <p className="text-xs text-gray-400 text-center mt-1">{t("max_size_note")}</p>
            <p className="text-sm text-gray-500 my-2">{t("or_separator")}</p>
            <p className="text-sm text-gray-600 font-medium text-center dark:text-gray-400">{t("click_to_browse")}</p>

            <Input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.zip,.json,.rar,.7z"
              multiple
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {files.map((fileObj, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border border-gray-200 dark:border-(--card-border-color) rounded-lg p-2 bg-gray-50 dark:bg-(--table-hover)"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded overflow-hidden shrink-0 flex items-center justify-center relative">
                      {fileObj.previewUrl && fileObj.file.type.startsWith("image/") ? (
                        <Image
                          src={fileObj.previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          width={100}
                          height={100}
                          unoptimized
                        />
                      ) : (
                        <div className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">
                          {fileObj.file.name.split(".").pop()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium line-clamp-1 break-all whitespace-normal dark:text-gray-200">
                        {fileObj.file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleRemoveFile(index)}
                    className="bg-transparent! text-gray-400! hover:text-red-500! p-2 h-auto"
                  >
                    <X size={18} />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2 border-t pt-3 dark:border-(--card-border-color)">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 text-xs font-bold dark:border-(--card-border-color) dark:text-gray-300"
                >
                  <Plus size={14} />
                  Add More
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 size={14} />
                  Clear All
                </Button>
              </div>
              <Input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.zip,.json,.rar,.7z"
                multiple
              />
              <span className="text-xs text-gray-500 font-medium">
                {files.length} {files.length === 1 ? "file" : "files"} selected
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button className="bg-primary text-white w-full h-10 font-bold" onClick={handleUpload} disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t("uploading")}</span>
                  </div>
                ) : (
                  `${t("upload_files")} (${files.length})`
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MediaUploadModal;
