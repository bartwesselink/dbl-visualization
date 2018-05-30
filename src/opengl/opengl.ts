/** @author Roan Hofland */
import {Shader} from "./shader";
import {Element} from "./element";
import {Matrix} from "./matrix";
import {Mode} from "./mode";

export class OpenGL{
    private gl: WebGLRenderingContext;
    private shader: Shader;
    private modelviewMatrix;
    private arrays: Element[] = [];
    private readonly WIDTH = 1600;
    private readonly HEIGHT = 900;
    private readonly HALFWIDTH = this.WIDTH / 2;
    private readonly HALFHEIGHT = this.HEIGHT / 2;
    private readonly PRECISION = 10;
    private mode: Mode;
    private factor: number = 1;
    private dx: number = 0;
    private dy: number = 0;
    private rotation: number = 0;
    
    constructor(gl: WebGLRenderingContext){
        this.gl = gl;
        
        //set the canvas background color to 100% transparent black
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        
        this.modelviewMatrix = Matrix.createMatrix();
        
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.enable(this.gl.BLEND);
        this.gl.depthFunc(gl.LEQUAL);
        this.gl.enable(gl.DEPTH_TEST);   
    }
    
    //gets the visible canvas width in imaginary OpenGL space
    public getWidth(canvasheight: number, canvaswidth: number): number{
        if(this.mode == Mode.WIDTH_FIRST){
            return this.WIDTH / this.factor;
        }else{
            return (this.WIDTH * (canvasheight / canvaswidth)) / this.factor;
        }
    }
    
    //gets the visible canvas height in imaginary OpenGL space
    public getHeight(canvasheight: number, canvaswidth: number): number{
        if(this.mode == Mode.HEIGHT_FIRST){
            return this.HEIGHT / this.factor;
        }else{
            return (this.HEIGHT * (canvaswidth / canvasheight)) / this.factor;
        }
    }
    
    //test for a dedicated GPU
    public isDedicatedGPU(): boolean {
        var info = this.gl.getExtension("WEBGL_debug_renderer_info");
        var name = this.gl.getParameter(info.UNMASKED_RENDERER_WEBGL);
        console.log("Detected renderer: " + name);
        if(name.indexOf("NVIDIA") != -1){
            return true;   
        }else if(name.indexOf("GeForce") != -1){
            return true;
        }else if(name.indexOf("Quadro") != -1){
            return true;
        }else if(name.indexOf("TITAN V") != -1){
            return true;
        }else if(name.indexOf("GPU Accelerator") != -1){
            return true;
        }else if(name.indexOf("NVS") != -1){
            return true;
        }else if(name.indexOf("Radeon") != -1){
            if(name.match(".*Radeon (HD ....M|R(5|7|9) M...|Pro).*")){//Radeon HD Mobile, R5/R7/R9 Mobile and RX and Pro
                return false;
            }else if(name.indexOf("Mobility") != -1){
                return false;
            }else{
                return true;
            }
        }else if(name.indexOf("FirePro") != -1){
            if(name.indexOf("FirePro M") != -1){
                return false;
            }else{
                return true;
            }
        }else if(name.indexOf("FireGL") != -1){
            if(name.indexOf("Mobility") != -1){
                return false;
            }else{
                return true;
            }
        }else if(name.indexOf("FireMV") != -1){
            return true;
        }else{//note: no support for the AMD Wonder, Rage and Mach series since they are simply too old (<2000)
            return false;   
        }
    }
    
    //return the rotation
    public getRotation(): number {
        return this.rotation;
    }
    
    //return the zoom level
    public getZoom(): number {
        return this.factor;    
    }
    
    //reset scale, rotation and translations
    public resetTransformations(): void {
        this.resetTranslation();
        this.resetZoom();
        this.resetRotation();
    }
    
    //reset all scalings
    public resetZoom(): void {
        this.scale(1 / this.factor);
    }
    
    //reset all rotations
    public resetRotation(): void {
        this.rotate(-this.rotation);
    }
    
    //reset all translations
    public resetTranslation(): void {
        Matrix.translateSelf(this.modelviewMatrix, [-this.dx, -this.dy, 0]);
        this.dx = 0;
        this.dy = 0;
    }

