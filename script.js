
"use strict";

var vs = `#version 300 es

in vec4 a_position;
in vec4 a_color;

uniform mat4 u_matrix;

out vec4 v_color;

void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;

  // Pass the color to the fragment shader.
  v_color = a_color;
}
`;

var fs = `#version 300 es
precision highp float;

// Passed in from the vertex shader.
in vec4 v_color;

uniform vec4 u_colorMult;
uniform vec4 u_colorOffset;

out vec4 outColor;

void main() {
   outColor = v_color * u_colorMult + u_colorOffset;
}
`;

var Node = function() {
  this.children = [];
  this.localMatrix = m4.identity();
  this.worldMatrix = m4.identity();
};

Node.prototype.setParent = function(parent) {
  // remove us from our parent
  if (this.parent) {
    var ndx = this.parent.children.indexOf(this);
    if (ndx >= 0) {
      this.parent.children.splice(ndx, 1);
    }
  }

  // Add us to our new parent
  if (parent) {
    parent.children.push(this);
  }
  this.parent = parent;
};

Node.prototype.updateWorldMatrix = function(matrix) {
  if (matrix) {
    // a matrix was passed in so do the math
    m4.multiply(matrix, this.localMatrix, this.worldMatrix);
  } else {
    // no matrix was passed in so just copy.
    m4.copy(this.localMatrix, this.worldMatrix);
  }

  // now process all the children
  var worldMatrix = this.worldMatrix;
  this.children.forEach(function(child) {
    child.updateWorldMatrix(worldMatrix);
  });
};


 //                 Objetos importantes                 \\
// - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - \\

window.infoMundo = {
  tempoPercorrido: 0,   // em dias terrestres
  escala: 0.0001,
}

window.infoCamera = {
  x: 700,
  y: 0,
  z: 0,
  velocidade: 1,
  leftDir: [0, 0, -1],
  upDir: [0, 1, 0],
  yaw: Math.PI,
  pitch: 0,
  lookDir: [
            arredondado (Math.cos(0) * Math.cos(Math.PI) ),
            arredondado (Math.sin(0) ),
            arredondado (Math.cos(0) * Math.sin(Math.PI) )
          ],
};

// mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto
let infoMercury = await carregarDadosPlaneta("Planets/Mercury.txt");
let infoVenus = await carregarDadosPlaneta("Planets/Venus.txt");
let infoEarth = await carregarDadosPlaneta("Planets/Earth.txt");
let infoMars = await carregarDadosPlaneta("Planets/Mars.txt");
let infoJupiter = await carregarDadosPlaneta("Planets/Jupiter.txt");
let infoSaturn = await carregarDadosPlaneta("Planets/Saturn.txt");
let infoUranus = await carregarDadosPlaneta("Planets/Uranus.txt");
let infoNeptune = await carregarDadosPlaneta("Planets/Neptune.txt");
let infoPluto = await carregarDadosPlaneta("Planets/Pluto.txt");
let infoMoon = await carregarDadosPlaneta("Planets/Moon.txt");

console.log(infoMercury, infoVenus, infoEarth, infoMars, infoJupiter, infoSaturn, infoUranus, infoNeptune, infoPluto, infoMoon);



// - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - \\


