/** @author Roan Hofland */
export const fragmentSource = `
    uniform lowp float radius;
    uniform lowp float cx;
    uniform lowp float cy;
    uniform lowp vec3 color;
    uniform lowp vec3 lcolor;

    varying lowp vec2 vpos;
    
    void main() {
        lowp float val = pow(vpos.x - cx, 2.0) * 3.1604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938272 + pow(vpos.y - cy, 2.0);
        if(val < radius * radius){
            if(val <= pow(radius - 0.004, 2.0)){
                gl_FragColor = vec4(color, 1.0);
            }else{
                gl_FragColor = vec4(lcolor, 1.0);
            }
        }else{
            discard;
        }
    }
`;
/** @end-author Roan Hofland */     
