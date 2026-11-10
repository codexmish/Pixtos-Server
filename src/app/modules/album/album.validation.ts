import z from "zod";

// -----create album validation
export const createAlbumSchema = z.object({
	title: z
		.string("Title is required")
		.trim()
		.min(1, "Title is required")
		.max(100, "title max 100 caracters long"),

	description: z
		.string("Description must be text")
		.trim()
		.max(500, "description max 500 caracters long")
		.optional(),

	// -----optional photos to add right away, each must be a mongodb id
	photoIds: z
		.array(
			z
				.string("Photo id must be text")
				.regex(/^[0-9a-fA-F]{24}$/, "Invalid photo id"),
			"photoIds must be a list of photo ids",
		)
		.optional(),
});
