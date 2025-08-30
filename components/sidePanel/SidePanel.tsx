import React from 'react'
import WordPopup from './WordPopup'
import ViewedArticles from './ViewedArticles'

const SidePanel = () => {
  return (
    <div className='bg-gray-700 text-white fixed z-10 h-screen hidden lg:block top-0 w-[250px] p-2 overflow-y-scroll z-50'>
      <>
        <ViewedArticles />
      </>
        <div className='w-full mt-4'>
            <WordPopup />
        </div>
    </div>
  )
}

export default SidePanel