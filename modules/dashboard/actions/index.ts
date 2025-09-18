"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";
import { revalidatePath } from "next/cache";
// import { Project, User } from "../types";
import { Templates } from "@prisma/client";

export interface ProjectSummary {
  id: string;
  title: string;
  description: string | null;
  template: Templates;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

interface getAllPlayGroundForUserReturns {
  userId: string;
  id: string;
  title: string;
  template: Templates;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  StarMark: { isMarked: boolean }[];
}
export const toggleStarMarked = async (
  playgroundId: string,
  isChecked: boolean
) => {
  const user = await currentUser();
  const userId = user?.id;
  if (!userId) {
    throw new Error("User Id is required");
  }
  try {
    if (isChecked) {
      await db.starMark.create({
        data: {
          userId: userId!,
          playgroundId,
          isMarked: isChecked,
        },
      });
    } else {
      await db.starMark.delete({
        where: {
          userId_playgroundId: {
            userId,
            playgroundId,
          },
        },
      });
    }
    revalidatePath("/dashboard");
    return { success: true, isMarked: isChecked };
  } catch (error) {
    console.log("Error updating problem: ", error);
    return { success: false, error: "Failed to update problem" };
  }
};

export const getAllPlayGroundForUser = async (): Promise<
  getAllPlayGroundForUserReturns[] | undefined
> => {
  const user = await currentUser();

  try {
    const playground = await db.playGround.findMany({
      where: {
        userId: user?.id,
      },
      include: {
        user: true,
        StarMark: {
          where: {
            userId: user?.id,
          },
          select: {
            isMarked: true,
          },
        },
      },
    });
    return playground;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export const createPlayGround = async (data: {
  title: string;
  template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR";
  description?: string;
}) => {
  const user = await currentUser();
  const { title, description, template } = data;

  try {
    const playground = await db.playGround.create({
      data: {
        title: title,
        description: description,
        template: template,
        userId: user?.id!,
      },
    });
    return playground;
  } catch (error) {
    console.log(error);
  }
};

export const deleteProjectById = async (id: string) => {
  try {
    await db.playGround.delete({
      where: {
        id,
      },
    });
    revalidatePath("/dashboard");
  } catch (error) {
    console.log(error);
  }
};

export const editProjectById = async (
  id: string,
  data: { title?: string; description?: string }
) => {
  try {
    await db.playGround.update({
      where: { id },
      data: data,
    });
    revalidatePath("/dashboard");
  } catch (error) {
    console.log(error);
  }
};

export const duplicateProjectById = async (
  id: string
): Promise<ProjectSummary | undefined> => {
  try {
    const originalPlayground = await db.playGround.findUnique({
      where: { id },
    });

    if (!originalPlayground) {
      throw new Error("Original playground not found");
    }

    const duplicatePlayground = await db.playGround.create({
      data: {
        title: `${originalPlayground.title} (COPY)`,
        description: originalPlayground.description,
        template: originalPlayground.template,
        userId: originalPlayground.userId,
      },
    });
    revalidatePath("/dashboard");
    return duplicatePlayground;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
