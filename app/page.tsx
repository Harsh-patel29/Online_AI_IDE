import Image from "next/image";
import { Button } from "@/components/ui/button";
import UserButton from "@/modules/auth/components/user-button";
export default function Home() {
  return (
    <div className="bg-red-400 flex flex-col h-screen justify-center items-center">
      <Button className="text-2xl">Browser AI Editor</Button>
      <UserButton />
    </div>
  );
}
