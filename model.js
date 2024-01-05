
var NumVertices = 48; //(6 faces)(2 triangles/face)(3 vertices/triangle)

var points = [];
var colors = [];

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
];

// RGBA colors
var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];



// Parameters controlling the size of the Robot's arm

var BASE_HEIGHT = 1.0;
var BASE_WIDTH  = 10.0;
var BODY_HEIGHT = 10.0;
var BODY_WIDTH  = 1;
var HEAD_HEIGHT = 3.0;
var HEAD_WIDTH  = 3.0;

//!!!
var BLADE_THICKNESS = 0.5;
var BLADE_HORIZONTAL_HEIGHT = 13.0; // Height of the cross
var BLADE_HORIZONTAL_WIDTH = 1.0;
var BLADE_VERTICAL_WIDTH = 13.0;  // Thickness of the cross
var BLADE_VERTICAL_HEIGHT = 1.0; 
//!!!

// Shader transformation matrices

var modelViewMatrix, projectionMatrix;

// Array of rotation angles (in degrees) for each rotation axis

var Base = 0;
var Body = 1;
var Head = 2;

//!!!
var Blade = 3;
var HeadUD = 4;
//!!!

//added 1 array
var theta= [ 0, 0, 0, 0, 0];

var angle = 0;

var modelViewMatrixLoc;

var vBuffer, cBuffer;

//----------------------------------------------------------------------------

function quad(  a,  b,  c,  d ) {
    colors.push(vertexColors[a]); 
    points.push(vertices[a]); 
    colors.push(vertexColors[a]); 
    points.push(vertices[b]); 
    colors.push(vertexColors[a]); 
    points.push(vertices[c]);
    colors.push(vertexColors[a]); 
    points.push(vertices[a]); 
    colors.push(vertexColors[a]); 
    points.push(vertices[c]); 
    colors.push(vertexColors[a]); 
    points.push(vertices[d]); 
}


function colorCube() {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );

    
}


//____________________________________________

// Remmove when scale in MV.js supports scale matrices

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}


//--------------------------------------------------


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );
    gl.enable( gl.DEPTH_TEST ); 
    
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    
    gl.useProgram( program );

    colorCube();
    
    // Load shaders and use the resulting shader program
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );    
    gl.useProgram( program );

    // Create and initialize  buffer objects
    
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    document.getElementById("slider1").onchange = function() {
        theta[0] = event.srcElement.value;
    };
    document.getElementById("slider2").onchange = function() {
         theta[1] = event.srcElement.value;
    };
    document.getElementById("slider3").onchange = function() {
         theta[2] =  event.srcElement.value;
    };
    //!!!
    document.getElementById("slider4").onchange = function() {
        theta[3] =  event.srcElement.value;
   };
   document.getElementById("slider5").onchange = function() {
    theta[4] =  event.srcElement.value;
};
   ///!!!
    
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    var aspect = canvas.width / canvas.height;
    projectionMatrix = ortho(-10 * aspect, 10 * aspect, -10, 10, -10, 10);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );
    
    render();
}

//----------------------------------------------------------------------------


function base() {
    var s = scale4(BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * BASE_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------


function head() {
    var s = scale4(HEAD_WIDTH, HEAD_HEIGHT, HEAD_WIDTH);
    var instanceMatrix = mult(translate( 0.0,  0.5 * HEAD_HEIGHT, 0.0 ),s);    
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------


function body()
{
    var s = scale4(BODY_WIDTH, BODY_HEIGHT, BODY_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * BODY_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------
//!!!

function blade() {

    
    // Draw the vertical part of the cross
    var verticalArm = scale4(BLADE_HORIZONTAL_WIDTH, BLADE_HORIZONTAL_HEIGHT,BLADE_THICKNESS);
    var verticalInstanceMatrix = mult(translate(0.0, 0 * BLADE_HORIZONTAL_HEIGHT, 0.0), verticalArm);
    var verticalMatrix = mult(modelViewMatrix, verticalInstanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(verticalMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);

    // Draw the horizontal part of the cross
    var horizontalArm = scale4(BLADE_VERTICAL_WIDTH, BLADE_VERTICAL_HEIGHT, BLADE_THICKNESS);
    var horizontalInstanceMatrix = mult(translate(0.0, 0 * BLADE_HORIZONTAL_HEIGHT, 0.0), horizontalArm);
    var horizontalMatrix = mult(modelViewMatrix, horizontalInstanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(horizontalMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}




//!!!

var render = function() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    modelViewMatrix = mult(translate(0.0, -10 * BASE_HEIGHT, 0.0), rotate(theta[Base], 0, 1, 0));
    base();
    
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, BASE_HEIGHT, 0.0)); 
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[Body], 0, 0, 1 ));
    body();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, BODY_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[HeadUD], 1, 0, 0)); // upper arm up/down rotation
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[Head], 0, 1, 0 ));
    head();

    //!!!
    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, 0.5*HEAD_HEIGHT, (0.5*HEAD_WIDTH) + (0.5*BLADE_THICKNESS)));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[Blade], 0, 0, 1) );
    blade();

    //!!!



    requestAnimFrame(render);
}



