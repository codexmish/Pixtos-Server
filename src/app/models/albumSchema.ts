import mongoose from "mongoose";

const album = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			default: "",
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
			required: true,
			index: true,
		},
		photos: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "media",
			},
		],
	},
	{ timestamps: true },
);

export const albumSchema = mongoose.model("album", album);
