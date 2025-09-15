import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

import type { TemplateFolder } from "../lib/path-to-json";
import { getPlaygroundById, SaveUpdatedCode } from "../actions";

interface PlaygroundData {
  id: string;
  title?: string;
  [key: string]: any;
}

interface UsePlaygroundReturn {
  playgroundData: PlaygroundData | null;
  templateData: TemplateFolder | null;
  isLoading: boolean;
  error: string | null;
  loadPlayGround: () => Promise<void>;
  saveTemplateData: (data: TemplateFolder) => Promise<void>;
}

export const usePlayground = (id: string): UsePlaygroundReturn => {
  const [playgroundData, setplaygroundData] = useState<PlaygroundData | null>(
    null
  );
  const [templateData, settemplateData] = useState<TemplateFolder | null>(null);

  const [isLoading, setisLoading] = useState<boolean>(true);
  const [error, seterror] = useState<string | null>(null);

  const loadPlayGround = useCallback(async () => {
    if (!id) return;
    try {
      setisLoading(true);
      seterror(null);

      const data = await getPlaygroundById(id);

      //@ts-ignore
      setplaygroundData(data);
      const rawContent = data?.TemplateFiles?.[0]?.content;

      if (typeof rawContent === "string") {
        const parsedContent = JSON.parse(rawContent);
        settemplateData(parsedContent);
        toast.success("PlayGround Loaded Successfully");
        return;
      }

      const res = await fetch(`/api/template/${id}`);
      if (!res.ok) {
        throw new Error(`Failed to load template: ${res.status}`);
      }

      const templateRes = await res.json();

      if (templateRes.templateJson && Array.isArray(templateRes.templateJson)) {
        settemplateData({
          folderName: "Root",
          items: templateRes.templateJson,
        });
      } else {
        settemplateData(
          templateRes.templateJson || {
            folderName: "Root",
            items: [],
          }
        );
      }
      toast.success("Tenplate laoded Successfully");
    } catch (error) {
      console.error("Error loading playground: ", error);
      seterror("Failed to load playground data");
      toast.error("Failed to load template data");
    } finally {
      setisLoading(false);
    }
  }, [id]);
  const saveTemplateData = useCallback(
    async (data: TemplateFolder) => {
      try {
        await SaveUpdatedCode(id, data);
        settemplateData(data);
        toast.success("Change saved successfully");
      } catch (error) {
        console.error("Error saving template data", error);
        toast.error("Failed to save changes");
        throw error;
      }
    },
    [id]
  );

  useEffect(() => {
    loadPlayGround();
  }, [loadPlayGround]);

  return {
    playgroundData,
    templateData,
    isLoading,
    error,
    loadPlayGround,
    saveTemplateData,
  };
};
