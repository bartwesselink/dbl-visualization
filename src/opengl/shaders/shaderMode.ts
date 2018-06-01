/** @author Roan Hofland */
export enum ShaderMode{
	//circles
	LINED_CIRCLE = 1 << 1,
	FILL_CIRCLE = 1 << 2,
    DRAW_CIRCLE = 1 << 3,
    CIRCLES = LINED_CIRCLE | FILL_CIRCLE | DRAW_CIRCLE,
    
    //circle slices
    LINED_CIRCLE_SLICE = 1 << 4,
    FILL_CIRCLE_SLICE = 1 << 5,
    DRAW_CIRCLE_SLICE = 1 << 6,
    CIRCLE_SLICES = LINED_CIRCLE_SLICE | FILL_CIRCLE_SLICE | DRAW_CIRCLE_SLICE,

    //For debug usage only
    ALL = CIRCLES | CIRCLE_SLICES,
}
/** @end-author Roan Hofland */  