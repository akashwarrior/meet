import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../app/store'

// Define a type for the slice state
export interface userState {
    user: {
        displayName: string,
        email: string,
        uid: string,
    } | null;
}

// Define the initial state using that type
const initialState: userState = { user: null }

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login: (state, action) => {
            state.user = action.payload;
        },
        logout: state => {
            state.user = null;
        },
    }
})

export const { login, logout } = userSlice.actions;

export const selectUser = (state: RootState) => state.user.user;

export default userSlice.reducer;