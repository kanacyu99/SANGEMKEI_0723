import React, { useState } from 'react';
import Plot from 'react-plotly.js';

function App() {
  const [composition, setComposition] = useState({
    CaO: 42, SiO2: 32, Al2O3: 10, MgO: 8, Fe2O3: 5, TiO2: 3
  });

  const handleChange = (e) => {
    setComposition({ ...composition, [e.target.name]: Number(e.target.value) });
  };

  const selectedTotal = composition.CaO + composition.SiO2 + composition.Al2O3;

  const normalized = {
    CaO: (composition.CaO / selectedTotal) * 100,
    SiO2: (composition.SiO2 / selectedTotal) * 100,
    Al2O3: (composition.Al2O3 / selectedTotal) * 100
  };

  const phaseJudgement = (() => {
    const { CaO, SiO2, Al2O3 } = normalized;

    if (CaO > 60 && Al2O3 < 10) return "C₃S（トリカルシウムシリケート）領域の可能性";
    if (CaO > 45 && SiO2 > 30 && Al2O3 < 15) return "C₂S（ジカルシウムシリケート）領域の可能性";
    if (Al2O3 > 30 && CaO > 40) return "C₃A（トリカルシウムアルミネート）領域の可能性";
    if (Al2O3 > 30 && CaO < 30) return "CA, CA₂ 領域の可能性";
    if (SiO2 > 60) return "シリカリッチ領域の可能性";
    return "中間相または複数相混在領域の可能性";
  })();

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h2>三元組成プロット（CaO–SiO₂–Al₂O₃）＋相領域判定</h2>

      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 400 }}>
        {Object.keys(composition).map((key) => (
          <label key={key}>
            {key}: <input type="number" name={key} value={composition[key]} onChange={handleChange} />
          </label>
        ))}
      </div>

      <p><strong>換算後の三成分：</strong></p>
      <ul>
        <li>CaO: {normalized.CaO.toFixed(1)}%</li>
        <li>SiO₂: {normalized.SiO2.toFixed(1)}%</li>
        <li>Al₂O₃: {normalized.Al2O3.toFixed(1)}%</li>
      </ul>

      <p><strong>🔎 判定結果：</strong><br />{phaseJudgement}</p>

      <Plot
        data={[
          {
            type: 'scatterternary',
            mode: 'markers',
            a: [normalized.Al2O3],
            b: [normalized.SiO2],
            c: [normalized.CaO],
            marker: { size: 14, color: 'red' },
            name: '換算組成'
          }
        ]}
        layout={{
          ternary: {
            aaxis: { title: 'Al₂O₃', min: 0, ticksuffix: '%' },
            baxis: { title: 'SiO₂', min: 0, ticksuffix: '%' },
            caxis: { title: 'CaO', min: 0, ticksuffix: '%' }
          },
          width: 500,
          height: 500,
          margin: { t: 0 },
          showlegend: true
        }}
      />
    </div>
  );
}

export default App;