    //rotate the model view by the given number of degrees
    public rotate(rotation: number): void {
        Matrix.translateSelf(this.modelviewMatrix, [-this.dx, -this.dy, 0]);
        Matrix.multiply4(this.modelviewMatrix, this.modelviewMatrix, Matrix.create2DInconsistentScalingMatrix(this.HALFHEIGHT, this.HALFWIDTH));
        Matrix.multiply4(this.modelviewMatrix, this.modelviewMatrix, Matrix.create2DRotationMatrix4(rotation));
        Matrix.multiply4(this.modelviewMatrix, this.modelviewMatrix, Matrix.create2DInconsistentScalingMatrix(1 / this.HALFHEIGHT, 1 / this.HALFWIDTH));
        Matrix.translateSelf(this.modelviewMatrix, [this.dx, this.dy, 0]); 
        this.rotation += rotation;
    }
    
    //translates the model view by the given distance
    public translate(dx: number, dy: number, width: number, height: number): void {
        var vec = Matrix.rotateVector2D([0, 0], [dx, dy], -this.rotation);
        dx = vec[0];
        dy = vec[1];
        if(this.mode == Mode.WIDTH_FIRST){
            height = (width / this.WIDTH) * this.HEIGHT;
        }else{
            width = (height / this.HEIGHT) * this.WIDTH;
        }
        dx = ((dx / width) * 2) / this.factor;
        dy = ((-dy / height) * 2) / this.factor;
        Matrix.translateSelf(this.modelviewMatrix, [dx, dy, 0]);
        this.dx += dx;
        this.dy += dy;
    }
    
    //scales the model view by the given factor
    public scale(factor: number): void {
        Matrix.translateSelf(this.modelviewMatrix, [-this.dx, -this.dy, 0]);
        Matrix.multiply4(this.modelviewMatrix, this.modelviewMatrix, Matrix.create2DScalingMatrix(factor));
        Matrix.translateSelf(this.modelviewMatrix, [this.dx, this.dy, 0]);
        this.factor *= factor;
    }
    
    //maps a true canvas coordinate to the imaginary OpenGL coordinate system
    public transformPoint(x: number, y: number, width: number, height: number): number[] {
        var loc = this.transform(x, y, width, height);
        loc[0] *= this.HALFWIDTH;
        loc[1] *= this.HALFHEIGHT;
        return loc;
    }
    
    //maps a true canvas coordinate to the true OpenGL coordinate system
    private transform(x: number, y: number, width: number, height: number): number[] {
        var dx = x - (width / 2);
        var dy = y - (height / 2);
        var loc = null;
        if(this.mode == Mode.WIDTH_FIRST){
            loc = [((dx / width) / this.factor) * this.WIDTH, -(((dy / height) * (height / (width / this.WIDTH))) / this.factor)];
        }else{
            loc = [(((dx / width) * (width / (height / this.HEIGHT))) / this.factor), -((dy / height) / this.factor) * this.HEIGHT];
        }
        Matrix.rotateVector2D([0, 0], loc, this.rotation);
        loc[0] = (loc[0] / this.HALFWIDTH) - this.dx;
        loc[1] = (loc[1] / this.HALFHEIGHT) - this.dy;
        return loc;
    }
    
    //resizes the viewport to the optimal size for the new canvas size
    public resize(width: number, height: number): void {
        //maintain the viewport aspect ratio at 16:9 and center the viewport as a 16:9 rectangle in the center of the actual canvas making sure to
        //position the viewport in such a way that it covers the entire canvas
        //by forcing a 16:9 viewport we can make sure that even when the canvas is resized our buffers remain correct so that 
        //the visualisation does not distort. Theoretically we could also recompute all the buffers and map to a new coordinate space.
        if((width / this.WIDTH) * this.HEIGHT > height){
            this.mode = Mode.WIDTH_FIRST;
            this.gl.viewport(0, (height - ((width / this.WIDTH) * this.HEIGHT)) / 2, width, (width / this.WIDTH) * this.HEIGHT);
        }else{
            this.mode = Mode.HEIGHT_FIRST;
            this.gl.viewport((width - ((height / this.HEIGHT) * this.WIDTH)) / 2, 0, (height / this.HEIGHT) * this.WIDTH, height);
        }
    }
    
