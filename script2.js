

//Set default value for theta
var theta = [0, 0, 0, 0, 0, 0 ];
var moveLeft =0;

var BaseUD = 0;
var BaseLR = 1;
var Body = 2;
var HeadUD =3;
var HeadLR = 4;
var Blade =5;

var modelViewMatrix;

var BASE_HEIGHT = 1.0;
var BASE_WIDTH  = 5.0;

var BODY_HEIGHT = 5.0;
var BODY_WIDTH  = 1.0;

var HEAD_SIZE = 1.0;

var BLADE_HEIGHT =5.0;
var BLADE_WIDTH = 1.5;
var BLADE_THICK = 0.2;


window.onload = function init() {

  //Get the html canvas element by id and stored it into canvas
  canvas = document.getElementById("gl-canvas");

  //Set webgl
  gl = WebGLUtils.setupWebGL(canvas);

  //Detect and display message if no webgl
  if (!gl){ alert("WebGL isn't available");}

  //Set up viewport using the resolution of canvas
  gl.viewport(0, 0, canvas.width, canvas.height);
  
  gl.clearColor( 0.5, 0.5, 0.5, 1.0 );

  //Enable the depth testing
  gl.enable(gl.DEPTH_TEST);



    // Create and initialize  buffer objects





  //Create 3D object : Cylinder
  var myCylinder = cylinder(72, 3, true);
  myCylinder.scale(1.0, 1.0, 1.0); //Smaller the size of cylinder
  myCylinder.rotate(0.0, [1, 1, 1]); //Rotate cylinder a bit
  myCylinder.translate(0.0, 0.0, 0.0); //No movement for cylinder
  baseBuffers = createBuffersForShape(myCylinder); //Create buffer for cylinder
  bodyBuffers = createBuffersForShape(myCylinder); //Create buffer for cylinder



   //Create 3D shape : Sphere
   var mySphere = sphere(5);
   mySphere.scale(1, 1, 1); //Smaller the size of sphere
   mySphere.translate(0.0, 0.0, 0.0); //
   headBuffers = createBuffersForShape(mySphere); //Create buffer for sphere

  //Create 3D object : Cube
  var myCube = cube(1);
  myCube.rotate(0.0, [1, 1, 1]); //Rotate cube a bit
  myCube.translate(0.0, 0.0, 0.0); //Move cube to the right
  bladeBuffers = createBuffersForShape(myCube); //Create buffer for cube

    //Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    //Prepare model view
  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");


  var aspect = canvas.width / canvas.height;

   //Set the projection of orthographic (representing 3D objects in 2D screen)
   projection = ortho(-10 * aspect, 10 * aspect, -10, 10, -10, 10);

   var baseUD = document.getElementById("baseUD");
   baseUD.addEventListener("input", function() {
     theta[BaseUD] = parseFloat(baseUD.value);
     render();
   });

   var baseLR = document.getElementById("baseLR");
   baseLR.addEventListener("input", function() {
     theta[BaseLR] = parseFloat(baseLR.value);
     render();
   });

   var headUD = document.getElementById("headUD");
   headUD.addEventListener("input", function() {
     theta[HeadUD] = parseFloat(headUD.value);
     render();
   });

   var headLR = document.getElementById("headLR");
   headLR.addEventListener("input", function() {
     theta[HeadLR] = parseFloat(headLR.value);
     render();
   });

   var blade = document.getElementById("blade");
   blade.addEventListener("input", function() {
     theta[Blade] = parseFloat(blade.value);
     render();
   });
   
  //Render the canvas per frame
  render();
}

//Create the buffers for each shape that parsed in
function createBuffersForShape(data) {


  
    //Store shape data buffers in vertices array
    const points = data.TriangleVertices;
  
    //Store shape data buffers in vertex color array
    const vertexcols = data.TriangleVertexColors;
  
 
  
    //Setting all buffers
  

    //Vertex color buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexcols), gl.STATIC_DRAW);
  
    //Point or vertices buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
  

  
    return {
      cBuffer,
      vBuffer,
      numVertices: points.length
    };
  }

