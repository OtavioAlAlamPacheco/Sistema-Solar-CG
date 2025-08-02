
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




import {
  carregarArquivo,
  criarBufferDaOrbita,
  atualizarBufferDaOrbita,
  cameraParaPlaneta,
  carregarDadosPlaneta,
  arredondado,
  getOrbitNode,
  calcularOrbita
} from './functions.js';


 //                 Objetos importantes                 \\
// - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - \\

export var infoMundo = {
  tempoPercorrido: 0,   // em dias terrestres
  tempoMax: 10747,
  escala: 0.0001,
  contadorAPAGAR: 0,
}

export var infoCamera = {
  x: 70000,
  y: 0,
  z: 0,
  velocidade: 10,
  leftDir: [0, 0, -1],
  upDir: [0, 1, 0],
  yaw: Math.PI,
  pitch: 0,
  lookDir: [
            arredondado (Math.cos(0) * Math.cos(Math.PI) ),
            arredondado (Math.sin(0) ),
            arredondado (Math.cos(0) * Math.sin(Math.PI) )
          ],

  cameraSolta: true,
  proximoPlaneta: 0,
  // 0 = sol, 1 = mercury, 2 = venus, 3 = earth, 4 = moon, 5 = mars, 6 = jupiter, 7 = saturn
};


export let posicoesMercury = await carregarArquivo("Planets/Mercury.txt");
export let posicoesVenus = await carregarArquivo("Planets/Venus.txt");
export let posicoesEarth = await carregarArquivo("Planets/Earth.txt");
export let posicoesMars = await carregarArquivo("Planets/Mars.txt");
export let posicoesJupiter = await carregarArquivo("Planets/Jupiter.txt");
export let posicoesSaturn = await carregarArquivo("Planets/Saturn.txt");
export let posicoesMoon = await carregarArquivo("Planets/Moon.txt");

    // esses aqui não tem lá no site da NASA
// let posicoesUranus = await carregarArquivo("Planets/Uranus.txt");
// let posicoesNeptune = await carregarArquivo("Planets/Neptune.txt");
// let posicoesPluto = await carregarArquivo("Planets/Pluto.txt");

  // períodos orbitais
let periodoMercury = 88;
let periodoVenus = 225;
let periodoEarth = 365;
let periodoMoon = 27;
let periodoMars = 687;
let periodoJupiter = 4331;
let periodoSaturn = 10747;



 //                 Criando os buffers                  \\
// - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - \\

var canvas = document.querySelector("#canvas");
var gl = canvas.getContext("webgl2");

const bufferMercury = criarBufferDaOrbita(gl, periodoMercury, posicoesMercury);
const bufferVenus   = criarBufferDaOrbita(gl, periodoVenus, posicoesVenus); 
const bufferEarth   = criarBufferDaOrbita(gl, periodoEarth, posicoesEarth); 
const bufferMars    = criarBufferDaOrbita(gl, periodoMars, posicoesMars); 
const bufferJupiter = criarBufferDaOrbita(gl, periodoJupiter, posicoesJupiter); 
const bufferSaturn  = criarBufferDaOrbita(gl, periodoSaturn, posicoesSaturn); 
const bufferMoon    = criarBufferDaOrbita(gl, periodoMoon, posicoesMoon); 

const bufferOrbita = {
  mercury: bufferMercury,
  venus: bufferVenus,
  earth: bufferEarth,
  mars: bufferMars,
  jupiter: bufferJupiter,
  saturn: bufferSaturn,
  moon: bufferMoon
};






// mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto
let infoMercury = await carregarDadosPlaneta("Planets antigo/Mercury.txt");
let infoVenus = await carregarDadosPlaneta("Planets antigo/Venus.txt");

let infoEarth = await carregarDadosPlaneta("Planets antigo/Earth.txt");
infoEarth.posicoes = calcularOrbita(infoEarth);

let infoMars = await carregarDadosPlaneta("Planets antigo/Mars.txt");
let infoJupiter = await carregarDadosPlaneta("Planets antigo/Jupiter.txt");
let infoSaturn = await carregarDadosPlaneta("Planets antigo/Saturn.txt");
let infoUranus = await carregarDadosPlaneta("Planets antigo/Uranus.txt");
let infoNeptune = await carregarDadosPlaneta("Planets antigo/Neptune.txt");
let infoPluto = await carregarDadosPlaneta("Planets antigo/Pluto.txt");
let infoMoon = await carregarDadosPlaneta("Planets antigo/Moon.txt");

