/** @author Roan Hofland */
attribute vec4 pos;
    
uniform mat4 modelviewMatrix;
uniform lowp float dx;
uniform lowp float dy;
  
varying lowp vec2 vpos;
    
void main() {
	gl_Position = modelviewMatrix * pos;
	vpos = vec2(pos.x + dx, pos.y + dy);
}
/** @end-author Roan Hofland */  
