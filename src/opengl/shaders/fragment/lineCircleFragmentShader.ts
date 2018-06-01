/** @author Roan Hofland */
export const fragmentSource = `
    #define ratio 3.1604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938272

    uniform lowp float radius;
    uniform lowp float cx;
    uniform lowp float cy;
    uniform lowp vec3 color;
    uniform lowp vec3 lcolor;

    varying lowp vec2 vpos;
    
    void main() {
        lowp float val = sqrt(pow(vpos.x - cx, 2.0) * ratio + pow(vpos.y - cy, 2.0));
        lowp vec4 clr;
        if(val <= radius){
            clr = vec4(color, 1.0);
        }else{
            clr = vec4(0.0, 0.0, 0.0, 0.0);
        }
        if(val <= radius + 0.0025 && val >= radius - 0.0025){
            gl_FragColor = mix(clr, vec4(lcolor, 1.0), 1.0 - 400.0 * abs(radius - val));
        }else{
            gl_FragColor = clr;
        }
    }
`;
/** @end-author Roan Hofland */     