//Set attributes for each buffers of shape
function setAttributesForShape({
    cBuffer,
    vBuffer,
  }) {
  
  

  
    //Attribute location -- vColor
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
  
    //Attribute location -- vPosition
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

  }

  //Draw shape of the sphere, cyliner and cube by
// Create a buffer object, initialize it, and associate it with the
// associated attribute variable in our vertex shader
function drawBase(shapeBuffers) {
    var s = scalem(BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.0, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
    setAttributesForShape(shapeBuffers);
    gl.drawArrays(gl.TRIANGLES, 0, shapeBuffers.numVertices);
}

function drawBody(shapeBuffers) {
    var s = scalem(BODY_WIDTH, BODY_HEIGHT, BODY_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.0, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
    setAttributesForShape(shapeBuffers);
    gl.drawArrays(gl.TRIANGLES, 0, shapeBuffers.numVertices);
}
function drawHead(shapeBuffers) {
    var s = scalem(HEAD_SIZE, HEAD_SIZE, HEAD_SIZE);
    var instanceMatrix = mult( translate( 0.0, 0.0, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
    setAttributesForShape(shapeBuffers);
    gl.drawArrays(gl.TRIANGLES, 0, shapeBuffers.numVertices);
}
function drawBlade(shapeBuffers) {
    var s = scalem(BLADE_WIDTH, BLADE_HEIGHT, BLADE_THICK);
    var instanceMatrix = mult( translate( 0.0, 0.0, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
    setAttributesForShape(shapeBuffers);
    gl.drawArrays(gl.TRIANGLES, 0, shapeBuffers.numVertices);
}





//Program generation function
var render = function () {
    

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projection));

    // Example: Auto-rotate around the y-axis
    // theta[BaseUD] += 0.5; // Increment rotation angle

    // moveLeft +=0.01;

    modelViewMatrix = mat4();

    modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.0, 0.0)); 
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[BaseUD], [1, 0, 0])); // Y-axis rotation
    // modelViewMatrix = mult(modelViewMatrix, rotate(theta[BaseLR], [0, 1, 0])); // Y-axis rotation

    modelViewMatrix = mult(rotate(theta[BaseLR], [0, 1, 0]), modelViewMatrix); // X-axis rotation
    modelViewMatrix = mult(modelViewMatrix, scalem(1,1,1));
    drawBase(baseBuffers);




    modelViewMatrix = mult(modelViewMatrix, translate(0.0, 2*BASE_HEIGHT, 0.0)); 
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[Body], [1, 0, 0]));
    modelViewMatrix = mult(modelViewMatrix, scalem(1,1,1));
    drawBody(bodyBuffers);

    modelViewMatrix = mult(modelViewMatrix, translate(0, 0.5*BODY_HEIGHT, 0.0)); 
    // modelViewMatrix = mult(modelViewMatrix, rotate(theta[HeadUD], [1, 0, 0])); // Y-axis rotation
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[HeadLR], [0, 1, 0])); // Y-axis rotation

    // modelViewMatrix = mult(rotate(theta[HeadLR], [0, 1, 0]), modelViewMatrix); // X-axis rotation
    modelViewMatrix = mult(modelViewMatrix, scalem(1,1,1));
    drawHead(headBuffers);

    modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.0, HEAD_SIZE+BLADE_THICK)); 
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[Blade], [0, 0, 1]));
    modelViewMatrix = mult(modelViewMatrix, scalem(1,1,1));
    drawBlade(bladeBuffers);



    // modelViewMatrix = mat4();
    // modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.0, 0.0)); 
    // modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], [1, 0, 0]));
    // modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], [0, 1, 0]));
    // modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], [0, 0, 1]));
    // drawCylinder();

  
    //Request render canvas per frame
    requestAnimFrame(render);
  }
  