

import {
  infoMundo,
  infoCamera,
  posicoesMercury,
  posicoesVenus,
  posicoesEarth,
  posicoesMars,
  posicoesJupiter,
  posicoesSaturn,
  posicoesMoon
} from './script.js';



export async function carregarArquivo(nomeArquivo) {
  try {
    const resposta = await fetch(nomeArquivo);
    const texto = await resposta.text();
    const linhas = texto.trim().split("\n");

    // Ignorar a primeira linha
    const linhasDados = linhas.slice(1);

    const orbitas = linhasDados.map(linha => {
      const partes = linha.trim().split(/\s+/); // divide por espaços múltiplos

      const ano = parseInt(partes[0]);
      const dia = parseInt(partes[1]);
      const hora = parseInt(partes[2]);

      var x = AUparaKM(parseFloat(partes[3]));
      var y = AUparaKM(parseFloat(partes[4]));
      var z = AUparaKM(parseFloat(partes[5]));

      x = x * infoMundo.escala;
      y = y * infoMundo.escala;
      z = z * infoMundo.escala;

      return { ano, dia, hora, x, y, z };
    });

    return orbitas;

  } catch (erro) {
    console.error("Erro ao carregar arquivo:", erro);
    return [];
  }
}


export function AUparaKM(valorAU) {
  const km = 149597870.7; // 1 UA = 149.597.870,7 km
  const conversao = valorAU * km;
  return conversao;
}



export function cameraParaPlaneta() {
  
  const i = infoCamera.proximoPlaneta;
  const dia = infoMundo.tempoPercorrido;
  var x, y, z;

  switch (i) {

      // sun
    case 0:
      x = 0 + 2000;
      y = 0 + 0;
      z = 0 - 13600;

      break;

      // mercury
    case 1:
      var x = posicoesMercury[dia].x + 2000;
      var y = posicoesMercury[dia].y + 0;
      var z = posicoesMercury[dia].z - 13600;
      break;

      // venus
    case 2:
      x = posicoesVenus[dia].x + 2000;
      y = posicoesVenus[dia].y + 0;
      z = posicoesVenus[dia].z - 13600;
      break;

      // earth
    case 3:
      x = posicoesEarth[dia].x + 2000;
      y = posicoesEarth[dia].y + 0;
      z = posicoesEarth[dia].z - 13600;
      break;

      // moon
    case 4:
      x = posicoesMoon[dia].x + 2000;
      y = posicoesMoon[dia].y + 0;
      z = posicoesMoon[dia].z - 13600;
      break;

      // mars
    case 5:
      x = posicoesMars[dia].x + 2000;
      y = posicoesMars[dia].y + 0;
      z = posicoesMars[dia].z - 13600;
      break;

      // jupiter
    case 6:
      x = posicoesJupiter[dia].x + 2000;
      y = posicoesJupiter[dia].y + 0;
      z = posicoesJupiter[dia].z - 13600;
      break;

      // saturn
    case 7:
      x = posicoesSaturn[dia].x + 2000;
      y = posicoesSaturn[dia].y + 0;
      z = posicoesSaturn[dia].z - 13600;
      break;
  }

  infoCamera.x = x;
  infoCamera.y = y;
  infoCamera.z = z;
}





export function criarBufferDaOrbita(gl, periodoOrbital, posicoes) {
  const totalComponentes = 3 * periodoOrbital;
  const dadosOrbita = new Float32Array(totalComponentes);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, dadosOrbita, gl.DYNAMIC_DRAW);

  // Chama a função de preenchimento
  atualizarBufferDaOrbita(gl, buffer, posicoes, periodoOrbital);

  return buffer;
}


export function atualizarBufferDaOrbita(gl, buffer, posicoes, periodoOrbital) {
  const dados = new Float32Array(3 * periodoOrbital);

  for (let i = 0; i < periodoOrbital; i++) {
    const p = posicoes[i];
    if (!p) continue; // segurança contra valores inválidos

    dados[3 * i + 0] = p.x;
    dados[3 * i + 1] = p.y;
    dados[3 * i + 2] = p.z;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, dados);
}



