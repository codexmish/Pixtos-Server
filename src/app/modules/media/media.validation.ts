import z from "zod";

// -----bulk favorite validation
export const bulkFavoriteSchema = z.object({
	ids: z
		.array(
			z
				.string("Media id must be text")
				.regex(/^[0-9a-fA-F]{24}$/, "Invalid media id"),
			"ids must be a list of media ids",
		)
		.min(1, "Select at least one item"),

	isFavorite: z.boolean("isFavorite must be true or false"),
});

// -----bulk trash validation
export const bulkTrashSchema = z.object({
	ids: z
		.array(
			z
				.string("Media id must be text")
				.regex(/^[0-9a-fA-F]{24}$/, "Invalid media id"),
			"ids must be a list of media ids",
		)
		.min(1, "Select at least one item"),
});
