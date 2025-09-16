"use client";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { TemplateFileTree } from "@/modules/playground/components/playground-explorer";
import { useFileExplorer } from "@/modules/playground/hooks/use-File-explorer";
import { usePlayground } from "@/modules/playground/hooks/use-playground";
import { TemplateFile } from "@/modules/playground/lib/path-to-json";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";

const PlayGroundPage = () => {
  const { id } = useParams<{ id: string }>();
  const { playgroundData, templateData } = usePlayground(id);
  const {
    activeFileId,
    closeAllFiles,
    openFile,
    openFiles,
    closeFile,
    setActiveFileId,
    setEditorContent,
    setOpenFiles,
    setPlaygroundId,
    setTemplateData,
  } = useFileExplorer();

  useEffect(() => {
    setPlaygroundId(id);
  }, [id, setPlaygroundId]);

  useEffect(() => {
    if (templateData && !openFiles.length) {
      setTemplateData(templateData);
    }
  }, [templateData, setTemplateData, openFiles.length]);

  const activeFile = openFiles.find((file) => file.id === activeFileId);
  const hasUnsavedChanges = openFiles.some((file) => file.hasUnSavedChanges);
  const handleFileSelect = (file: TemplateFile): void => {
    openFile(file);
  };

  const wrappedHandleAddFile = () => {};
  const wrappedHandleAddFolder = () => {};
  const wrappedHandleDeleteFile = () => {};
  const wrappedHandleDeleteFolder = () => {};
  const wrappedHandleRenameFile = () => {};
  const wrappedHandleRenameFolder = () => {};

  return (
    <TooltipProvider>
      <>
        <TemplateFileTree
          data={templateData}
          onFileSelect={handleFileSelect}
          selectedFile={activeFile}
          title="File Explorer"
          onAddFile={wrappedHandleAddFile}
          onAddFolder={wrappedHandleAddFolder}
          onDeleteFile={wrappedHandleDeleteFile}
          onDeleteFolder={wrappedHandleDeleteFolder}
          onRenamneFile={wrappedHandleRenameFile}
          onRenameFolder={wrappedHandleRenameFolder}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4"></Separator>
          </header>
          <div className="flex flex-1 items-center gap-2">
            <div className="flex flex-col flex-1">
              <h1 className="text-sm font-medium">
                {playgroundData?.title || "Code Playground"}
              </h1>
            </div>
          </div>
        </SidebarInset>
      </>
    </TooltipProvider>
  );
};

export default PlayGroundPage;
