import Navbar from "@/components/Navbar";
import { Upload } from "@/components/Upload";

export default function Home() {
  return (
    <div className="">
      <Navbar />
      <div className="mt-20">
      <Upload />
      </div>
    </div>
  );
}
