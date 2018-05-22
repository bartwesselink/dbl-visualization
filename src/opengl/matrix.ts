/** @author Roan Hofland */
export class Matrix{
    public static readonly oneDeg = Math.PI / 180.0;
    
    //translate the given matrix by the given vector
    public static translateSelf(matrix, vector): void {
        Matrix.translate(matrix, matrix, vector);
    }
    
    //rotates the given vector around the given center by the given number of degrees
    public static rotateVector2D(center: number[], vector: number[], degrees: number): number[] {
        //[1 0 cx]   [cos(deg) -sin(deg) 0]   [1 0 -cx]   [x]
        //[0 1 cy] * [sin(deg) cos(deg)  0] * [0 1 -cy] * [y] = 
        //[0 0 1 ]   [0        0         1]   [0 0 1  ]   [1]
        //[cos(deg) -sin(deg) cx]   [1 0 -cx]   [x]
        //[sin(deg) cos(deg)  cy] * [0 1 -cy] * [y] = 
        //[0        0         1 ]   [0 0 1  ]   [1]
        //[cos(deg) -sin(deg) (cos(deg) * -cx - sin(deg) * -cy + cx)]   [x]
        //[sin(deg) cos(deg)  (sin(deg) * -cx + cos(deg) * -cy + cy)] * [y] = 
        //[0        0         1                                   ]   [1]
        //x = cos(deg) * x - sin(deg) * y - cos(deg) * cx - sin(deg) * cy + cx
        //y = sin(deg) * x + cos(deg) * y - sin(deg) * cx + cos(deg) * cy + cy
        var c = Math.cos(degrees * this.oneDeg);
        var s = Math.sin(degrees * this.oneDeg);
        var x = vector[0];
        vector[0] = c * x - s * vector[1] - c * center[0] + s * center[1] + center[0];
        vector[1] = s * x + c * vector[1] - s * center[0] - c * center[1] + center[1];
        return vector;
    }
    
    //multiplies the given vectory by the given matrix
    public static multiplyVector2D(vector: number[], matrix: number[]): number[] {
        var x = vector[0];
        var y = vector[1];
        vector[0] = x * matrix[0] + y * matrix[1] + matrix[2];
        vector[1] = x * matrix[3] + y * matrix[4] + matrix[5];
        return vector;
    }
    
    //creates a 3x3 rotation matrix for the given number of degrees
    public static create2DRotationMatrix(degrees: number): number[] {
        var c = Math.cos(degrees * this.oneDeg);
        var s = Math.sin(degrees * this.oneDeg);
        var out = [9];
        out[0] = c;
        out[1] = -s;
        out[2] = 0;
        out[3] = s;
        out[4] = c;
        out[5] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 1;
        return out;
    }
    
    //creates a 4x4 rotation matrix for the given number of degrees
    public static create2DRotationMatrix4(degrees: number): Float32Array {
        var c = Math.cos(degrees * this.oneDeg);
        var s = Math.sin(degrees * this.oneDeg);
        var out = new Float32Array(16);
        out[0] = c;
        out[1] = -s;
        out[2] = 0;
        out[3] = 0;
        out[4] = s;
        out[5] = c;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = 1;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    }
    
    //creates a 2D translation matrix for the given vector
    public static create2DTranslationMatrix(vector: number[]): number[]{
        var out = [9];
        out[0] = 1;
        out[1] = 0;
        out[2] = vector[0];
        out[3] = 0;
        out[4] = 1;
        out[5] = vector[1];
        out[6] = 0;
        out[7] = 0;
        out[8] = 1;
        return out;
    }
    
    //subtracts vector b from vector a
    public static subtract(a: number[], b: number[]): number[]{
        return [a[0] - b[0], a[1] - b[1]];
    }
    
    //creates a 2D scaling matrix
    public static create2DScalingMatrix(factor: number): Float32Array{
        var out = new Float32Array(16);
        out[0] = factor;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = factor;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = 1;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    }
    
    //creates a 2D scaling matrix
    public static create2DInconsistentScalingMatrix(sx: number, sy: number): Float32Array{
        var out = new Float32Array(16);
        out[0] = sx;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = sy;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = 1;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    }
    
