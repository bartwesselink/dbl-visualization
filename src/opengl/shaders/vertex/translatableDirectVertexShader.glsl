/** @author Roan Hofland */
attribute vec4 pos;
 
uniform mat4 modelviewMatrix;

varying lowp vec2 vpos;
    
void main() {
	vec4 p = modelviewMatrix * vec4(pos.x - dx, pos.y - dy, pos.z, pos.w);
    gl_Position = p;
    vpos = p.xy;
}
/** @end-author Roan Hofland */  