// Importante: garanta que os arrays posicoes.x, posicoes.y, 
// posicoes.z estejam completos com pelo menos periodoOrbital 
// elementos, para evitar acessos indefinidos.






export async function carregarDadosPlaneta(nomeArquivo) {
  try {
    const resposta = await fetch(nomeArquivo);
    const texto = await resposta.text();
    const linhas = texto.trim().split("\n");

    const planeta = {
      posicoes: [],
      diametro: parseFloat(linhas[0]),          // km
      periodoRotacao: parseFloat(linhas[1]),    // horas
      distanciaSol: parseFloat(linhas[2]),      // x * 10^6 km
      periodoOrbital: parseFloat(linhas[3]),    // dias
      velocidadeOrbital: parseFloat(linhas[4]), // km/s
      inclinacaoOrbital: parseFloat(linhas[5]), // graus
      obliquidadeOrbital: parseFloat(linhas[6]) // graus
    };

    // console.log("Dados de:", nomeArquivo);
    // console.log(planeta);
    return planeta;

  } catch (erro) {
    console.error("Erro ao carregar o arquivo:", erro);
  }
}


// isso aqui é uma gambiarra... no momento que eu clicava no canvas,
// estava mexendo no valor do lookDir. Depois de muito investigar,
// cheguei nessa gambiarra, que parece não trazer problemas pro código.
export function arredondado(valor) {
  const fator = Math.pow(10, 6);
  return Math.round(valor * fator) / fator;
}


// essa função é utilizada pra aplicar as translações de forma dinâmica.
export function getOrbitNode(planeta) {
  
  const dias = infoMundo.tempoPercorrido;
  const ciclo = planeta.periodoOrbital;
  const inclinacao = planeta.inclinacaoOrbital;

  const fracaoOrbital = (dias % ciclo) / ciclo;
  const anguloOrbital = fracaoOrbital * 2 * Math.PI;       // radianos
  const amplitudeY = Math.sin(inclinacao * Math.PI / 180);

  var raio = planeta.distanciaSol;   // x * 10^6 km
  raio = raio * 100000;              // km
  raio = raio * infoMundo.escala;

  // posições do planeta ao redor do sol
  var x = Math.cos(anguloOrbital) * raio;
  var y = Math.sin(anguloOrbital * 2) * amplitudeY * raio;
  var z = Math.sin(anguloOrbital) * raio;

  return { x, y, z }
}






export function calcularOrbita(planeta) {

  const ciclo = planeta.periodoOrbital;
  const inclinacao = planeta.inclinacaoOrbital;
  const amplitudeY = Math.sin(inclinacao * Math.PI / 180);

  var raio = planeta.distanciaSol;   // x * 10^6 km
  raio = raio * 100000;              // km
  raio = raio * infoMundo.escala;

  var vetorPosicoes = [];

  for (var dias = 0; dias < ciclo; dias++) {
    
    var fracaoOrbital = (dias) / ciclo;               // já que agora calcula de todos os pontos, não precisa ser (dias % ciclos)
    var anguloOrbital = fracaoOrbital * 2 * Math.PI;  // radianos

    // posições do planeta ao redor do sol
    var x = Math.cos(anguloOrbital) * raio;
    var y = Math.sin(anguloOrbital * 2) * amplitudeY * raio;
    var z = Math.sin(anguloOrbital) * raio;

    vetorPosicoes [dias + 0] = x;
    vetorPosicoes [dias + 1] = y;
    vetorPosicoes [dias + 2] = z;

    // console.log("Dia: ", dias)
    // console.log(vetorPosicoes[dias + 0], vetorPosicoes[dias + 1], vetorPosicoes[dias + 2])
  }

  return vetorPosicoes;
}
