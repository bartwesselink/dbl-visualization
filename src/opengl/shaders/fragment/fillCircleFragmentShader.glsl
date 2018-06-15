/** @author Roan Hofland */
#define ratio 3.1604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938272

uniform lowp float radius;
uniform lowp float cx;
uniform lowp float cy;
uniform lowp vec3 color;

varying lowp vec2 vpos;

void main() {
	gl_FragColor = vec4(color, 1.0 + 400.0 * min(radius - sqrt(pow(vpos.x - cx, 2.0) * ratio + pow(vpos.y - cy, 2.0)), 0.0));
}
/** @end-author Roan Hofland */     
