function plotFunction() {
  const input = document.getElementById("functionInput").value;
  try {
    functionPlot({
      target: "#plot",
      width: 600,
      height: 400,
      grid: true,
      data: [{
        fn: input,
        sampler: 'builtIn',
        graphType: 'polyline'
      }]
    });
  } catch (err) {
    alert("Ошибка: проверьте синтаксис функции.");
  }
}

function loadExample() {
  const value = document.getElementById("examples").value;
  document.getElementById("functionInput").value = value;
  plotFunction();
}

function clearPlot() {
  document.getElementById("plot").innerHTML = "";
  document.getElementById("functionInput").value = "";
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  const icon = document.querySelector(".theme-toggle");
  icon.textContent = document.body.classList.contains("dark") ? "🌞" : "🌙";
}

function saveAsImage() {
  const svg = document.querySelector("#plot svg");
  if (!svg) return alert("Сначала постройте график.");

  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const img = new Image();
  const svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
  const url = URL.createObjectURL(svgBlob);

  img.onload = function() {
    canvas.width = svg.clientWidth;
    canvas.height = svg.clientHeight;
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    const png = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "graph.png";
    link.href = png;
    link.click();
  };

  img.src = url;
}
