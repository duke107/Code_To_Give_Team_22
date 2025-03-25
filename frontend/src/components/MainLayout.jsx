import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import TranslateButton from '../TranslateButton'

const MainLayout = ({notifications}) => {
  return (
    <>
      <Header notifications={notifications}/>
      <div className="min-h-screen ">
        <Outlet />
    
      </div>
      <Footer />
    </>
  )
}

export default MainLayout
