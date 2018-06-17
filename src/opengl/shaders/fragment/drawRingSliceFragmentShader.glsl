/** @author Roan Hofland */
#define PI 3.141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067982148086513282306647093844609550582231725359408128481117450284102701938521105559644622948954930382
#define ratio 1.7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777778

uniform lowp float radius;
uniform lowp float cx;
uniform lowp float cy;
uniform lowp vec3 color;
uniform lowp float start;
uniform lowp float end;
uniform lowp float near;
uniform lowp float rotation;

varying lowp vec2 vpos;

void main() {
	lowp float dx = (vpos.x - cx) * ratio;
	lowp float dy = vpos.y - cy;
	lowp float val = sqrt(pow(dx, 2.0) + pow(dy, 2.0));
	lowp float angle = mod(atan(-dy, -dx) + PI + rotation, 2.0 * PI);
	lowp vec4 clr;
	if(val <= radius + 0.0025 && val >= radius - 0.0025 && angle >= start && angle <= end){
		clr = vec4(color, 1.0 - 400.0 * abs(radius - val));
	}else if(val <= near + 0.0025 && val >= near - 0.0025 && angle >= start && angle <= end){
		clr = vec4(color, 1.0 - 400.0 * abs(near - val));
	}else{
		clr = vec4(0.0, 0.0, 0.0, 0.0);
	}
	if(val <= radius && val >= near){
		if(abs(angle - start) * val <= 0.0025){
			clr = max(clr, vec4(color, 1.0 - 400.0 * abs(start - angle) * val));
		}else if(abs(angle - end) * val <= 0.0025){
			clr = max(clr, vec4(color, 1.0 - 400.0 * abs(end - angle) * val));
		}
	}
	gl_FragColor = clr;
}
/** @end-author Roan Hofland */
