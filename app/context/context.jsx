'use client'

import { useState, createContext, useContext,useEffect } from 'react'
import { auth, db } from '@/app/lib/firebase/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { collection } from 'firebase/firestore'

const Context = createContext()

export const ContextProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in.
      setSession(user)
    } else {
      // User is signed out.
      setSession(null)
    }
    setLoading(false)
  })

  return (
    <Context.Provider value={{ session, loading, auth, db }}>
      {children}
    </Context.Provider>
  )
}

export const useAuthContext = () => {
  return useContext(Context)
}
