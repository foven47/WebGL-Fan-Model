//Set default value for theta
var theta = [0, 0, 0, 0, 0, 0, 0];
var moveLeft = 0;

var BaseUD = 0;
var BaseLR = 1;
var Body = 2;
var HeadUD = 3;
var HeadLR = 4;
var HeadRing = 5;
var Blade = 6;

var modelViewMatrix;

var BASE_HEIGHT = 1.0;
var BASE_WIDTH = 5.0;

var BODY_HEIGHT = 7.0;
var BODY_WIDTH = 1.0;

var HEAD_UD = 0.5;

var HEAD_HEIGHT = 1.5;
var HEAD_WIDTH = 1.5;
var HEAD_Z = 3.0;

var HEAD_RING_HEIGHT = 6.5;
var HEAD_RING_THICK = 1;

var BLADE_HEIGHT = 5.0;
var BLADE_WIDTH = 1.5;
var BLADE_THICK = 0.2;

var modelPositionX = 0.0;
var modelPositionY = -6.0;

var isRotate = false;
var isHeadRotateLR = false;
var toLeft = false;

var bladeSpeed = 0; // Initial rotation speed

//shade, ambient, lighting
var lightPosition = vec4(0, 0, 10.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.8, 0.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess = 10.0;

var ambientProduct = mult(lightAmbient, materialAmbient);
var diffuseProduct = mult(lightDiffuse, materialDiffuse);
var specularProduct = mult(lightSpecular, materialSpecular);

function doWhichKey(e) {
  e = e || window.event;
  let charCode = e.charCode || e.which;
  return String.fromCharCode(charCode);
}

window.addEventListener('keypress', function (e){
  var key = doWhichKey(e);
  console.log("You pressed : " + key);
  if (e.keyCode === 13) { //For start or stop or pause animation
    isHeadRotateLR = !isHeadRotateLR;
  }else if (key == "0" ) { 
    bladeSpeed = 0;
  } else if (key == "1" ) { 
    bladeSpeed = 2;
  } else if (key == "2" ) { 
    bladeSpeed = 5;
  } else if (key == "3" ) { 
    bladeSpeed = 10;
  } else {
    //If user pressed other key, nothing happened
  }
}, false);


window.onload = function init() {
  //Get the html canvas element by id and stored it into canvas
  canvas = document.getElementById("gl-canvas");

  //Set webgl
  gl = WebGLUtils.setupWebGL(canvas);

  //Detect and display message if no webgl
  if (!gl) {
    alert("WebGL isn't available");
  }

  //Set up viewport using the resolution of canvas
  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.clearColor(0.0, 0.0, 0.0, 0.0);

  //Enable the depth testing
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  // Create and initialize  buffer objects

  //Create 3D object : Cylinder
  var myCylinder = cylinder(72, 3, true);
  myCylinder.scale(1.0, 1.0, 1.0); //Smaller the size of cylinder
  myCylinder.rotate(0.0, [1, 1, 1]); //Rotate cylinder a bit
  myCylinder.translate(0.0, 0.0, 0.0); //No movement for cylinder
  baseBuffers = createBuffersForShape(myCylinder); //Create buffer for cylinder
  bodyBuffers = createBuffersForShape(myCylinder); //Create buffer for cylinder
  headButtonBuffers = createBuffersForShape(myCylinder); //Create buffer for cylinder

  myCylinder.rotate(90.0, [1, 0, 0]); //Rotate cylinder a bit
  headBuffers = createBuffersForShape(myCylinder); //Create buffer for sphere

  var myCylinder2 = cylinder(72, 3, false);
  myCylinder2.scale(1.0, 1.0, 1.0); //Smaller the size of cylinder
  myCylinder2.rotate(90.0, [1, 0, 0]); //Rotate cylinder a bit
  myCylinder2.translate(0.0, 0.0, 0.0); //No movement for cylinder
  headRing = createBuffersForShape(myCylinder2);

  //Create 3D shape : Sphere
  var mySphere = sphere(5);
  mySphere.scale(1, 1, 1); //Smaller the size of sphere
  mySphere.translate(0.0, 0.0, 0.0); //
  headUDBuffers = createBuffersForShape(mySphere); //Create buffer for sphere

  //Create 3D object : Cube
  var myCube = cube(1, 0.3);
  myCube.rotate(0.0, [1, 1, 1]); //Rotate cube a bit
  myCube.translate(0.0, 0.0, 0.0); //Move cube to the right
  bladeBuffers = createBuffersForShape(myCube); //Create buffer for cube

  //Configure texture
  function createTexture(id) {
    const image = document.getElementById(id);
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.NEAREST_MIPMAP_LINEAR
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return texture;
  }

  fanTextures = createTexture("woodText");
  plainTexture = createTexture("plainText");

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
  baseUD.addEventListener("input", function () {
    theta[BaseUD] = parseFloat(baseUD.value);
  });

  var baseLR = document.getElementById("baseLR");
  baseLR.addEventListener("input", function () {
    theta[BaseLR] = parseFloat(baseLR.value);
  });

  var headUD = document.getElementById("headUD");
  headUD.addEventListener("input", function () {
    theta[HeadUD] = parseFloat(headUD.value);
  });

  var headLR = document.getElementById("headLR");
  headLR.addEventListener("input", function () {
    theta[HeadLR] = parseFloat(headLR.value);
  });

  var blade = document.getElementById("blade");
  blade.addEventListener("input", function () {
    theta[Blade] = parseFloat(blade.value);
  });

  var positionx = document.getElementById("positionx");
  positionx.addEventListener("input", function () {
    modelPositionX = parseFloat(positionx.value);
  });
  var positiony = document.getElementById("positiony");
  positiony.addEventListener("input", function () {
    modelPositionY = parseFloat(positiony.value);
  });

  document.getElementById("blade-stop-button").onclick = function () {
    bladeSpeed = 0;
  };
  document.getElementById("blade-slow-button").onclick = function () {
    bladeSpeed = 2;
  };
  document.getElementById("blade-normal-button").onclick = function () {
    bladeSpeed = 5;
  };
  document.getElementById("blade-fast-button").onclick = function () {
    bladeSpeed = 10;
  };

  document.getElementById("head-LR-button").onclick = function () {
    isHeadRotateLR = !isHeadRotateLR;
  };

  // Setup ambient color sliders
  document.getElementById("ambientLight").onchange = function () {
    var x = document.getElementById("ambientLight").value;
    lightAmbient = vec4(x, x, 0.1, 1.0);
    ambientProduct = mult(lightAmbient, materialAmbient);
    gl.uniform4fv(
      gl.getUniformLocation(program, "ambientProduct"),
      flatten(ambientProduct)
    );
  };

  //Toggle the light position
  document.getElementById("xlightpositions").onchange = function () {
    var x = document.getElementById("xlightpositions").value;
    lightPosition = vec4(x, 1.0, 1.0, 0.0);
    gl.uniform4fv(
      gl.getUniformLocation(program, "lightPosition"),
      flatten(lightPosition)
    );
  };
  document.getElementById("ylightpositions").onchange = function () {
    var y = document.getElementById("ylightpositions").value;
    lightPosition = vec4(1.0, y, 1.0, 0.0);
    gl.uniform4fv(
      gl.getUniformLocation(program, "lightPosition"),
      flatten(lightPosition)
    );
  };

  //Toggle material shininess
  document.getElementById("materialshininess").onchange = function () {
    materialShininess = document.getElementById("materialshininess").value;
    gl.uniform1f(
      gl.getUniformLocation(program, "shininess"),
      materialShininess
    );
  };

  //Toggle the diffuse light
  document.getElementById("diffuseLight").onchange = function () {
    var x = document.getElementById("diffuseLight").value;
    lightDiffuse = vec4(x, x, 0.1, 1.0);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    gl.uniform4fv(
      gl.getUniformLocation(program, "diffuseProduct"),
      flatten(diffuseProduct)
    );
  };

  //Toggle the specular light
  document.getElementById("specularLight").onchange = function () {
    var x = document.getElementById("specularLight").value;
    lightSpecular = vec4(x, x, 0.1, 1.0);
    specularProduct = mult(lightSpecular, materialSpecular);
    gl.uniform4fv(
      gl.getUniformLocation(program, "specularProduct"),
      flatten(specularProduct)
    );
  };

  document.getElementById("metal-button").onclick = function () {
    fanTextures = createTexture("metalText");
  };

  document.getElementById("wood-button").onclick = function () {
    fanTextures = createTexture("woodText");
  };

  gl.uniform4fv(
    gl.getUniformLocation(program, "ambientProduct"),
    flatten(ambientProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "diffuseProduct"),
    flatten(diffuseProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "specularProduct"),
    flatten(specularProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "lightPosition"),
    flatten(lightPosition)
  );
  gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

  //Render the canvas per frame
  render();
};

//Create the buffers for each shape that parsed in
function createBuffersForShape(data) {
  //Store shape data buffers in vertices array
  const points = data.TriangleVertices;

  //Store shape data buffers in vertex color array
  const vertexcols = data.TriangleVertexColors;

  //Store shape data buffers in texture coordinates array
  const textcords = data.TextureCoordinates;

  //Setting all buffers

  //Vertex color buffer
  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexcols), gl.STATIC_DRAW);

  //Point or vertices buffer
  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  //Texture coordinates buffer
  var tBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(textcords), gl.STATIC_DRAW);

  return {
    cBuffer,
    vBuffer,
    tBuffer,
    numVertices: points.length,
  };
}

