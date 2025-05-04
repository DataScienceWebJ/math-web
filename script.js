function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(div => div.classList.add('hidden'));
  document.getElementById(tabId).classList.remove('hidden');
}

function evaluateCalc() {
  const input = document.getElementById('calcInput').value;
  try {
    const result = math.evaluate(input);
    document.getElementById('calcResult').innerText = "Результат: " + result.toString();
  } catch (e) {
    document.getElementById('calcResult').innerText = "Ошибка: " + e.message;
  }
}

function plotFunction() {
  const expr = document.getElementById('graphFunc').value;
  const xMin = parseFloat(document.getElementById('xMin').value);
  const xMax = parseFloat(document.getElementById('xMax').value);
  const yMin = parseFloat(document.getElementById('yMin').value);
  const yMax = parseFloat(document.getElementById('yMax').value);
  try {
    functionPlot({
      target: '#plot',
      width: document.getElementById('plot').clientWidth,
      height: 400,
      grid: true,
      data: [{ fn: expr }],
      xAxis: { domain: [xMin, xMax] },
      yAxis: { domain: [yMin, yMax] }
    });
  } catch (e) {
    alert("Ошибка: " + e.message);
  }
}

function solveEquation() {
  const left = document.getElementById('eqLeft').value;
  const right = document.getElementById('eqRight').value;
  try {
    const equation = `${left} - (${right})`;
    const f = x => math.evaluate(equation, { x });
    const df = x => math.derivative(equation, 'x').evaluate({ x });
    let x0 = 1;
    for (let i = 0; i < 20; i++) {
      let x1 = x0 - f(x0) / df(x0);
      if (Math.abs(x1 - x0) < 1e-6) {
        document.getElementById('solveResult').innerText = `x ≈ ${x1.toFixed(6)}`;
        return;
      }
      x0 = x1;
    }
  } catch (e) {
    document.getElementById('solveResult').innerText = "Ошибка: " + e.message;
  }
}

function solveSystem() {
  const eq1 = document.getElementById('sys1').value;
  const eq2 = document.getElementById('sys2').value;
  try {
    const parsed1 = math.parse(eq1).compile();
    const parsed2 = math.parse(eq2).compile();

    let guess = { x: 1, y: 1 };
    for (let i = 0; i < 20; i++) {
      const f1 = parsed1.evaluate(guess);
      const f2 = parsed2.evaluate(guess);
      if (Math.abs(f1) < 1e-6 && Math.abs(f2) < 1e-6) break;
      guess.x -= f1 * 0.1;
      guess.y -= f2 * 0.1;
    }
    document.getElementById('systemResult').innerText =
      `x ≈ ${guess.x.toFixed(4)}, y ≈ ${guess.y.toFixed(4)}`;
  } catch (e) {
    document.getElementById('systemResult').innerText = "Ошибка: " + e.message;
  }
}
