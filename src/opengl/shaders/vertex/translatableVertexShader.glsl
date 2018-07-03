/** @author Roan Hofland */
attribute vec4 pos;
 
uniform lowp float cx;
uniform lowp float cy;

varying lowp vec2 vpos;
    
void main() {
	vec4 p = vec4(cx + pos.x, cy + pos.y, 1.0, 1.0);
    gl_Position = p;
    vpos = p.xy;
}
/** @end-author Roan Hofland */  
