window.handlePayment = function (callback) {
  localStorage.setItem('paymentStatus', 'success');
  callback();
};

window.demoCalculate = function (input, setResult) {
  try {
    if (!input.trim()) throw new Error('Введите выражение');
    const validOps = /^[0-9+\-*/.\s()]+$/;
    if (!validOps.test(input)) throw new Error('Демо поддерживает только базовые операции (+, -, *, /)');
    const result = math.evaluate(input);
    setResult(Number.isFinite(result) ? result.toFixed(6) : result.toString());
  } catch (error) {
    setResult('Ошибка: введите корректное выражение, например, 2 + 2');
  }
};

window.calculate = function (input, setResult) {
  try {
    if (!input.trim()) throw new Error('Введите выражение');
    const result = math.evaluate(input);
    setResult(Number.isFinite(result) ? result.toFixed(6) : result.toString());
  } catch (error) {
    setResult('Ошибка: введите корректное выражение, например, 2 + 2 или sin(pi/2)');
  }
};

window.convertUnits = function (value, type) {
  switch (type) {
    case 'metersToFeet': return value * 3.28084;
    case 'feetToMeters': return value / 3.28084;
    case 'kgToPounds': return value * 2.20462;
    case 'poundsToKg': return value / 2.20462;
    case 'celsiusToFahrenheit': return (value * 9/5) + 32;
    case 'fahrenheitToCelsius': return (value - 32) * 5/9;
    default: return value;
  }
};

window.calculateMatrix = function (input, setResult) {
  try {
    const result = math.evaluate(input);
    if (Array.isArray(result)) {
      setResult(JSON.stringify(result, null, 2));
    } else {
      setResult(result.toString());
    }
  } catch (error) {
    setResult('Ошибка: введите корректную матричную операцию, например, [[1, 2], [3, 4]] * [[1, 0], [0, 1]]');
  }
};

window.exportHistory = function (history) {
  const text = history.join('\n');
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'calc_history.txt';
  a.click();
  URL.revokeObjectURL(url);
};

window.saveGraph = function (canvasRef, expression) {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `graph_${expression.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
  a.click();
};

window.plotGraph = function (expression, xMin, xMax, yMin, yMax, canvasRef, chartRef, onError) {
  try {
    if (xMin >= xMax) throw new Error('X мин должен быть меньше X макс');
    const xValues = Array.from({ length: 200 }, (_, i) => xMin + i * (xMax - xMin) / 199);
    const yValues = xValues.map(x => {
      try {
        return math.evaluate(expression, { x });
      } catch {
        return null;
      }
    });

    if (yValues.every(y => y === null)) throw new Error('Невозможно построить график');

    if (chartRef.current) chartRef.current.destroy();

    const scales = {
      x: { title: { display: true, text: 'X' }, min: xMin, max: xMax },
      y: { title: { display: true, text: 'Y' } }
    };

    if (yMin !== '' && yMax !== '' && !isNaN(yMin) && !isNaN(yMax) && yMin < yMax) {
      scales.y.min = yMin;
      scales.y.max = yMax;
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: xValues,
        datasets: [{
          label: expression,
          data: yValues,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.4
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: 'easeInOutQuad'
        },
        scales: scales,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: { enabled: true }
        }
      }
    });
  } catch (error) {
    onError();
  }
};

window.solveEquations = function (equations, setSolution) {
  try {
    if (equations.some(eq => !eq.trim())) {
      throw new Error('Все уравнения должны быть заполнены');
    }

    if (equations.length === 1) {
      let expr = equations[0].trim();
      if (!expr.includes('=')) expr += '=0';
      const [left, right] = expr.split('=').map(s => s.trim());
      const func = `(${left}) - (${right || '0'})`;

      try {
        const node = math.parse(func);
        const simplified = math.simplify(node);
        const solutions = math.solve(simplified, 'x');
        if (solutions && solutions.length > 0) {
          const formatted = solutions.map(s => `x = ${s.toString()}`).join('\n');
          setSolution(`Решение:\n${formatted}`);
          return;
        }
      } catch {}

      const f = x => {
        try {
          return math.evaluate(func, { x });
        } catch {
          return NaN;
        }
      };

      let roots = [];
      const step = 0.1;
      for (let x = -10; x <= 10; x += step) {
        const y1 = f(x);
        const y2 = f(x + step);
        if (isNaN(y1) || isNaN(y2)) continue;
        if (y1 * y2 <= 0) {
          let a = x;
          let b = x + step;
          for (let i = 0; i < 50; i++) {
            const mid = (a + b) / 2;
            const fm = f(mid);
            if (isNaN(fm) || Math.abs(fm) < 1e-6) {
              if (!isNaN(fm)) roots.push(mid);
              break;
            }
            if (f(a) * fm < 0) {
              b = mid;
            } else {
              a = mid;
            }
          }
        }
      }

      if (roots.length > 0) {
        const formatted = roots.map(r => `x ≈ ${r.toFixed(3)}`).join('\n');
        setSolution(`Приближенные корни:\n${formatted}`);
      } else {
        setSolution('Корни не найдены в диапазоне [-10, 10]');
      }
    } else {
      const vars = ['x', 'y', 'z'].slice(0, equations.length);
      const funcs = equations.map(eq => {
        if (!eq.includes('=')) eq += '=0';
        const [left, right] = eq.split('=').map(s => s.trim());
        return `(${left}) - (${right || '0'})`;
      });

      try {
        const equationsParsed = funcs.map(f => math.parse(f));
        const solutions = math.solve(equationsParsed, vars);
        if (solutions && Object.keys(solutions).length === vars.length) {
          const formatted = vars.map(v => `${v} = ${solutions[v].toString()}`).join('\n');
          setSolution(`Решение:\n${formatted}`);
          return;
        }
      } catch {}

      const f = vars => funcs.map(func => {
        try {
          return math.evaluate(func, vars);
        } catch {
          return NaN;
        }
      });

      let guess = vars.reduce((acc, v) => ({ ...acc, [v]: 0 }), {});
      let converged = false;
      for (let i = 0; i < 1000; i++) {
        const values = f(guess);
        if (values.every(v => !isNaN(v) && Math.abs(v) < 1e-6)) {
          converged = true;
          break;
        }

        const J = vars.map((v, i) => {
          const h = 1e-6;
          const guessPlus = { ...guess, [v]: guess[v] + h };
          const valuesPlus = f(guessPlus);
          return vars.map((_, j) => (valuesPlus[j] - values[j]) / h);
        });

        try {
          const delta = math.lusolve(J, values.map(v => -v));
          vars.forEach((v, idx) => {
            guess[v] += delta[idx][0];
          });
        } catch {
          break;
        }
      }

      if (converged) {
        const formatted = vars.map(v => `${v} ≈ ${guess[v].toFixed(3)}`).join('\n');
        setSolution(`Приближенное решение:\n${formatted}`);
      } else {
        setSolution('Решение не найдено: проверьте уравнения или попробуйте другие начальные значения');
      }
    }
  } catch (error) {
    setSolution('Ошибка: ' + error.message);
  }
};