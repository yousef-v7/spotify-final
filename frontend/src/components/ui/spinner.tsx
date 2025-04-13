import { Loader2 } from "lucide-react";

const Spinner = ({ size = 20 }: { size?: number }) => {
  return (
    <Loader2
      className="animate-spin text-muted-foreground"
      style={{ width: size, height: size }}
    />
  );
};

export default Spinner;
