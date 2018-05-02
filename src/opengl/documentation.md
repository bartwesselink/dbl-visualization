# OpenGL documentation
For people working with the OpenGL abstraction layer. These are the only methods that you should ever need all collected in one document.

# Constructor
`var gl = new OpenGL(WebGLRenderingContext)`

# General
- `public releaseBuffers(): void`    
Releases all the buffers currently held in memory, should always be called when recomputing the scene.
- `public useShader(shader: Shader): void`    
Sets the shader to use for rendering the scene.
- `public resize(width: number, height: number): void`    
Resizes the OpenGL viewport for to the optimal size for the given dimensions. Should be called on canvas resize events.
- `public render(): void`    
Renders the OpenGL scene.
- `public initShaders(): Shader`    
Intialises the only shader we have at the moment.

# Rendering

## Quads
- `public drawAAQuad(x: number, y: number, width: number, height: number, color: number[]): void`    
Draws a quad with the lower left corner at the given x and y coordinate. A width and height relative to that point and the given color.
- `public drawRotatedQuad(x: number, y: number, width: number, height: number, rotation: number, color: number[]): void`    
Draws a quad with a given center coordinate, width, height, rotation and color. The rotation is consistent with the unit circle meaning that the quad will rotate anticlockwise.


# Private subroutines

-  `private drawQuadImpl(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, color: number[]): void`
Draws the quad specified by the 4 sets of coordinates and the given color. x1 and y1 specify the upper right corner of the quad, x2 and y2 specify the upper left corner of the quad, x3 and y3 specify the lower right corner of the quad and x4 and y4 specify the lower left corner of the quad.
