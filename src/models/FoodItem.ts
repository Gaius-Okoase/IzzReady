import mongoose from "mongoose";
import type { IFoodItem } from "../types/types.js";

const foodItemSchema = new mongoose.Schema<IFoodItem>({
    bukkaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bukka",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["unavailable", "coming_soon", "awaiting_confirmation", "izz_ready"],
        default: "unavailable"
    },
    timerExpiry: {
        type: Date,
    }
},
{
    timestamps: true
});

foodItemSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret) => {
        (ret as any)._id = undefined;
        (ret as any).__v = undefined;
    }
});

export const FoodItem = mongoose.model('FoodItem', foodItemSchema);