function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }


  // Tell the twgl to match position with a_position, n
  // normal with a_normal etc..
  twgl.setAttributePrefix("a_");

  var sphereBufferInfo = flattenedPrimitives.createSphereBufferInfo(gl, 10, 12, 6);
                                // context, radius, subdivisionsAxis, subdivisionsHeight);

  // setup GLSL program
  var programInfo = twgl.createProgramInfo(gl, [vs, fs]);

  var sphereVAO = twgl.createVAOFromBufferInfo(gl, programInfo, sphereBufferInfo);

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  var fieldOfViewRadians = degToRad(60);

  var objectsToDraw = [];
  var objects = [];

  // Let's make all the nodes
  var solarSystemNode = new Node();


  // mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto

  var mercuryOrbitNode = new Node();
  // mercury orbit 150 units from the sun
  var {x, y, z} = getOrbitNode(infoMercury);
  console.log("Mercury orbit node: ", x, y, z);
  mercuryOrbitNode.localMatrix = m4.translation(x, y, z);

  var venusOrbitNode = new Node();
  // venus orbit 150 units from the sun
  var {x, y, z} = getOrbitNode(infoVenus);
  console.log("Venus orbit node: ", x, y, z);
  venusOrbitNode.localMatrix = m4.translation(x, y, z);

  var earthOrbitNode = new Node();
  // earth orbit 100 units from the sun
  // earthOrbitNode.localMatrix = m4.translation(400, 0, 0);
  var {x, y, z} = getOrbitNode(infoEarth);
  console.log("Earth orbit node: ", x, y, z);
  earthOrbitNode.localMatrix = m4.translation(x, y, z);

  var marsOrbitNode = new Node();
  // mars orbit 150 units from the sun
  var {x, y, z} = getOrbitNode(infoMars);
  console.log("Mars orbit node: ", x, y, z);
  marsOrbitNode.localMatrix = m4.translation(x, y, z);

  var mercuryOrbitNode = new Node();
  // mercury orbit 150 units from the sun
  var {x, y, z} = getOrbitNode(infoMercury);
  console.log("Mercury orbit node: ", x, y, z);
  mercuryOrbitNode.localMatrix = m4.translation(x, y, z);

  var venusOrbitNode = new Node();
  // venus orbit 150 units from the sun
  var {x, y, z} = getOrbitNode(infoVenus);
  console.log("Venus orbit node: ", x, y, z);
  venusOrbitNode.localMatrix = m4.translation(x, y, z);

  var jupiterOrbitNode = new Node();
  // jupiter orbit 150 units from the sun
  var {x, y, z} = getOrbitNode(infoJupiter);
  console.log("Jupiter orbit node: ", x, y, z);
  jupiterOrbitNode.localMatrix = m4.translation(x, y, z);

  var saturnOrbitNode = new Node();
  // saturn orbit 150 units from the sun
  var {x, y, z} = getOrbitNode(infoSaturn);
  console.log("Saturn orbit node: ", x, y, z);
  saturnOrbitNode.localMatrix = m4.translation(x, y, z);

  var uranusOrbitNode = new Node();
  // uranus orbit 150 units from the sun
  var {x, y, z} = getOrbitNode(infoUranus);
  console.log("Uranus orbit node: ", x, y, z);
  uranusOrbitNode.localMatrix = m4.translation(x, y, z);
  
  var neptuneOrbitNode = new Node();
  // neptune orbit 150 units from the sun
  var {x, y, z} = getOrbitNode(infoNeptune);
  console.log("Neptune orbit node: ", x, y, z);
  neptuneOrbitNode.localMatrix = m4.translation(x, y, z);

  var plutoOrbitNode = new Node();
  // pluto orbit 150 units from the sun
  var {x, y, z} = getOrbitNode(infoPluto);
  console.log("Pluto orbit node: ", x, y, z);
  plutoOrbitNode.localMatrix = m4.translation(x, y, z);

  var moonOrbitNode = new Node();
  // moon 20 units from the earth
  var {x, y, z} = getOrbitNode(infoMoon);
  console.log("Moon orbit node: ", x, y, z);
  moonOrbitNode.localMatrix = m4.translation(x, y, z);

  
  var marsOrbitNode = new Node();
  // mars orbit 150 units from the sun
  marsOrbitNode.localMatrix = m4.translation(500, 0, 0);

  var mercuryOrbitNode = new Node();
  // mercury orbit 150 units from the sun
  mercuryOrbitNode.localMatrix = m4.translation(200, 0, 0);

  var venusOrbitNode = new Node();
  // venus orbit 150 units from the sun
  venusOrbitNode.localMatrix = m4.translation(300, 0, 0);

  var jupiterOrbitNode = new Node();
  // jupiter orbit 150 units from the sun
  jupiterOrbitNode.localMatrix = m4.translation(600, 0, 0);

  var saturnOrbitNode = new Node();
  // saturn orbit 150 units from the sun
  saturnOrbitNode.localMatrix = m4.translation(700, 0, 0);

  var uranusOrbitNode = new Node();
  // uranus orbit 150 units from the sun
  uranusOrbitNode.localMatrix = m4.translation(800, 0, 0);

  var neptuneOrbitNode = new Node();
  // neptune orbit 150 units from the sun
  neptuneOrbitNode.localMatrix = m4.translation(900, 0, 0);

  var plutoOrbitNode = new Node();
  // pluto orbit 150 units from the sun
  plutoOrbitNode.localMatrix = m4.translation(1000, 0, 0);

  var moonOrbitNode = new Node();
  // moon 20 units from the earth
  moonOrbitNode.localMatrix = m4.translation(30, 0, 0);


  // - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - \\


  var sunNode = new Node();
  sunNode.localMatrix = m4.scaling(5, 5, 5);  // sun a the center
  sunNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.6, 0.6, 0, 1], // yellow
      u_colorMult:   [0.4, 0.4, 0, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };

  var earthNode = new Node();
  earthNode.localMatrix = m4.scaling(2, 2, 2);   // make the earth twice as large
  earthNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.2, 0.6, 0.0, 0.2],  // blue-green
      u_colorMult:   [0.3, 0.5, 0.2, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };


  var marsNode = new Node();
  marsNode.localMatrix = m4.scaling(2, 2, 2);
  marsNode.drawInfo = {
    uniforms: {
      u_colorOffset: [1, 0.2, 0.3, 1],  // orange
      u_colorMult:   [0.1, 0.5, 0.2, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };

  // - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - \\

  var mercuryNode = new Node();
  mercuryNode.localMatrix = m4.scaling(2, 2, 2);
  mercuryNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.6, 0.6, 0.6, 1],  // gray
      u_colorMult:   [0.1, 0.1, 0.1, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };

  var venusNode = new Node();
  venusNode.localMatrix = m4.scaling(2, 2, 2);
  venusNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.8, 0.6, 0.4, 1],  // light brown
      u_colorMult:   [0.2, 0.2, 0.2, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };

  var jupiterNode = new Node();
  jupiterNode.localMatrix = m4.scaling(2, 2, 2);
  jupiterNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.8, 0.5, 0.2, 1],  // light brown
      u_colorMult:   [0.2, 0.2, 0.2, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };

  var saturnNode = new Node();
  saturnNode.localMatrix = m4.scaling(2, 2, 2);
  saturnNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.8, 0.6, 0.4, 1],  // light brown
      u_colorMult:   [0.2, 0.2, 0.2, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };

  var uranusNode = new Node();
  uranusNode.localMatrix = m4.scaling(2, 2, 2);
  uranusNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.4, 0.6, 0.8, 1],  // light blue
      u_colorMult:   [0.2, 0.2, 0.2, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };

  var neptuneNode = new Node();
  neptuneNode.localMatrix = m4.scaling(2, 2, 2);
  neptuneNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.2, 0.4, 0.6, 1],  // dark blue
      u_colorMult:   [0.2, 0.2, 0.2, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };

  var plutoNode = new Node();
  plutoNode.localMatrix = m4.scaling(2, 2, 2);
  plutoNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.5, 0.5, 0.5, 1],  // gray
      u_colorMult:   [0.1, 0.1, 0.1, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };

  // - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - \\

  var moonNode = new Node();
  moonNode.localMatrix = m4.scaling(0.4, 0.4, 0.4);
  moonNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.6, 0.6, 0.6, 1],  // gray
      u_colorMult:   [0.1, 0.1, 0.1, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };

  // connect the celetial objects
  sunNode.setParent(solarSystemNode);
  earthOrbitNode.setParent(solarSystemNode);
  earthNode.setParent(earthOrbitNode);
  marsOrbitNode.setParent(solarSystemNode);
  marsNode.setParent(marsOrbitNode);
  // - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - \\
  mercuryOrbitNode.setParent(solarSystemNode);
  mercuryNode.setParent(mercuryOrbitNode);
  venusOrbitNode.setParent(solarSystemNode);
  venusNode.setParent(venusOrbitNode);
  jupiterOrbitNode.setParent(solarSystemNode);
  jupiterNode.setParent(jupiterOrbitNode);
  saturnOrbitNode.setParent(solarSystemNode);
  saturnNode.setParent(saturnOrbitNode);
  uranusOrbitNode.setParent(solarSystemNode);
  uranusNode.setParent(uranusOrbitNode);
  neptuneOrbitNode.setParent(solarSystemNode);
  neptuneNode.setParent(neptuneOrbitNode);
  plutoOrbitNode.setParent(solarSystemNode);
  plutoNode.setParent(plutoOrbitNode);
  // - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - \\
  moonOrbitNode.setParent(earthOrbitNode);
  moonNode.setParent(moonOrbitNode);

  var objects = [
    sunNode,
    earthNode,
    marsNode,
    // - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - \\
    mercuryNode,
    venusNode,
    jupiterNode,
    saturnNode,
    uranusNode,
    neptuneNode,
    plutoNode,
    // - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - \\
    moonNode,
  ];

  var objectsToDraw = [
    sunNode.drawInfo,
    earthNode.drawInfo,
    marsNode.drawInfo,
    // - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - \\
    mercuryNode.drawInfo,
    venusNode.drawInfo,
    jupiterNode.drawInfo,
    saturnNode.drawInfo,
    uranusNode.drawInfo,
    neptuneNode.drawInfo,
    plutoNode.drawInfo,
    // - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - \\
    moonNode.drawInfo,
  ];

  requestAnimationFrame(drawScene);

  // Draw the scene.
  function drawScene(time) {
    time *= 0.001;

    twgl.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // Clear the canvas AND the depth buffer.
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    // Compute the projection matrix
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 1;
    const zFar = 60000;
    var projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    // Compute the camera's matrix using look at.
    var cameraPosition = [infoCamera.x, infoCamera.y, infoCamera.z]; 
    var target = [cameraPosition[0] + infoCamera.lookDir[0], cameraPosition[1] + infoCamera.lookDir[1], cameraPosition[2] + infoCamera.lookDir[2]];
    // var up = [0, 0, 1];
    var cameraMatrix = m4.lookAt(cameraPosition, target, infoCamera.upDir);
    

    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);

    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);


    // mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto, moon

    var {x, y, z} = getOrbitNode(infoMercury);
    mercuryOrbitNode.localMatrix = m4.translation(x, y, z);

    var {x, y, z} = getOrbitNode(infoVenus);
    venusOrbitNode.localMatrix = m4.translation(x, y, z);

    var {x, y, z} = getOrbitNode(infoEarth);
    earthOrbitNode.localMatrix = m4.translation(x, y, z);

    var {x, y, z} = getOrbitNode(infoMars);
    marsOrbitNode.localMatrix = m4.translation(x, y, z);

    var {x, y, z} = getOrbitNode(infoJupiter);
    jupiterOrbitNode.localMatrix = m4.translation(x, y, z);

    // a partir desse aqui, começa a ficar bem distante...

    
    var {x, y, z} = getOrbitNode(infoSaturn);
    saturnOrbitNode.localMatrix = m4.translation(x, y, z);

    var {x, y, z} = getOrbitNode(infoUranus);
    uranusOrbitNode.localMatrix = m4.translation(x, y, z);

    var {x, y, z} = getOrbitNode(infoNeptune);
    neptuneOrbitNode.localMatrix = m4.translation(x, y, z);

    var {x, y, z} = getOrbitNode(infoPluto);
    plutoOrbitNode.localMatrix = m4.translation(x, y, z);

    var {x, y, z} = getOrbitNode(infoMoon);
    moonOrbitNode.localMatrix = m4.translation(x, y, z);



    // update the local matrices for each object.
    m4.multiply(m4.yRotation(0.01), earthOrbitNode.localMatrix, earthOrbitNode.localMatrix);
    m4.multiply(m4.yRotation(0.01), marsOrbitNode.localMatrix, marsOrbitNode.localMatrix);
    m4.multiply(m4.yRotation(0.01), moonOrbitNode.localMatrix, moonOrbitNode.localMatrix);
    // spin the sun
    m4.multiply(m4.yRotation(0.005), sunNode.localMatrix, sunNode.localMatrix);
    // spin the earth
    m4.multiply(m4.yRotation(0.05), earthNode.localMatrix, earthNode.localMatrix);
    // spin mars
    m4.multiply(m4.yRotation(0.05), marsNode.localMatrix, marsNode.localMatrix);
    
    // - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - \\

    // spin mercury
    m4.multiply(m4.yRotation(0.02), mercuryOrbitNode.localMatrix, mercuryOrbitNode.localMatrix);
    // spin venus
    m4.multiply(m4.yRotation(0.02), venusOrbitNode.localMatrix, venusOrbitNode.localMatrix);
    // spin jupiter
    m4.multiply(m4.yRotation(0.01), jupiterOrbitNode.localMatrix, jupiterOrbitNode.localMatrix);
    // spin saturn
    m4.multiply(m4.yRotation(0.01), saturnOrbitNode.localMatrix, saturnOrbitNode.localMatrix);
    // spin uranus
    m4.multiply(m4.yRotation(0.01), uranusOrbitNode.localMatrix, uranusOrbitNode.localMatrix);
    // spin neptune
    m4.multiply(m4.yRotation(0.01), neptuneOrbitNode.localMatrix, neptuneOrbitNode.localMatrix);
    // spin pluto
    m4.multiply(m4.yRotation(0.01), plutoOrbitNode.localMatrix, plutoOrbitNode.localMatrix);

    // - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - \\

    // spin the moon
    m4.multiply(m4.yRotation(-0.01), moonNode.localMatrix, moonNode.localMatrix);

    // Update all world matrices in the scene graph
    solarSystemNode.updateWorldMatrix();

    // Compute all the matrices for rendering
    objects.forEach(function(object) {
        object.drawInfo.uniforms.u_matrix = m4.multiply(viewProjectionMatrix, object.worldMatrix);
    });

    // ------ Draw the objects -------- \\

    twgl.drawObjectList(gl, objectsToDraw);

    requestAnimationFrame(drawScene);
  }
}

main();