//Set attributes for each buffers of shape
function setAttributesForShape({ cBuffer, vBuffer, tBuffer }) {
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

  //Attribute location -- vTexCoord
  gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
  var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
  gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vTexCoord);
}

//Draw shape of the sphere, cyliner and cube by
// Create a buffer object, initialize it, and associate it with the
// associated attribute variable in our vertex shader
function drawBase(shapeBuffers, texture) {
  var s = scalem(BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH);
  var instanceMatrix = mult(translate(0.0, 0.0, 0.0), s);
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  setAttributesForShape(shapeBuffers);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.drawArrays(gl.TRIANGLES, 0, shapeBuffers.numVertices);
}

function drawBody(shapeBuffers, texture) {
  var s = scalem(BODY_WIDTH, BODY_HEIGHT, BODY_WIDTH);
  var instanceMatrix = mult(translate(0.0, 0.0, 0.0), s);
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  setAttributesForShape(shapeBuffers);
  gl.drawArrays(gl.TRIANGLES, 0, shapeBuffers.numVertices);
}
function drawHeadUD(shapeBuffers, texture) {
  var s = scalem(HEAD_UD, HEAD_UD, HEAD_UD);
  var instanceMatrix = mult(translate(0.0, 0.0, 0.0), s);
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  setAttributesForShape(shapeBuffers);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.drawArrays(gl.TRIANGLES, 0, shapeBuffers.numVertices);
}
function drawHead(shapeBuffers, texture) {
  var s = scalem(HEAD_WIDTH, HEAD_HEIGHT, HEAD_Z);
  var instanceMatrix = mult(translate(0.0, 0.0, 0.0), s);
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  setAttributesForShape(shapeBuffers);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.drawArrays(gl.TRIANGLES, 0, shapeBuffers.numVertices);
}
function drawHeadRing(shapeBuffers, texture) {
  var s = scalem(HEAD_RING_HEIGHT, HEAD_RING_HEIGHT, HEAD_RING_THICK);
  var instanceMatrix = mult(translate(0.0, 0.0, 0.0), s);
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  setAttributesForShape(shapeBuffers);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.drawArrays(gl.TRIANGLES, 0, shapeBuffers.numVertices);
}

