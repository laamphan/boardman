/* eslint-disable @typescript-eslint/no-explicit-any */

import { User } from "@/types/db"
import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit"

export type UserState = {
  currentUser: User | null
  error: any | null
  loading: boolean
  view: string
}

const initialState: UserState = {
  currentUser: null,
  error: null,
  loading: false,
  view: "board",
}

export const userSlice: Slice<UserState> = createSlice({
  name: "user",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true
      state.error = null
    },
    signInSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false
      state.currentUser = action.payload
      state.error = null
    },
    signInFailure: (state, action: PayloadAction<any>) => {
      state.error = action.payload
      state.loading = false
    },
    signUpStart: (state) => {
      state.loading = true
      state.error = null
    },
    signUpSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false
      state.currentUser = action.payload
      state.error = null
    },
    signUpFailure: (state, action: PayloadAction<any>) => {
      state.error = action.payload
      state.loading = false
    },
    verifyStart: (state) => {
      state.loading = true
      state.error = null
    },
    verifySuccess: (state) => {
      state.loading = false
      state.error = null
    },
    verifyFailure: (state, action: PayloadAction<any>) => {
      state.error = action.payload
      state.loading = false
    },
    updateUserStart: (state) => {
      state.loading = true
    },
    updateUserSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false
      state.currentUser = action.payload
      state.error = null
    },
    updateUserFailure: (state, action: PayloadAction<any>) => {
      state.error = action.payload
      state.loading = false
    },
    deleteUserStart: (state) => {
      state.loading = true
    },
    deleteUserSuccess: (state) => {
      state.loading = false
      state.currentUser = null
      state.error = null
    },
    deleteUserFailure: (state, action: PayloadAction<any>) => {
      state.error = action.payload
      state.loading = false
    },
    signOutStart: (state) => {
      state.loading = true
    },
    signOutSuccess: (state) => {
      state.loading = false
      state.currentUser = null
      state.error = null
    },
    signOutFailure: (state, action: PayloadAction<any>) => {
      state.error = action.payload
      state.loading = false
    },
    changeView: (state, action: PayloadAction<string>) => {
      state.view = action.payload
    },
  },
})

export const {
  changeView,
  signInStart,
  signInSuccess,
  signInFailure,
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutStart,
  signOutSuccess,
  signOutFailure,
  signUpStart,
  signUpSuccess,
  signUpFailure,
  verifyStart,
  verifySuccess,
  verifyFailure,
} = userSlice.actions

export default userSlice.reducer
