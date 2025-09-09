import React from 'react'
import WordPopup from './WordPopup'
import ViewedArticles from './ViewedArticles'

const SidePanel = () => {
  return (
    <div className='bg-gray-700 text-white fixed h-screen hidden lg:block top-0 w-[250px] pt-5 px-2 overflow-y-scroll '>
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