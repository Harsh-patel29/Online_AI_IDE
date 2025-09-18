import React from "react";
import {
  deleteProjectById,
  duplicateProjectById,
  editProjectById,
  getAllPlayGroundForUser,
} from "@/modules/dashboard/actions";
import AddNewButton from "@/modules/dashboard/components/AddNewButton";
// import AddRepo from "@/modules/dashboard/components/AddRepo";
import EmptyState from "@/modules/dashboard/components/empty-state";
import ProjectTable from "@/modules/dashboard/components/ProjectTable";

const Page = async () => {
  const playgrounds = await getAllPlayGroundForUser();
  return (
    <div className="flex flex-col justify-start items-center min-h-screen mx-auto max-w-7xl px-4 py-10">
      <div className="grid  gap-6 w-full">
        <AddNewButton />
      </div>
      <div className="mt-10 flex flex-col justify-center items-center w-full">
        {playgrounds && playgrounds.length === 0 ? (
          <EmptyState />
        ) : (
          <ProjectTable
            projects={playgrounds ?? []}
            onDeleteProject={deleteProjectById}
            onUpdateProject={editProjectById}
            onDuplicateProject={duplicateProjectById}
          />
        )}
      </div>
    </div>
  );
};

export default Page;