    //render the OpenGL scene
    public render(): void {
        this.clear();
        
        this.gl.useProgram(this.shader.shader);
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shader.shader, "modelviewMatrix"), false, this.modelviewMatrix);
        
        this.drawBuffers();
    }
    
    //sets the shader to use
    public useShader(shader: Shader): void {
        this.shader = shader;
    }
    
    //releases all the OpenGL buffers
    public releaseBuffers(): void {
        while(this.arrays.length > 0){
            var elem = this.arrays.pop();
            this.gl.deleteBuffer(elem.color);
            this.gl.deleteBuffer(elem.pos);
            this.gl.deleteBuffer(elem.indices);
        }
    }
    
    //draws a partial ellipsoid
    public drawEllipsoidalArc(x: number, y: number, radx: number, rady: number, start: number, end: number, color: number[], precision: number = this.PRECISION): void {
        const pos = [];
        const colors = [];
        for(var i = start; i <= end; i += precision){
            pos.push((x + radx * Math.cos(i * Matrix.oneDeg)) / this.HALFWIDTH, (y + rady * Math.sin(i * Matrix.oneDeg)) / this.HALFHEIGHT);
            colors.push(color[0], color[1], color[2], color[3]);
        }
        
        this.drawArcImpl(pos, colors);
    }
    
    //draws a partial circle
    public drawCircularArc(x: number, y: number, radius: number, start: number, end: number, color: number[], precision: number = this.PRECISION): void {
        const pos = [];
        const colors = [];
        var loc = [x + radius, y];
        var rotation = [9];
        Matrix.multiply(rotation, Matrix.create2DTranslationMatrix([-x, -y]), Matrix.create2DRotationMatrix(precision));
        Matrix.multiply(rotation, rotation, Matrix.create2DTranslationMatrix([x, y]));
        Matrix.rotateVector2D([x, y], loc, start);
        for(var i = start; i < end; i += precision){
            pos.push(loc[0] / this.HALFWIDTH, loc[1] / this.HALFHEIGHT);
            colors.push(color[0], color[1], color[2], color[3]);
            Matrix.multiplyVector2D(loc, rotation);
        }
        pos.push(loc[0] / this.HALFWIDTH, loc[1] / this.HALFHEIGHT);
        colors.push(color[0], color[1], color[2], color[3]);   
        
        this.drawArcImpl(pos, colors);
    }
    
    //draws an arc
    private drawArcImpl(pos: number[], colors: number[]): void {
        var positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(pos), this.gl.STATIC_DRAW);
        
        var colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
        
        this.arrays.push({
            pos: positionBuffer,
            color: colorBuffer,
            mode: this.gl.LINE_STRIP,
            length: pos.length / 2
        });
    }
    
    //draws a straight line
    public drawLine(x1: number, y1: number, x2: number, y2: number, color: number[]): void {
        this.drawPolyLine([x1, x2], [y1, y2], color);    
    }
    
    //draws multiple continues lines
    public drawPolyLine(x: number[], y: number[], color: number[]): void {   
        var positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        const pos = [x.length + y.length];
        const colors = [x.length * 4];
        for(var i = 0; i < x.length; i++){
            pos[i * 2] = x[i] / this.HALFWIDTH;
            pos[i * 2 + 1] = y[i] / this.HALFHEIGHT;
            colors[i * 4] = color[0];
            colors[i * 4 + 1] = color[1];
            colors[i * 4 + 2] = color[2];
            colors[i * 4 + 3] = color[3];
        }
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(pos), this.gl.STATIC_DRAW);
        
        var colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
        
        this.arrays.push({
            pos: positionBuffer,
            color: colorBuffer,
            mode: this.gl.LINE_STRIP,
            length: x.length
        });
    }
    
    //fill a rotated quad
    public fillRotatedQuad(x: number, y: number, width: number, height: number, rotation: number, color: number[]): void {
        this.renderRotatedQuad(x,             y,
                               x - width / 2, y + height / 2,
                               x + width / 2, y + height / 2,
                               x - width / 2, y - height / 2,
                               x + width / 2, y - height / 2,
                               rotation, true, false, color, null);
    }
    
     //draw a rotated quad
    public drawRotatedQuad(x: number, y: number, width: number, height: number, rotation: number, color: number[]): void {
        this.renderRotatedQuad(x,             y,
                               x - width / 2, y + height / 2,
                               x + width / 2, y + height / 2,
                               x + width / 2, y - height / 2,
                               x - width / 2, y - height / 2,
                               rotation, false, true, null, color);
    }
    
     //render a rotated quad
    public fillLinedRotatedQuad(x: number, y: number, width: number, height: number, rotation: number, fillColor: number[], lineColor: number[]): void {
        this.renderRotatedQuad(x,             y,
                               x - width / 2, y + height / 2,
                               x + width / 2, y + height / 2,
                               x - width / 2, y - height / 2,
                               x + width / 2, y - height / 2,
                               rotation, true, true, fillColor, lineColor);
    }
    
    //renders a rotated quad
    private renderRotatedQuad(x: number, y: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, rotation: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[]): void {
        //a---------b
        //|   x,y   |
        //c---------d
        var center = [x, y];
        var a = Matrix.rotateVector2D(center, [x1, y1], rotation);
        var b = Matrix.rotateVector2D(center, [x2, y2], rotation);
        var c = Matrix.rotateVector2D(center, [x3, y3], rotation);
        var d = Matrix.rotateVector2D(center, [x4, y4], rotation);
        
        this.drawQuadImpl(b[0], b[1],
                          a[0], a[1],
                          d[0], d[1],
                          c[0], c[1],
                          fill, line, fillColor, lineColor);
    }
    
    //fill an axis aligned quad
    public fillAAQuad(x: number, y: number, width: number, height: number, color: number[]): void {
        this.drawQuadImpl(x + width, y + height,
                          x,         y + height,
                          x + width, y,
                          x,         y,
                          true, false, color, null);
    }
    
    //draw an axis aligned quad
    public drawAAQuad(x: number, y: number, width: number, height: number, color: number[]): void {
       this.drawQuadImpl(x + width, y + height,
                         x,         y + height,
                         x,         y,
                         x + width, y,
                         false, true, null, color);
    }
    
    //render an axis aligned quad
    public fillLinedAAQuad(x: number, y: number, width: number, height: number, fillColor: number[], lineColor: number[]): void {
        this.drawQuadImpl(x + width, y + height,
                          x,         y + height,
                          x + width, y,
                          x,         y,
                          true, true, fillColor, lineColor);
    }
        
    //draw quad implementation
    private drawQuadImpl(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[]): void {
        //position
        var positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        const pos = [x1 / this.HALFWIDTH,  y1 / this.HALFHEIGHT, 
                     x2 / this.HALFWIDTH,  y2 / this.HALFHEIGHT, 
                     x3 / this.HALFWIDTH,  y3 / this.HALFHEIGHT, 
                     x4 / this.HALFWIDTH,  y4 / this.HALFHEIGHT];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(pos), this.gl.STATIC_DRAW);
      
        //color
        var colorBuffer = null;
        if(fill){
            colorBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
            const colors = [fillColor[0], fillColor[1], fillColor[2], fillColor[3],
                            fillColor[0], fillColor[1], fillColor[2], fillColor[3],
                            fillColor[0], fillColor[1], fillColor[2], fillColor[3],
                            fillColor[0], fillColor[1], fillColor[2], fillColor[3]];
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
        }
        
        if(!line){
            this.arrays.push({
                pos: positionBuffer,
                color: colorBuffer,
                mode: this.gl.TRIANGLE_STRIP,
                length: 4
            });
        }else{
            var lineColorBuffer = null;
            if(lineColor == null){
                lineColorBuffer = colorBuffer;
            }else{
                //color
                lineColorBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, lineColorBuffer);
                const colors = [lineColor[0], lineColor[1], lineColor[2], lineColor[3],
                                lineColor[0], lineColor[1], lineColor[2], lineColor[3],
                                lineColor[0], lineColor[1], lineColor[2], lineColor[3],
                                lineColor[0], lineColor[1], lineColor[2], lineColor[3]];
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
            }
            
            if(line && fill){
                //indices
                var indicesBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
                this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint8Array([0, 2, 3, 1]), this.gl.STATIC_DRAW);
                
                this.arrays.push({
                    pos: positionBuffer,
                    color: colorBuffer,
                    mode: this.gl.TRIANGLE_STRIP,
                    length: 4,
                    overlay: {
                        pos: positionBuffer,
                        indices: indicesBuffer,
                        color: lineColorBuffer,
                        mode: this.gl.LINE_LOOP,
                        length: 4
                    }
                });
            }else{
                this.arrays.push({
                    pos: positionBuffer,
                    color: lineColorBuffer,
                    mode: this.gl.LINE_LOOP,
                    length: 4
                });
            }
        }
    }
    
    //draw an ellipsoid         
    public fillEllipsoid(x: number, y: number, radx: number, rady: number, rotation: number, fillColor: number[], precision: number = this.PRECISION): void {
        this.drawEllipsoidImpl(x, y, radx, rady, rotation, true, false, fillColor, null, precision);
    }
    
    //draw an ellipsoid         
    public drawEllipsoid(x: number, y: number, radx: number, rady: number, rotation: number, lineColor: number[], precision: number = this.PRECISION): void {
        this.drawEllipsoidImpl(x, y, radx, rady, rotation, false, true, null, lineColor, precision);
    }
          
    //draw an ellipsoid         
    public fillLinedEllipsoid(x: number, y: number, radx: number, rady: number, rotation: number, fillColor: number[], lineColor: number[], precision: number = this.PRECISION): void {
        this.drawEllipsoidImpl(x, y, radx, rady, rotation, true, true, fillColor, lineColor, precision);
    }
    
    //renders an ellipsoid
    private drawEllipsoidImpl(x: number, y: number, radx: number, rady: number, rotation: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[], precision: number): void {
        const pos = [];
        const color = [];
        if(fill){
            pos.push(x / this.HALFWIDTH, y / this.HALFHEIGHT);
            color.push(fillColor[0], fillColor[1], fillColor[2], fillColor[3]);
        }
        var loc = [2];
        for(var i = 0; i <= 360; i += precision){
            loc[0] = x + radx * Math.cos(i * Matrix.oneDeg);
            loc[1] = y + rady * Math.sin(i * Matrix.oneDeg);
            Matrix.rotateVector2D([x, y], loc, rotation);
            pos.push(loc[0] / this.HALFWIDTH, loc[1] / this.HALFHEIGHT);
            if(fill || lineColor == null){
                color.push(fillColor[0], fillColor[1], fillColor[2], fillColor[3]);
            }else{
                color.push(lineColor[0], lineColor[1], lineColor[2], lineColor[3]);
            }
        }
            
        this.renderEllipsoidImpl(color, pos, fill, line, lineColor, 2);
    }
    
    //draws a circle
    public fillCircle(x: number, y: number, radius: number, fillColor: number[], precision: number = this.PRECISION): void {
        this.drawCircleImpl(x, y, radius, true, false, fillColor, null, precision);
    }
            
    //draws a circle
    public drawCircle(x: number, y: number, radius: number, lineColor: number[], precision: number = this.PRECISION): void {
        this.drawCircleImpl(x, y, radius, false, true, null, lineColor, precision);
    }
                    
    //draws a circle
    public fillLinedCircle(x: number, y: number, radius: number, fillColor: number[], lineColor: number[], precision: number = this.PRECISION): void {
        this.drawCircleImpl(x, y, radius, true, true, fillColor, lineColor, precision);
    }
    
    //renders a circle
    private drawCircleImpl(x: number, y: number, radius: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[], precision: number): void {
        const pos = [];
        const colors = [];
        if(fill){
            pos.push(x / this.HALFWIDTH, y / this.HALFHEIGHT);
            colors.push(fillColor[0], fillColor[1], fillColor[2], fillColor[3]);
        }
        var loc = [x + radius, y];
        var rotation = [9];
        Matrix.multiply(rotation, Matrix.create2DTranslationMatrix([-x, -y]), Matrix.create2DRotationMatrix(precision));
        Matrix.multiply(rotation, rotation, Matrix.create2DTranslationMatrix([x, y]));
        for(var i = 0; i <= 360; i += precision){
            Matrix.multiplyVector2D(loc, rotation);
            pos.push(loc[0] / this.HALFWIDTH, loc[1] / this.HALFHEIGHT);
            if(fill || lineColor == null){
                colors.push(fillColor[0], fillColor[1], fillColor[2], fillColor[3]);
            }else{
                colors.push(lineColor[0], lineColor[1], lineColor[2], lineColor[3]);
            }
        }
            
        this.renderEllipsoidImpl(colors, pos, fill, line, lineColor, 2);
    }
    
    //draws a ring slice
    public drawRingSlice(x: number, y: number, near: number, far: number, start: number, end: number, color: number[], precision: number = this.PRECISION): void {
        const pos = [];
        const colors = [];
        for(var i = start; i < end; i += precision){
            pos.push((x + far * Math.cos(i * Matrix.oneDeg)) / this.HALFWIDTH, (y + far * Math.sin(i * Matrix.oneDeg)) / this.HALFHEIGHT);
            colors.push(color[0], color[1], color[2], color[3]);
        }
        pos.push((x + far * Math.cos(end * Matrix.oneDeg)) / this.HALFWIDTH, (y + far * Math.sin(end * Matrix.oneDeg)) / this.HALFHEIGHT);
        colors.push(color[0], color[1], color[2], color[3]);
        for(var i = end; i > start; i -= precision){
            pos.push((x + near * Math.cos(i * Matrix.oneDeg)) / this.HALFWIDTH, (y + near * Math.sin(i * Matrix.oneDeg)) / this.HALFHEIGHT);
            colors.push(color[0], color[1], color[2], color[3]);
        }
        pos.push((x + near * Math.cos(start * Matrix.oneDeg)) / this.HALFWIDTH, (y + near * Math.sin(start * Matrix.oneDeg)) / this.HALFHEIGHT);
        colors.push(color[0], color[1], color[2], color[3]);
                
        var colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
            
        var posBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(pos), this.gl.STATIC_DRAW);
        
        this.arrays.push({
            pos: posBuffer,
            color: colorBuffer,
            mode: this.gl.LINE_LOOP,
            length: pos.length / 2
        });
    }
    
    //draws a ring slice
    public fillRingSlice(x: number, y: number, near: number, far: number, start: number, end: number, color: number[], precision: number = this.PRECISION): void {
        this.fillRingSliceImpl(x, y, near, far, start, end, false, color, null, precision);
    }
    
    //draws a ring slice
    public fillLinedRingSlice(x: number, y: number, near: number, far: number, start: number, end: number, fillColor: number[], lineColor: number[], precision: number = this.PRECISION): void {
        this.fillRingSliceImpl(x, y, near, far, start, end, true, fillColor, lineColor, precision);
    }
    
    //draws a ring slice
    private fillRingSliceImpl(x: number, y: number, near: number, far: number, start: number, end: number, line: boolean, fillColor: number[], lineColor: number[], precision: number): void {
        const pos = [];
        const colors = [];
        for(var i = start; i < end; i += precision){
            pos.push((x + far * Math.cos(i * Matrix.oneDeg)) / this.HALFWIDTH, (y + far * Math.sin(i * Matrix.oneDeg)) / this.HALFHEIGHT);
            pos.push((x + near * Math.cos(i * Matrix.oneDeg)) / this.HALFWIDTH, (y + near * Math.sin(i * Matrix.oneDeg)) / this.HALFHEIGHT);
            colors.push(fillColor[0], fillColor[1], fillColor[2], fillColor[3], fillColor[0], fillColor[1], fillColor[2], fillColor[3]);
        }
        pos.push((x + far * Math.cos(end * Matrix.oneDeg)) / this.HALFWIDTH, (y + far * Math.sin(end * Matrix.oneDeg)) / this.HALFHEIGHT);
        pos.push((x + near * Math.cos(end * Matrix.oneDeg)) / this.HALFWIDTH, (y + near * Math.sin(end * Matrix.oneDeg)) / this.HALFHEIGHT);
        colors.push(fillColor[0], fillColor[1], fillColor[2], fillColor[3], fillColor[0], fillColor[1], fillColor[2], fillColor[3]);
                
        var colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
            
        var posBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(pos), this.gl.STATIC_DRAW);
        
        if(line){
            var lineColorBuffer = null;
            if(lineColor == null){
                lineColorBuffer = colorBuffer;
            }else{
                lineColorBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, lineColorBuffer);
                var lineColors = [];
                for(var i = 0; i < pos.length / 2; i++){
                    lineColors.push(lineColor[0], lineColor[1], lineColor[2], lineColor[3]);
                }
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(lineColors), this.gl.STATIC_DRAW);
            }
            
            const indices = [pos.length / 2];
            for(var i = 0; i < pos.length / 4; i++){
                indices[i] = i * 2;
                indices[pos.length / 2 - 1 - i] = i * 2 + 1;
            }
        
            var indicesBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), this.gl.STATIC_DRAW);
        
            this.arrays.push({
                pos: posBuffer,
                color: colorBuffer,
                mode: this.gl.TRIANGLE_STRIP,
                length: pos.length / 2,
                overlay: {
                    pos: posBuffer,
                    indices: indicesBuffer,
                    color: lineColorBuffer,
                    mode: this.gl.LINE_LOOP,
                    length: pos.length / 2
                }
            });
        }else{
            this.arrays.push({
                pos: posBuffer,
                color: colorBuffer,
                mode: this.gl.TRIANGLE_STRIP,
                length: pos.length / 2,
            });
        }
    }
    
    //draws a circular slice  
    public drawCircleSlice(x: number, y: number, radius: number, start: number, end: number, color: number[], precision: number = this.PRECISION): void {
        this.drawCircleSliceImpl(x, y, radius, start, end, false, true, null, color, precision);
    }
    
    //draws a circular slice
    public fillCircleSlice(x: number, y: number, radius: number, start: number, end: number, color: number[], precision: number = this.PRECISION): void {
        this.drawCircleSliceImpl(x, y, radius, start, end, true, false, color, null, precision);
    }
    
    //draws a circular slice
    public fillLinedCircleSlice(x: number, y: number, radius: number, start: number, end: number, fillColor: number[], lineColor: number[], precision: number = this.PRECISION): void {
        this.drawCircleSliceImpl(x, y, radius, start, end, true, true, fillColor, lineColor, precision);
    }
    
    //draws a circular slice
    private drawCircleSliceImpl(x: number, y: number, radius: number, start: number, end: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[], precision: number): void {
        const pos = [];
        const colors = [];
        pos.push(x / this.HALFWIDTH, y / this.HALFHEIGHT);
        if(fill || lineColor == null){
            colors.push(fillColor[0], fillColor[1], fillColor[2], fillColor[3]);
        }else{
            colors.push(lineColor[0], lineColor[1], lineColor[2], lineColor[3]);
        }
        for(var i = start; i < end; i += precision){
            pos.push((x + radius * Math.cos(i * Matrix.oneDeg)) / this.HALFWIDTH, (y + radius * Math.sin(i * Matrix.oneDeg)) / this.HALFHEIGHT);
            if(fill || lineColor == null){
                colors.push(fillColor[0], fillColor[1], fillColor[2], fillColor[3]);
            }else{
                colors.push(lineColor[0], lineColor[1], lineColor[2], lineColor[3]);
            }
        }
        pos.push((x + radius * Math.cos(end * Matrix.oneDeg)) / this.HALFWIDTH, (y + radius * Math.sin(end * Matrix.oneDeg)) / this.HALFHEIGHT);
        if(fill || lineColor == null){
            colors.push(fillColor[0], fillColor[1], fillColor[2], fillColor[3]);
        }else{
            colors.push(lineColor[0], lineColor[1], lineColor[2], lineColor[3]);
        }
                
        this.renderEllipsoidImpl(colors, pos, fill, line, lineColor, 0);
    }
    
    //draws an ellipsoid
    private renderEllipsoidImpl(colors: number[], pos: number[], fill: boolean, line: boolean, lineColor: number[], offset: number): void {
        var colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
            
        var posBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(pos), this.gl.STATIC_DRAW);
        
        if(!(fill && line)){
            this.arrays.push({
                pos: posBuffer,
                color: colorBuffer,
                mode: fill ? this.gl.TRIANGLE_FAN : this.gl.LINE_LOOP,
                length: pos.length / 2
            });
        }else{
            var lineColorBuffer;
            if(lineColor == null){
                lineColorBuffer = colorBuffer;
            }else{
                lineColorBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, lineColorBuffer);
                var lineColors = [];
                for(var i = 0; i < pos.length / 2 - offset; i++){
                    lineColors.push(lineColor[0], lineColor[1], lineColor[2], lineColor[3]);
                }
                
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(lineColors), this.gl.STATIC_DRAW);
            }
            this.arrays.push({
                pos: posBuffer,
                color: colorBuffer,
                mode: this.gl.TRIANGLE_FAN,
                length: pos.length / 2,
                overlay: {
                    pos: posBuffer,
                    color: lineColorBuffer,
                    mode: this.gl.LINE_LOOP,
                    length: pos.length / 2 - offset,
                    offset: offset * 4
                }
            });
        }
    }
    
    //clear the screen
    private clear(): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
    
    //draw all the OpenGL buffers
    private drawBuffers(): void {
        for(var i = 0; i < this.arrays.length; i++){
            this.drawElement(this.arrays[i]);
        }
    }
    
    //renders the given element
    private drawElement(elem: Element): void {
        if(elem.pos != null){
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, elem.pos);
            this.gl.vertexAttribPointer(this.shader.shaderAttribPosition,             //attribute
                                        2,                                            //2D so two values per iteration: x, y
                                        this.gl.FLOAT,                                //data type is float32
                                        false,                                        //no normalisation
                                        0,                                            //stride = automatic
                                        elem.offset == null ? 0 : elem.offset);       //skip
            this.gl.enableVertexAttribArray(this.shader.shaderAttribPosition);
        }
        
        if(elem.color != null){
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, elem.color);
            this.gl.vertexAttribPointer(this.shader.shaderAttribColor,                //attribute
                                        4,                                            //rgba so four values per iteration: r, g, b, a
                                        this.gl.FLOAT,                                //data type is float32
                                        false,                                        //no normalisation
                                        0,                                            //stride = automatic
                                        0);                                           //skip
            this.gl.enableVertexAttribArray(this.shader.shaderAttribColor);
        }
        
        if(elem.indices == null){
            this.gl.drawArrays(elem.mode, 0, elem.length);
        }else{
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, elem.indices);
            this.gl.drawElements(elem.mode, elem.length, this.gl.UNSIGNED_BYTE, 0);
        }
        
        if(elem.overlay != null){
            this.drawElement(elem.overlay);
        }
    }
    
    //initialises the shaders
    public initShaders(): Shader {
        //really simple minimal vertex shader
        //we just pass the color on to the fragment shader and don't perform any transformations
        const vertexShaderSource = `
          attribute vec4 pos;
          attribute vec4 color;
        
          uniform mat4 modelviewMatrix;
        
          varying lowp vec4 vcolor;
          
          void main() {
            gl_Position = modelviewMatrix * pos;
            vcolor = color;
          }
        `;
      
        //really simple fragment shader that just assigns the color it gets from the vertex shader
        //without transforming it in any way.
        const fragmentShaderSource = `
          varying lowp vec4 vcolor;
        
          void main() {
            gl_FragColor = vcolor;
          }
        `;
        
        //just some generic shader loading
        var fragmentShader;
        var vertexShader;
        {
            const shader = this.gl.createShader(this.gl.VERTEX_SHADER);
            this.gl.shaderSource(shader, vertexShaderSource);
            this.gl.compileShader(shader);
            if(!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)){
                this.gl.deleteShader(shader);
                throw new Error("Vertex shader compilation failed");
            }else{
                vertexShader = shader;
            }
        }
        {
            const shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
            this.gl.shaderSource(shader, fragmentShaderSource);
            this.gl.compileShader(shader);
            if(!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)){
                this.gl.deleteShader(shader);
                throw new Error("Fragment shader compilation failed");
            }else{
                fragmentShader = shader;
            }
        }
        
        //create a program using our vertex and fragment shader and link it
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if(!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)){
            throw new Error("Shader link status wrong");
        }
        
        //Initialise the shader object for use
        return{
            shader: program,
            shaderAttribPosition: this.gl.getAttribLocation(program, "pos"),
            shaderAttribColor: this.gl.getAttribLocation(program, "color")
        }
    }
}
/** @end-author Roan Hofland */     
