"use client"
import { useState } from "react";
import { Button } from "react-bootstrap";
import { ArrowUp, Maximize2 , X, Plus } from "lucide-react";
import { ChevronUp } from 'lucide-react';

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
    <div className="fixed bottom-5 right-2 z-50 flex items-center justify-center ">
      {/* {expanded && ( */}
        <>
          <Button
            variant="outline-primary"
            onClick={scrollToTop}
            className=" shadow  rounded-4xl !bg-gray-100"
          >
            <ChevronUp className="" size={20} />
            
          </Button>
          
        </>
      {/* )} */}

      {/* <Button
        variant="dark"
        onClick={() => setExpanded((prev) => !prev)}
        className="rounded-circle p-3 shadow"
      >
        {expanded ? <X size={20} /> : <Plus size={20} />}
      </Button> */}
     </div> 
  );
}

export default FloatingActions;
