/** @author Roan Hofland */
export enum ShaderMode{
	//circles
	LINED_CIRCLE = 1 << 1,
	FILL_CIRCLE = 1 << 2,
    DRAW_CIRCLE = 1 << 3,
    CIRCLES = LINED_CIRCLE | FILL_CIRCLE | DRAW_CIRCLE,
    
    //circle slices
    LINED_CIRCLE_SLICE = 0, //1 << 4,
    FILL_CIRCLE_SLICE = 1 << 5,
    DRAW_CIRCLE_SLICE = 1 << 6,
    CIRCLE_SLICES = FILL_CIRCLE_SLICE | DRAW_CIRCLE_SLICE | LINED_CIRCLE_SLICE,
    
    //ring slices
    LINED_RING_SLICE = 0, //1 << 7,
    FILL_RING_SLICE = 1 << 8,
    DRAW_RING_SLICE = 1 << 9,
    RING_SLICES = FILL_RING_SLICE | DRAW_RING_SLICE | LINED_RING_SLICE,
    
    //ellipsoids
    DRAW_ELLIPSOID = 0, //1 << 10,
    FILL_ELLIPSOID = 0, //1 << 11,
    LINED_ELLIPSOID = 0, //1 << 12,
    ELLIPSOIDS = DRAW_ELLIPSOID | FILL_ELLIPSOID | LINED_ELLIPSOID,

    //arcs
    ELLIPSOIDAL_ARC = 0, //1 << 13,
    CIRCULAR_ARC = 1 << 14,
    ARCS = CIRCULAR_ARC | ELLIPSOIDAL_ARC,
    
    //For debug usage only
    ALL = CIRCLES | CIRCLE_SLICES | RING_SLICES | ELLIPSOIDS | ARCS,
}
/** @end-author Roan Hofland */  