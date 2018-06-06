/** @author Roan Hofland */
#define PI 3.141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067982148086513282306647093844609550582231725359408128481117450284102701938521105559644622948954930382
#define ratio 1.7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777778

uniform lowp float radius;
uniform lowp float cx;
uniform lowp float cy;
uniform lowp vec3 color;
uniform lowp float start;
uniform lowp float end;

varying lowp vec2 vpos;

void main() {
	lowp float dx = (vpos.x - cx) * ratio;
	lowp float dy = vpos.y - cy;
	lowp float val = sqrt(pow(dx, 2.0) + pow(dy, 2.0));
	lowp float angle = atan(dy, dx);
	lowp vec4 clr;
	if(val <= radius + 0.0025 && val >= radius - 0.0025){
		if(start < PI){
			if(end < PI){
				if(angle >= start && angle <= end){
					clr = vec4(color, 1.0 - 400.0 * abs(radius - val));
				}
			}else if(angle <= end - 2.0 * PI){
				clr = vec4(color, 1.0 - 400.0 * abs(radius - val));
			}else if(angle >= start){
				clr = vec4(color, 1.0 - 400.0 * abs(radius - val));
			}
		}else if(angle >= start - 2.0 * PI && angle <= end - 2.0 * PI){
			clr = vec4(color, 1.0 - 400.0 * abs(radius - val));
		}
	}else{
		clr = vec4(0.0, 0.0, 0.0, 0.0);
	}
	if(val <= radius){
		if(abs(angle - start) * val <= 0.0025){
			clr = max(clr, vec4(color, 1.0 - 400.0 * abs(start - angle) * val));
		}else if(abs(angle - end) * val <= 0.0025){
			clr = max(clr, vec4(color, 1.0 - 400.0 * abs(end - angle) * val));
		}else if(abs(angle - end + 2.0 * PI) * val <= 0.0025){
			clr = max(clr, vec4(color, 1.0 - 400.0 * abs(angle - end + 2.0 * PI) * val));
		}else if(abs(start - 2.0 * PI - angle) * val <= 0.0025){
			clr = max(clr, vec4(color, 1.0 - 400.0 * abs(start - 2.0 * PI - angle) * val));
		}
	}
	gl_FragColor = clr;
	//	if(val <= radius && (abs(angle - start) * val <= 0.0025 || abs(end - angle - 2.0 * PI) * val <= 0.0025 || abs(angle - end) * val <= 0.0025 || abs(-angle - start + 2.0 * PI) * val <= 0.0025)){
	//		gl_FragColor = vec4(color, 1.0);
//		if(start < PI){
//			if(end < PI){
//				if(angle >= start && angle <= end){
//					//gl_FragColor = vec4(color, 1.0 - 400.0 * (min(abs(end - angle), abs(angle - start)) * val));
//					gl_FragColor = vec4(color, 1.0 - 400.0 * abs(start - angle) * val);
//				}
//			}else if(angle <= end - 2.0 * PI){
//				//gl_FragColor = vec4(color, 1.0 - 400.0 * (abs(end - angle - 2.0 * PI) * val));
//			}else if(angle >= start){
//				//gl_FragColor = vec4(color, 1.0 - 400.0 * (abs(angle - start) * val));
//			}
//		}else if(angle >= start - 2.0 * PI && angle <= end - 2.0 * PI){
//			//gl_FragColor = vec4(color, 1.0 - 400.0 * (min(abs(angle - start + 2.0 * PI), abs(end - 2.0 * PI - angle)) * val));
//		}
//	}
}
/** @end-author Roan Hofland */
