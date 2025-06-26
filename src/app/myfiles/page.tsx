import MyFilesUI from '@/components/Files'
import Navbar from '@/components/Navbar'
import React from 'react'

const MyFiles = () => {
  return (
    <div>
        <Navbar />
        <div className="mt-20">
        <MyFilesUI />
        </div>
    </div>
  )
}

export default MyFiles