function drawBlade(shapeBuffers, texture) {
  gl.uniform1i(gl.getUniformLocation(program, "onlyTexture"), 1);

  var s = scalem(BLADE_WIDTH, BLADE_HEIGHT, BLADE_THICK);
  var instanceMatrix = mult(translate(0.0, 0.0, 0.0), s);
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  setAttributesForShape(shapeBuffers);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.drawArrays(gl.TRIANGLES, 0, shapeBuffers.numVertices);

  //2nd Blade
  var s2 = scalem(BLADE_HEIGHT, BLADE_WIDTH, BLADE_THICK);
  var instanceMatrix2 = mult(translate(0.0, 0.0, 0.0), s2);
  var t2 = mult(modelViewMatrix, instanceMatrix2);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t2));
  setAttributesForShape(shapeBuffers);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.drawArrays(gl.TRIANGLES, 0, shapeBuffers.numVertices);

  gl.uniform1i(gl.getUniformLocation(program, "onlyTexture"), 0);
}

function rotatingBlade() {
  theta[Blade] += bladeSpeed; // Increment rotation angle
}

function leftRightHeadAnimation() {
  var targetAngle = 90;
  if (isHeadRotateLR && !toLeft && theta[HeadLR] < targetAngle) {
    theta[HeadLR] += 1;
    if (theta[HeadLR] == targetAngle) {
      toLeft = true;
    }
  }
  if (isHeadRotateLR && toLeft && theta[HeadLR] >= -targetAngle) {
    console.log("To left");
    theta[HeadLR] += -1;
    if (theta[HeadLR] == -targetAngle) {
      toLeft = false;
    }
  }
}

