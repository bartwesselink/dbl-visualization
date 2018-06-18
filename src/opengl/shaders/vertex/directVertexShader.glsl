/** @author Roan Hofland */
attribute vec4 pos;

varying lowp vec2 vpos;

void main() {
	gl_Position = pos;
	vpos = pos.xy;
}
/** @end-author Roan Hofland */
