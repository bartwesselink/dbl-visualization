/** @author Roan Hofland */
export enum ShaderMode{
	//circles
	LINED_CIRCLE = 1 << 1,
	FILL_CIRCLE = 1 << 2,
    DRAW_CIRCLE = 1 << 3,
    CIRCLES = LINED_CIRCLE | FILL_CIRCLE | DRAW_CIRCLE,

    //For debug usage only
    ALL = CIRCLES,
}
/** @end-author Roan Hofland */  