//Program generation function
var render = function () {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniformMatrix4fv(
    gl.getUniformLocation(program, "projectionMatrix"),
    false,
    flatten(projection)
  );

  rotatingBlade();
  leftRightHeadAnimation();

  modelViewMatrix = mat4();

  modelViewMatrix = mult(
    modelViewMatrix,
    translate(modelPositionX, modelPositionY, 0.0)
  );
  modelViewMatrix = mult(modelViewMatrix, rotate(theta[BaseUD], [1, 0, 0])); // Y-axis rotation
  modelViewMatrix = mult(rotate(theta[BaseLR], [0, 1, 0]), modelViewMatrix); // X-axis rotation
  modelViewMatrix = mult(modelViewMatrix, scalem(1, 1, 1));
  drawBase(baseBuffers, fanTextures);

  modelViewMatrix = mult(modelViewMatrix, translate(0.0, 3, 0.0));
  modelViewMatrix = mult(modelViewMatrix, rotate(theta[Body], [1, 0, 0]));
  modelViewMatrix = mult(modelViewMatrix, scalem(1, 1, 1));
  drawBody(bodyBuffers, fanTextures);

  modelViewMatrix = mult(modelViewMatrix, translate(0, 0.5 * BODY_HEIGHT, 0.0));
  modelViewMatrix = mult(modelViewMatrix, rotate(theta[HeadUD], [1, 0, 0])); // Y-axis rotation
  modelViewMatrix = mult(modelViewMatrix, scalem(1, 1, 1));
  drawHeadUD(headUDBuffers, fanTextures);

  modelViewMatrix = mult(modelViewMatrix, translate(0, 0.5 * HEAD_UD, 0.0));
  modelViewMatrix = mult(modelViewMatrix, rotate(theta[HeadLR], [0, 1, 0])); // Y-axis rotation
  modelViewMatrix = mult(modelViewMatrix, scalem(1, 1, 1));
  drawHead(headBuffers, fanTextures);

  modelViewMatrix = mult(modelViewMatrix, translate(0, 0, 0.5 * HEAD_Z));
  modelViewMatrix = mult(modelViewMatrix, rotate(theta[HeadRing], [0, 1, 0])); // Y-axis rotation
  modelViewMatrix = mult(modelViewMatrix, scalem(1, 1, 1));
  drawHeadRing(headRing, fanTextures);

  modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0, 0));
  modelViewMatrix = mult(modelViewMatrix, rotate(theta[Blade], [0, 0, 1]));
  modelViewMatrix = mult(modelViewMatrix, scalem(1, 1, 1));
  drawBlade(bladeBuffers, plainTexture);

  // modelViewMatrix = mat4();
  // modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.0, 0.0));
  // modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], [1, 0, 0]));
  // modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], [0, 1, 0]));
  // modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], [0, 0, 1]));
  // drawCylinder();

  //Request render canvas per frame
  requestAnimFrame(render);
};
