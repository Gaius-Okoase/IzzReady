import type mongoose from "mongoose"

export interface IUser {
    // id: string - Mongoose auto generated
    googleId?: string,
    name: string,
    email?: string 
    phoneNumber?: string,
    password?: string
    role: "customer" | "owner",
    isProfileComplete: boolean
    pushNotifToken?: string
    refreshToken?: string
}

export interface IUserMethod {
    comparePassword: (password: string) => Promise<boolean>
}

export interface IBukka {
    ownerId: mongoose.Types.ObjectId,
    name: string,
    location: {
        type: 'Point',
        coordinates: [number]
    }
}