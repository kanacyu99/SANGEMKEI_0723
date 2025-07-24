import React, { useState } from 'react';
import Plot from 'react-plotly.js';

function App() {
  const [composition, setComposition] = useState({
    CaO: 42.0,
    SiO2: 32.0,
    Al2O3: 10.0,
    MgO: 8.0,
    Fe2O3: 5.0,
    TiO2: 3.0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setComposition((prev) => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  const selectedTotal = composition.CaO + composition.SiO2 + composition.Al2O3;

  const normalized = {
    CaO: (composition.CaO / selectedTotal) * 100,
    SiO2: (composition.SiO2 / selectedTotal) * 100,
    Al2O3: (composition.Al2O3 / selectedTotal) * 100
  };

  const csRatio = normalized.SiO2 !== 0 ? normalized.CaO / normalized.SiO2 : null;

  const phaseJudgement = (() => {
    const { CaO, SiO2, Al2O3 } = normalized;
    if (CaO > 60 && Al2O3 < 10) {
      return `C₃S（トリカルシウムシリケート）領域の可能性です。\n用途：セメントの初期強度発現に寄与。早期硬化性が高い。`;
    }
    if (CaO > 45 && SiO2 > 30 && Al2O3 < 15) {
      return `C₂S（ジカルシウムシリケート）領域の可能性です。\n用途：長期強度に寄与。スラグ硬化型用途に多い。`;
    }
    if (Al2O3 > 30 && CaO > 40) {
      return `C₃A（トリカルシウムアルミネート）領域の可能性です。\n用途：凝結反応に関与。反応性は高いが耐久性には注意。`;
    }
    if (Al2O3 > 30 && CaO < 30) {
      return `CA・CA₂領域の可能性です。\n用途：耐火材や高アルミナセメント。高温安定性が高い。`;
    }
    if (SiO2 > 60) {
      return `シリカリッチ領域の可能性です。\n用途：スラグ流動性向上。過剰で硬化性は低下。`;
    }
    return `中間相または複数相混在領域の可能性です。\n用途：特性が明確でなく、調整によって性質が変動しやすい。`;
  })();

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h2>三元組成プロット（CaO–SiO₂–Al₂O₃）＋相領域判定＋C/S比</h2>

      {/* 入力フォーム */}
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 400 }}>
        {Object.keys(composition).map((key) => (
          <label key={key} style={{ marginBottom: '6px' }}>
            {key}:{' '}
            <input
              type="number"
              name={key}
              value={composition[key]}
              onChange={handleChange}
              step="0.1"
              min="0"
              max="100"
              inputMode="decimal"
              placeholder="例: 45.0"
              style={{
                width: '100px',
                padding: '6px',
                marginLeft: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </label>
        ))}
      </div>

      {/* 換算結果 */}
      <p><strong>換算後の三成分：</strong></p>
      <ul>
        <li>CaO: {normalized.CaO.toFixed(1)}%</li>
        <li>SiO₂: {normalized.SiO2.toFixed(1)}%</li>
        <li>Al₂O₃: {normalized.Al2O3.toFixed(1)}%</li>
      </ul>

      {/* C/S比 */}
      {csRatio !== null && (
        <p style={{ background: '#eef6ff', padding: '0.5rem', borderRadius: '6px' }}>
          <strong>📐 C/S比（CaO / SiO₂）: </strong>{csRatio.toFixed(2)}<br />
          {csRatio > 2.5
            ? '→ 大カルシウムシリケート傾向（反応性・膨張性に注意）'
            : csRatio < 1.5
              ? '→ シリカリッチ傾向（硬化性や強度に注意）'
              : '→ バランス型（C₂SやC₃Sの可能性）'}
        </p>
      )}

      {/* 判定コメント */}
      <p style={{
        fontSize: '1.1rem',
        lineHeight: '1.6',
        backgroundColor: '#eef',
        padding: '1rem',
        borderRadius: '8px',
        whiteSpace: 'pre-wrap'
      }}>
        🔎 判定結果：<br />
        {phaseJudgement}
      </p>

      {/* 三元グラフ */}
      <Plot
        data={[
          {
            type: 'scatterternary',
            mode: 'markers',
            a: [normalized.Al2O3],
            b: [normalized.CaO],  // CaOを右側に
            c: [normalized.SiO2], // SiO2を左側に
            marker: { size: 14, color: 'red' },
            name: '換算組成'
          }
        ]}
        layout={{
          ternary: {
            sum: 100,
            aaxis: { title: 'Al₂O₃', min: 0, max: 100, ticksuffix: '%' },
            baxis: { title: 'CaO', min: 0, max: 100, ticksuffix: '%' },
            caxis: { title: 'SiO₂', min: 0, max: 100, ticksuffix: '%' }
          },
          width: 520,
          height: 520,
          margin: { t: 0 },
          showlegend: true
        }}
      />
    </div>
  );
}

export default App;
