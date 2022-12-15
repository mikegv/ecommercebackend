import { Schema, model, Document } from "mongoose";

interface cartItem {
  itemId: number;
  name: string;
  desc: string;
  price: number;
  quantity: number;
}

export interface userType extends Document {
  userName: string;
  password: string;
  cart: cartItem[];
}

const userSchema = new Schema<userType>({
  userName: String,
  password: String,
  cart: [
    {
      itemId: Number,
      name: String,
      desc: String,
      price: Number,
      quantity: Number,
    },
  ],
});

export const User = model<userType>("User", userSchema);
