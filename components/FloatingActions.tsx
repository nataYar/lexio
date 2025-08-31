"use client"
import { useState } from "react";
import { Button } from "react-bootstrap";
import { ChevronUp } from 'lucide-react';

const FloatingActions = () => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
     </div> 
  );
}

export default FloatingActions;
