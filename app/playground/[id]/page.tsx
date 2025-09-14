"use client";
import { usePlayground } from "@/modules/playground/hooks/use-playground";
import { useParams } from "next/navigation";
import React from "react";

const PlayGroundPage = () => {
  const { id } = useParams<{ id: string }>();
  const { playgroundData, templateData } = usePlayground(id);

  console.log("playgroundData", playgroundData);
  console.log("templateData", templateData);
  return <div>params:{id}</div>;
};

export default PlayGroundPage;