// console.log(infoMercury, infoVenus, infoEarth, infoMars, infoJupiter, infoSaturn, infoUranus, infoNeptune, infoPluto, infoMoon);



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



  // essas translations usam uma versão antiga do meu código,
  // que calculava a posição dos planetas com base no período
  // orbital dos planetas. Porém, elas vão ser sobrepostas 
  // depois no drawScene, então não tem problema.

  // mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto

  var mercuryOrbitNode = new Node();
  // mercury orbit 150 units from the sun
  var {x, y, z} = getOrbitNode(infoMercury);
  mercuryOrbitNode.localMatrix = m4.translation(x, y, z);

  var venusOrbitNode = new Node();
  // venus orbit 150 units from the sun
  var {x, y, z} = getOrbitNode(infoVenus);
  venusOrbitNode.localMatrix = m4.translation(x, y, z);

/*
  var earthOrbitNode = new Node();
  // earth orbit 100 units from the sun
  // earthOrbitNode.localMatrix = m4.translation(400, 0, 0);
  var {x, y, z} = getOrbitNode(infoEarth);
  console.log("Earth orbit node: ", x, y, z);
  earthOrbitNode.localMatrix = m4.translation(x, y, z);
*/

  var earthOrbitNode = new Node();
  var dia = infoEarth.periodoOrbital % infoMundo.tempoPercorrido;
  var x = infoEarth.posicoes[dia + 0];
  var y = infoEarth.posicoes[dia + 1];
  var z = infoEarth.posicoes[dia + 2];
  earthOrbitNode.localMatrix = m4.translation(x, y, z);

  var marsOrbitNode = new Node();
  // mars orbit 150 units from the sun
  var {x, y, z} = getOrbitNode(infoMars);
  marsOrbitNode.localMatrix = m4.translation(x, y, z);

  var mercuryOrbitNode = new Node();
  // mercury orbit 150 units from the sun
  var {x, y, z} = getOrbitNode(infoMercury);
  mercuryOrbitNode.localMatrix = m4.translation(x, y, z);

  var venusOrbitNode = new Node();
  // venus orbit 150 units from the sun
  var {x, y, z} = getOrbitNode(infoVenus);
  venusOrbitNode.localMatrix = m4.translation(x, y, z);

  var jupiterOrbitNode = new Node();
  // jupiter orbit 150 units from the sun
  var {x, y, z} = getOrbitNode(infoJupiter);
  jupiterOrbitNode.localMatrix = m4.translation(x, y, z);

  var saturnOrbitNode = new Node();
  // saturn orbit 150 units from the sun
  var {x, y, z} = getOrbitNode(infoSaturn);
  saturnOrbitNode.localMatrix = m4.translation(x, y, z);

  var uranusOrbitNode = new Node();
  // uranus orbit 150 units from the sun
  var {x, y, z} = getOrbitNode(infoUranus);
  uranusOrbitNode.localMatrix = m4.translation(x, y, z);
  
  var neptuneOrbitNode = new Node();
  // neptune orbit 150 units from the sun
  var {x, y, z} = getOrbitNode(infoNeptune);
  neptuneOrbitNode.localMatrix = m4.translation(x, y, z);

  var plutoOrbitNode = new Node();
  // pluto orbit 150 units from the sun
  var {x, y, z} = getOrbitNode(infoPluto);
  plutoOrbitNode.localMatrix = m4.translation(x, y, z);

  var moonOrbitNode = new Node();
  // moon 20 units from the earth
  var {x, y, z} = getOrbitNode(infoMoon);
  moonOrbitNode.localMatrix = m4.translation(x, y, z);

  
  // - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - \\

  var escala = 0.0001;

  var sun = 1392700 * escala;
  var mercury = 4879 * escala;
  var venus = 12104 * escala;
  var earth = 12756 * escala;
  var mars = 6792 * escala;
  var jupiter = 142984 * escala;
  var saturn = 120536 * escala;
  var moon = 3475 * escala;

  // alguns planetas estão ficando muito pequenos, e fica difícil
  // visualizá-los. Por isso, o tamanho mínimo vai ser 20.

  if (mercury < 20) {
    mercury = 20;
  }
  if (venus < 20) {
    venus = 20;
  }
  if (earth < 20) {
    earth = 20;
  }
  if (mars < 20) {
    mars = 20;
  }
  if (jupiter < 20) {
    jupiter = 20;
  }
  if (saturn < 20) {
    saturn = 20;
  }
  if (moon < 20) {
    moon = 20;
  }


  var sunNode = new Node();
  sunNode.localMatrix = m4.scaling(sun, sun, sun);  // sun a the center
  sunNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.6, 0.6, 0, 1], // yellow
      u_colorMult:   [0.4, 0.4, 0, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };

  var mercuryNode = new Node();
  mercuryNode.localMatrix = m4.scaling(mercury, mercury, mercury);
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
  venusNode.localMatrix = m4.scaling(venus, venus, venus);
  venusNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.8, 0.6, 0.4, 1],  // light brown
      u_colorMult:   [0.2, 0.2, 0.2, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };

  var earthNode = new Node();
  earthNode.localMatrix = m4.scaling(earth, earth, earth);   // make the earth twice as large
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
  marsNode.localMatrix = m4.scaling(mars, mars, mars);
  marsNode.drawInfo = {
    uniforms: {
      u_colorOffset: [1, 0.2, 0.3, 1],  // orange
      u_colorMult:   [0.1, 0.5, 0.2, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };

  var jupiterNode = new Node();
  jupiterNode.localMatrix = m4.scaling(jupiter, jupiter, jupiter);
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
  saturnNode.localMatrix = m4.scaling(saturn, saturn, saturn);
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
  uranusNode.localMatrix = m4.scaling(20, 20, 20);
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
  neptuneNode.localMatrix = m4.scaling(20, 20, 20);
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
  plutoNode.localMatrix = m4.scaling(20, 20, 20);
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
  moonNode.localMatrix = m4.scaling(2, 2, 2);
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
    const zFar = 600000;
    var projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    // Compute the camera's matrix using look at.
    var cameraPosition = [infoCamera.x, infoCamera.y, infoCamera.z]; 

    if (infoCamera.cameraSolta) {
      var x = cameraPosition[0] + infoCamera.lookDir[0];
      var y = cameraPosition[1] + infoCamera.lookDir[1];
      var z = cameraPosition[2] + infoCamera.lookDir[2];
      var target = [x, y, z];
    }
    else {
      var cameraPosition = [infoCamera.x, infoCamera.y, infoCamera.z];
      var p = infoCamera.proximoPlaneta;
      const dia = infoMundo.tempoPercorrido;
      var planeta;

      switch (p) {
        // 0 = sol, 1 = mercury, 2 = venus, 3 = earth, 4 = moon, 5 = mars, 6 = jupiter, 7 = saturn
        case 0: planeta = { x: 0, y: 0, z: 0 }; break;
        case 1: planeta = posicoesMercury[dia]; break;
        case 2: planeta = posicoesVenus[dia]; break;
        case 3: planeta = posicoesEarth[dia]; break;
        case 4: planeta = posicoesMoon[dia]; break;
        case 5: planeta = posicoesMars[dia]; break;
        case 6: planeta = posicoesJupiter[dia]; break;
        case 7: planeta = posicoesSaturn[dia]; break;
      }

      var target = [planeta.x, planeta.y, planeta.z];
    }

    // var up = [0, 0, 1];
    var cameraMatrix = m4.lookAt(cameraPosition, target, infoCamera.upDir);
    

    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);

    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);


    const TESTE_ANTIGO = false;
    const TESTE_NOVO = true;

    if (TESTE_ANTIGO) {
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
    }

    else if (TESTE_NOVO) {

      // mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto
      var dia = infoMundo.tempoPercorrido;

      var x = posicoesMercury[dia].x;
      var y = posicoesMercury[dia].y;
      var z = posicoesMercury[dia].z;
      mercuryOrbitNode.localMatrix = m4.translation(x, y, z);

      var x = posicoesVenus[dia].x;
      var y = posicoesVenus[dia].y;
      var z = posicoesVenus[dia].z;
      venusOrbitNode.localMatrix = m4.translation(x, y, z);

      var x = posicoesEarth[dia].x;
      var y = posicoesEarth[dia].y;
      var z = posicoesEarth[dia].z;
      earthNode.localMatrix = m4.translation(x, y, z);

      var x = posicoesMars[dia].x;
      var y = posicoesMars[dia].y;
      var z = posicoesMars[dia].z;
      marsOrbitNode.localMatrix = m4.translation(x, y, z);

      var x = posicoesJupiter[dia].x;
      var y = posicoesJupiter[dia].y;
      var z = posicoesJupiter[dia].z;
      jupiterOrbitNode.localMatrix = m4.translation(x, y, z);

      var x = posicoesSaturn[dia].x;
      var y = posicoesSaturn[dia].y;
      var z = posicoesSaturn[dia].z;
      saturnOrbitNode.localMatrix = m4.translation(x, y, z);

      var x = posicoesMoon[dia].x;
      var y = posicoesMoon[dia].y;
      var z = posicoesMoon[dia].z;
      moonOrbitNode.localMatrix = m4.translation(x, y, z);
    }



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



    /*
      tenho um vetor de posições. Cada planeta tem um periodo orbital.
      Vou ter um if para cada planeta, verificando se terminou uma
      translação. Se terminou, incrementa um buffer de posições da
      translação atual do planeta, e faz uma solicitação para desenhar
      a órbita do planeta.
        -> acho que só precisa fazer o desenho uma vez.
    */

      // desenho das órbitas planetárias
    const a_position = gl.getAttribLocation(programInfo.program, "a_position");
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);
    gl.useProgram(programInfo.program);

    const planetas = [
      { nome: "mercury", periodo: periodoMercury, posicoes: posicoesMercury },
      { nome: "venus",   periodo: periodoVenus,   posicoes: posicoesVenus },
      { nome: "earth",   periodo: periodoEarth,   posicoes: posicoesEarth },
      { nome: "mars",    periodo: periodoMars,    posicoes: posicoesMars },
      { nome: "jupiter", periodo: periodoJupiter, posicoes: posicoesJupiter },
      { nome: "saturn",  periodo: periodoSaturn,  posicoes: posicoesSaturn },
      { nome: "moon",    periodo: periodoMoon,    posicoes: posicoesMoon }
    ];

    // estava tendo problema com dias duplicados por conta do setInterval.
    // esse ultimoDiaUpdate vai ser usado pra não rodar múltiplas vezes no
    // mesmo dia.
    planetas.forEach(p => p.ultimoDiaUpdate = -1);

    planetas.forEach(planeta => {

      // se já rodou nesse dia, não rodar de novo.
      if (infoMundo.tempoPercorrido === planeta.ultimoDiaUpdate) {
        console.log("Repetiu o dia ", dia)
      }

      const { nome, periodo, posicoes } = planeta;

      // atualiza o buffer da órbita se a translação foi completada
      if (infoMundo.tempoPercorrido % periodo === 0) {
        
        if (nome === "mercury") {
          console.log("Atualizando orbita para ", nome);
        }
        
        atualizarBufferDaOrbita(gl, bufferOrbita[nome], posicoes, periodo);
      }

      // desenha a órbita
      gl.bindBuffer(gl.ARRAY_BUFFER, bufferOrbita[nome]);
      gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.LINE_STRIP, 0, periodo);
    });



    // Compute all the matrices for rendering
    objects.forEach(function(object) {
        object.drawInfo.uniforms.u_matrix = m4.multiply(viewProjectionMatrix, object.worldMatrix);
    });

    // ------ DEBUGGING -------- \\

    // mercury, venus, earth, mars, jupiter, saturn, moon

    // console.log("Escala - saturn: ", saturn);
    /*
    console.log("Posição - jupiter (dia ", dia, 
                          posicoesJupiter[dia + 0],
                          posicoesJupiter[dia + 1],
                          posicoesJupiter[dia + 2]
    );
    */

    // console.log("Posição da camera - ", infoCamera.x, infoCamera.y, infoCamera.z);

    console.log("Dia atual:", infoMundo.tempoPercorrido);



    // ------ Draw the objects -------- \\

    twgl.drawObjectList(gl, objectsToDraw);

    requestAnimationFrame(drawScene);
  }
}

main();
