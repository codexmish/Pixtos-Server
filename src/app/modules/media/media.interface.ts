// -----body for toggle trash, { restore: true } brings the item back from trash
export interface IToggleTrash {
	restore?: boolean;
}

// -----body for bulk favorite, isFavorite is set on every item (not toggled)
export interface IBulkFavorite {
	ids: string[];
	isFavorite: boolean;
}

// -----body for bulk trash
export interface IBulkTrash {
	ids: string[];
}
