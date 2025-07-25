import { useState } from "react";
import { Button } from "react-bootstrap";
import { ArrowUp, Maximize2 , X, Plus } from "lucide-react";

type FloatingActionsProps = {
  toggleCardWidth: () => void;
};

const FloatingActions = ({ toggleCardLayout }: FloatingActionsProps) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setExpanded(false);
  };

  const handleToggleWidth = () => {
    toggleCardLayout();
    setExpanded(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end space-y-2">
      {expanded && (
        <>
          <Button
            variant="outline-primary"
            onClick={scrollToTop}
            className="shadow"
          >
            <ArrowUp className="me-2" size={18} />
            Top
          </Button>
          <Button
            variant="outline-success"
            onClick={handleToggleWidth}
            className="shadow"
          >
           
            <Maximize2 />
            Toggle Width
          </Button>
        </>
      )}

      <Button
        variant="dark"
        onClick={() => setExpanded((prev) => !prev)}
        className="rounded-circle p-3 shadow"
      >
        {expanded ? <X size={20} /> : <Plus size={20} />}
      </Button>
    </div>
  );
}

export default FloatingActions;
