import { useState, useEffect, useCallback } from "react";
import { WebContainer } from "@webcontainer/api";
import { TemplateFolder } from "@/modules/playground/lib/path-to-json";

interface useWebContainerProps {
  templateData: TemplateFolder;
}

interface useWebContainerReturn {
  serverUrl: string | null;
  isLoading: boolean;
  error: string | null;
  instance: WebContainer | null;
  writeFileSync: (path: string, content: string) => Promise<void>;
  destroy: () => void;
}

export const useWebContainer = ({
  templateData,
}: useWebContainerProps): useWebContainerReturn => {
  const [serverUrl, setserverUrl] = useState<string | null>(null);
  const [isLoading, setisLoding] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [instance, setInstance] = useState<WebContainer | null>(null);

  useEffect(() => {
    let mounted = true;
    async function intializeWebContainer() {
      try {
        const webcontainerInstance = await WebContainer.boot();
        if (!mounted) return;
        setInstance(webcontainerInstance);
        setisLoding(false);
      } catch (error) {
        console.error("Failed to initialize WebContainer:", error);
        if (mounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to intialize WebContainer"
          );
          setisLoding(false);
        }
      }
    }
    intializeWebContainer();

    return () => {
      mounted: false;
      if (instance) {
        instance.teardown();
      }
    };
  }, []);

  const writeFileSync = useCallback(
    async (path: string, content: string): Promise<void> => {
      if (!instance) {
        throw new Error("WebContainer instance is not available");
      }
      try {
        const pathParts = path.split("/");
        const folderPath = pathParts.slice(0, -1).join("/");
        console.log("folderPath", folderPath);
        if (folderPath) {
          await instance.fs.mkdir(folderPath, { recursive: true });
        }
        await instance.fs.writeFile(path, content);
      } catch (error) {
        const errorMesage =
          error instanceof Error ? error.message : "Failed to wrtie File";
        console.error(`Failed to wrtie file at ${path}:`, error);
        throw new Error(`Failed to write file at  ${path}: ${errorMesage}`);
      }
    },
    [instance]
  );

  const destroy = useCallback(() => {
    if (instance) {
      instance.teardown();
      setInstance(null);
      setserverUrl(null);
    }
  }, [instance]);

  return {
    serverUrl,
    isLoading,
    error,
    instance,
    writeFileSync,
    destroy,
  };
};
