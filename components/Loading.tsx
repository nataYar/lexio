import React from 'react'
import {
  Image,
} from "react-bootstrap";

const Loading = () => {
  return (
    <div className='w-full h-full'>
     <Image
          className="h-14 w-auto mx-auto"
          src="/loading500x500.gif"
          rounded
        />
    </div>
  )
}

export default Loading