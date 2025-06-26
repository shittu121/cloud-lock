import { WarpBackground } from "@/components/ui/warp-background";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import AiButton from "./generate-button";
import { ShieldClose } from "lucide-react";

type Props = {
  onClose: () => void;
};

export function SuccessComponent({ onClose }: Props) {
  return (
    <WarpBackground>
      <Card className="w-80">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-red-400 transition-colors"
      >
        <ShieldClose size={24} />
      </button>
        <CardContent className="flex flex-col gap-2 p-8 border border-white/10">
          <CardTitle>Video Uploaded Successfully!</CardTitle>
          <CardDescription>
          Your skill showcase video is now live. You&apos;ve taken a powerful step toward standing out — employers can now see your talent in action before the first interview. Keep building your career with confidence!
          </CardDescription>
        </CardContent>
        <AiButton />
      </Card>
    </WarpBackground>
  );
}
