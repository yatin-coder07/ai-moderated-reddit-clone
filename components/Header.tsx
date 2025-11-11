"use client"
import React from 'react'
import Image from 'next/image'
import { Button } from './ui/button'
import { useUser } from '@clerk/nextjs'
import { SignedIn,  SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react'
import fullLogo from "@/images/fullLogo.png"
import logo from "@/images/logo.png"
import {  ChevronLeftIcon, MenuIcon } from 'lucide-react'
import { useSidebar } from './ui/sidebar'
import CreatePostButton from './post/CreatePostButton'


const Header = () => {
    const {user} = useUser();
    const {toggleSidebar , open , isMobile}=useSidebar();
  return (
    <header className='flex flex-row justify-between w-full p-2 items-center border-b border-gray-200'>
        <div className=' gap-3 flex items-center'>
            {open && !isMobile ? (<ChevronLeftIcon className='w-6 h-6' onClick={toggleSidebar}/>) :(
                <div className='flex gap-3 items-center'>
                      <MenuIcon className='w-6 h-6' onClick={toggleSidebar}
            />
            <Image 
            src = {fullLogo}
            alt ="logo"
            width={100}
            height={100}
            className="hidden md:block"
            />
              <Image 
            src = {logo}
            alt ="logo"
            width={150}
            height={150}
            className="block md:hidden"
            />
                </div>
            )
            }
          
          
        </div>


       <div className='flex items-center gap-2'>
        <CreatePostButton/>
       {user ? <SignedIn><UserButton/></SignedIn> : <SignUpButton> 
            <Button asChild >
                <SignInButton/>
            </Button>
        </SignUpButton>
        }
       </div>

    </header>
  )
}

export default Header