    //===== Typescript translations of gl-matrix.js =====
    //multiplies two 3x3 matrices, multiplies a by b and stores the result in out
    public static multiply(out, a, b): void {
        var a00 = a[0],
            a01 = a[1],
            a02 = a[2];
        var a10 = a[3],
            a11 = a[4],
            a12 = a[5];
        var a20 = a[6],
            a21 = a[7],
            a22 = a[8];
        
        var b00 = b[0],
            b01 = b[1],
            b02 = b[2];
        var b10 = b[3],
            b11 = b[4],
            b12 = b[5];
        var b20 = b[6],
            b21 = b[7],
            b22 = b[8];

        out[0] = b00 * a00 + b01 * a10 + b02 * a20;
        out[1] = b00 * a01 + b01 * a11 + b02 * a21;
        out[2] = b00 * a02 + b01 * a12 + b02 * a22;
        
        out[3] = b10 * a00 + b11 * a10 + b12 * a20;
        out[4] = b10 * a01 + b11 * a11 + b12 * a21;
        out[5] = b10 * a02 + b11 * a12 + b12 * a22;
        
        out[6] = b20 * a00 + b21 * a10 + b22 * a20;
        out[7] = b20 * a01 + b21 * a11 + b22 * a21;
        out[8] = b20 * a02 + b21 * a12 + b22 * a22;
    }
    
    //multiplies two 4x4 matrices, multiplies a by b and stores the result in out
    public static multiply4(out, a, b): void {
        var a00 = a[0],
            a01 = a[1],
            a02 = a[2],
            a03 = a[3];
        var a10 = a[4],
            a11 = a[5],
            a12 = a[6],
            a13 = a[7];
        var a20 = a[8],
            a21 = a[9],
            a22 = a[10],
            a23 = a[11];
        var a30 = a[12],
            a31 = a[13],
            a32 = a[14],
            a33 = a[15];

        // Cache only the current line of the second matrix
        var b0 = b[0],
            b1 = b[1],
            b2 = b[2],
            b3 = b[3];
        out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        
        b0 = b[4];b1 = b[5];b2 = b[6];b3 = b[7];
        out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[8];b1 = b[9];b2 = b[10];b3 = b[11];
        out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        
        b0 = b[12];b1 = b[13];b2 = b[14];b3 = b[15];
        out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    }
    
    //translate matrix a by vector v and store the result in out
    public static translate(out, a, v): void {
        var x = v[0],
            y = v[1],
            z = v[2];
        var a00 = void 0,
            a01 = void 0,
            a02 = void 0,
            a03 = void 0;
        var a10 = void 0,
            a11 = void 0,
            a12 = void 0,
            a13 = void 0;
        var a20 = void 0,
            a21 = void 0,
            a22 = void 0,
            a23 = void 0;
        
        if (a === out) {
            out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
            out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
            out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
            out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
        } else {
            a00 = a[0];a01 = a[1];a02 = a[2];a03 = a[3];
            a10 = a[4];a11 = a[5];a12 = a[6];a13 = a[7];
            a20 = a[8];a21 = a[9];a22 = a[10];a23 = a[11];
            
            out[0] = a00;out[1] = a01;out[2] = a02;out[3] = a03;
            out[4] = a10;out[5] = a11;out[6] = a12;out[7] = a13;
            out[8] = a20;out[9] = a21;out[10] = a22;out[11] = a23;
            
            out[12] = a00 * x + a10 * y + a20 * z + a[12];
            out[13] = a01 * x + a11 * y + a21 * z + a[13];
            out[14] = a02 * x + a12 * y + a22 * z + a[14];
            out[15] = a03 * x + a13 * y + a23 * z + a[15];
        }
    }
  
    //create a 4x4 identity matrix
    public static createMatrix(): Float32Array {
        var out = new Float32Array(16);
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = 1;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = 1;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    }
  
    //initialises matrix out with the perspective specified by the y fov, aspect ratio and z-near and z-far parameters
    public static perspective(out, fovy, aspect, near, far): void {
        var f = 1.0 / Math.tan(fovy / 2);
        var nf = 1 / (near - far);
        out[0] = f / aspect;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = f;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = (far + near) * nf;
        out[11] = -1;
        out[12] = 0;
        out[13] = 0;
        out[14] = 2 * far * near * nf;
        out[15] = 0;
    }
    //========== End gl-matrix.js translations ==========
}
/** @end-author Roan Hofland */