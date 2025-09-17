"use server";

import { db } from "@/lib/db";
import { TemplateFolder } from "../lib/path-to-json";
import { currentUser } from "@/modules/auth/actions";

export const getPlaygroundById = async (id: string) => {
  try {
    const playground = await db.playGround.findUnique({
      where: { id },
      select: {
        title: true,
        TemplateFiles: {
          select: {
            content: true,
          },
        },
      },
    });
    return playground;
  } catch (error) {
    console.log(error);
  }
};

export const SaveUpdatedCode = async (
  playgroundId: string,
  data: TemplateFolder
) => {
  const user = await currentUser();
  if (!user) return null;
  try {
    const updatedPlayground = await db.templateFile.upsert({
      where: { playgroundId },
      update: {
        content: JSON.stringify(data),
      },
      create: {
        playgroundId,
        content: JSON.stringify(data),
      },
    });
    return updatedPlayground;
  } catch (error) {
    console.log("Failed to save data", error);
    return null;
  }
};

export const checkAndUseApi = async () => {
  const LoggedInuser = await currentUser();
  const user = await db.user.findUnique({
    where: { id: LoggedInuser?.id },
  });
  if (!user) throw new Error("User not found");
  const now = new Date();

  if (!user.firstCallAt) {
    await db.user.update({
      where: { id: LoggedInuser?.id },
      data: {
        apiCalls: 1,
        firstCallAt: now,
      },
    });
    return { success: true, message: "API call allowed (first call)" };
  }

  const diff = now.getTime() - new Date(user.firstCallAt).getTime();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  if (diff > twentyFourHours) {
    await db.user.update({
      where: { id: LoggedInuser?.id },
      data: {
        apiCalls: 1,
        firstCallAt: now,
      },
    });
    return { success: true, message: "API call allowed (new 24h window)" };
  }

  if (user.apiCalls >= 2) {
    return { success: false, message: "API call reached 2 out of 2 in  24h" };
  }

  await db.user.update({
    where: { id: LoggedInuser?.id },
    data: {
      apiCalls: { increment: 1 },
    },
  });
  return { success: true, message: "API call allowed" };
};
