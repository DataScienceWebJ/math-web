function evaluateCalc() {
  const input = document.getElementById('calcInput').value;
  try {
    const result = math.evaluate(input);
    document.getElementById('calcResult').innerText = `Результат: ${result.toString()}`;
  } catch (err) {
    document.getElementById('calcResult').innerText = `Ошибка: ${err.message}`;
  }
}

function plotFunction() {
  const expr = document.getElementById('graphFunc').value;
  const xMin = parseFloat(document.getElementById('xMin').value) || -10;
  const xMax = parseFloat(document.getElementById('xMax').value) || 10;
  const yMin = parseFloat(document.getElementById('yMin').value) || -10;
  const yMax = parseFloat(document.getElementById('yMax').value) || 10;
  try {
    functionPlot({
      target: '#plot',
      width: document.getElementById('plot').clientWidth,
      height: 500,
      grid: true,
      data: [{ fn: expr, sampler: 'builtIn', graphType: 'polyline' }],
      xAxis: { label: 'x', domain: [xMin, xMax] },
      yAxis: { label: 'y', domain: [yMin, yMax] }
    });
  } catch (e) {
    alert('Ошибка в выражении функции: ' + e.message);
  }
}

function solveEquation() {
  const left = document.getElementById('eqLeft').value;
  const right = document.getElementById('eqRight').value;
  try {
    const equation = `${left} - (${right})`;
    const f = x => math.evaluate(equation, {x});
    const df = x => math.derivative(equation, 'x').evaluate({x});
    let x0 = 1, x1;
    for (let i = 0; i < 20; i++) {
      x1 = x0 - f(x0) / df(x0);
      if (Math.abs(x1 - x0) < 1e-6) break;
      x0 = x1;
    }
    document.getElementById('solveResult').innerText = `Приближенное решение: x ≈ ${x1.toFixed(6)}`;
  } catch (err) {
    document.getElementById('solveResult').innerText = `Ошибка: ${err.message}`;
  }
}
