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
	gl_FragColor = vec4(color, 400.0 * (min(min(end - angle, 0.0025 / val), angle - start) * val + min(radius - val, 0.0) + min(val - near, 0.0)));
}
/** @end-author Roan Hofland */
