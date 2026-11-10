import mongoose from "mongoose";

const user = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
			select: false,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		avatar: {
			type: String,
			default: "",
		},
		// -----imagekit file id of the avatar (needed to delete old avatar)
		avatarFileId: {
			type: String,
			default: "",
			select: false,
		},
		role: {
			type: String,
			require: true,
			default: "user",
			enum: ["user", "admin"],
		},
	},
	{ timestamps: true },
);

export const userSchema = mongoose.model("user", user);
