/** @author Roan Hofland */
export const fragmentSource = `
    #define PI 3.1415926535897932384626433832795
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
        if(val <= radius && angle >= start - PI && angle <= end - PI){
            gl_FragColor = vec4(color, 1.0);
        }
    }
`;
/** @end-author Roan Hofland */     
