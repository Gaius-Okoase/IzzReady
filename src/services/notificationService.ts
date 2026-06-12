import webpush from 'web-push';
import config from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import type { PushNotifToken } from '../types/types.js';

// Configure web push
webpush.setVapidDetails('mailto:gaiusonosetale@gmail.com', config.vapidPub!, config.vapidPri!)

export const savePushNotif = async (userId: string, push: PushNotifToken) => {
    const user = await User.findById(userId);
    if(!user) throw new AppError (404, 'User not found.')
    user.pushNotifToken?.push(JSON.stringify(push));

    user.save();
    return;
}

export const sendIzzReadyNotif = async (userId: string) => {
    // Get the subscripiton object
    const user = await User.findById(userId);

    if (!user)  {
        console.error(`User ${userId} not found.`)
        return
    };

    const payload = JSON.stringify({
        title: 'Food izz ready!',
        body: 'This is a test notification'
    }) 
    if (!user.pushNotifToken) return;
    await Promise.all(user.pushNotifToken.map( async (token) => {
        try {
            const tokenObj = JSON.parse(token)
            await webpush.sendNotification(tokenObj, payload)
        } catch (error) {
            console.error(`Failed to send to token:`, error)

        }
    }))
}

sendIzzReadyNotif('6a104e8211e1e2d859905a21')
//TODO: Allow multiple broswers notification token per user