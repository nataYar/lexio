import React from "react";
import { Square, Columns2, Columns3 } from "lucide-react";
import { Button } from "react-bootstrap";

type NewsLayoutProps = {
  widthIndex: number,
  setWidthIndex: (index: number) => void,
  availableWidths: string[],
};

const NewsLayout = ({
  widthIndex,
  setWidthIndex,
  availableWidths,
}: NewsLayoutProps) => {
  return (
    <div className="hidden md:flex gap-2 items-center justify-center mb-4 w-full ">
      <span className="font-semibold">Layout:</span>
      <Button
        variant={widthIndex === 0 ? "primary" : "outline-primary"}
        onClick={() => setWidthIndex(0)}
        disabled={!availableWidths[0]}
      >
        <Square size={18} />
      </Button>
      {availableWidths.length > 1 && (
        <Button
          variant={widthIndex === 1 ? "primary" : "outline-primary"}
          onClick={() => setWidthIndex(1)}
        >
          <Columns2 size={18} />
        </Button>
      )}
      {availableWidths.length > 2 && (
        <Button
          variant={widthIndex === 2 ? "primary" : "outline-primary"}
          onClick={() => setWidthIndex(2)}
        >
          <Columns3 size={18} />
        </Button>
      )}
    </div>
  );
};

export default NewsLayout;
