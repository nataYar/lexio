import React from 'react'
import WordPopup from '../WordPopup'

const SidePanel = () => {
  return (
    <div className='bg-gray-700 text-white fixed z-10 h-screen hidden lg:block w-[250px] p-7'>
      
        <div className='w-full'>
            <WordPopup />
        </div>
    </div>
  )
}

export default SidePanel