import React, { useState } from 'react';
import Plot from 'react-plotly.js';

function App() {
  const [composition, setComposition] = useState({ CaO: 45.4, SiO2: 4.6, Al2O3: 30.2 });
  const [slagName, setSlagName] = useState('');
  const [slagList, setSlagList] = useState([]);

  const handleChange = (e) => {
    setComposition({ ...composition, [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  const addSlag = () => {
    const total = composition.CaO + composition.SiO2 + composition.Al2O3;
    if (!slagName || total === 0) return;
    const norm = {
      CaO: (composition.CaO / total) * 100,
      SiO2: (composition.SiO2 / total) * 100,
      Al2O3: (composition.Al2O3 / total) * 100,
    };
    setSlagList([...slagList, { name: slagName, ...norm, visible: true }]);
    setSlagName('');
  };

  const toggleVisibility = (index) => {
    const newList = [...slagList];
    newList[index].visible = !newList[index].visible;
    setSlagList(newList);
  };

  const total = composition.CaO + composition.SiO2 + composition.Al2O3;
  const normalized = {
    CaO: (composition.CaO / total) * 100,
    SiO2: (composition.SiO2 / total) * 100,
    Al2O3: (composition.Al2O3 / total) * 100,
  };

  const csRatio = normalized.SiO2 !== 0 ? normalized.CaO / normalized.SiO2 : null;

  const phaseJudgement = (() => {
    const { CaO, SiO2, Al2O3 } = normalized;
    if (CaO > 60 && Al2O3 < 10) return `C₃S（トリカルシウムシリケート）領域の可能性です\n用途：セメントの初期強度発現に役立ちます。早期硬化性が高い。`;
    if (CaO > 45 && SiO2 > 30 && Al2O3 < 15) return `C₂S（ジカルシウムシリケート）領域の可能性です\n用途：長期強度に役立ちます。スラグ硬化型用途に多い。`;
    if (Al2O3 > 30 && CaO > 40) return `C₃A（トリカルシウムアルミネート）領域の可能性です\n用途：凝結反応に関与。反応性は高いが耐久性には注意。`;
    if (Al2O3 > 30 && CaO < 30) return `CA・CA₂領域の可能性です\n用途：耐火材や高アルミナセメント。高温安定性が高い。`;
    if (SiO2 > 60) return `シリカリッチ領域の可能性です\n用途：スラグ流動性向上。過剰で硬化性は低下。`;
    return `中間相または複数相混在領域の可能性です\n用途：特性が明確でなく、調整によって性質が変動しやすい。`;
  })();

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto' }}>
      <h2>三元組成プロット（CaO–SiO₂–Al₂O₃）＋相領域判定＋C/S比</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {['CaO', 'SiO2', 'Al2O3'].map((key) => (
          <label key={key}>{key}:
            <input
              type="number"
              name={key}
              step="0.1"
              value={composition[key]}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </label>
        ))}
        <label>
          スラグ名:
          <input
            type="text"
            value={slagName}
            onChange={(e) => setSlagName(e.target.value)}
            style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
        <button onClick={addSlag} style={{ padding: '0.5rem', marginTop: '0.5rem' }}>スラグを追加</button>
      </div>

      <p><strong>換算後の三成分：</strong></p>
      <ul>
        <li>CaO: {normalized.CaO.toFixed(1)}%</li>
        <li>SiO₂: {normalized.SiO2.toFixed(1)}%</li>
        <li>Al₂O₃: {normalized.Al2O3.toFixed(1)}%</li>
      </ul>

      {csRatio !== null && (
        <p style={{ background: '#eef6ff', padding: '0.5rem', borderRadius: '6px' }}>
          <strong>📐 C/S比（CaO / SiO₂）: </strong>{csRatio.toFixed(2)}<br />
          {csRatio > 2.5 ? '→ 大カルシウムシリケート傾向（反応性・膨張性に注意）'
            : csRatio < 1.5 ? '→ シリカリッチ傾向（硬化性や強度に注意）'
              : '→ バランス型（C₂SやC₃Sの可能性）'}
        </p>
      )}

      <p style={{ fontSize: '1.1rem', lineHeight: '1.6', backgroundColor: '#eef', padding: '1rem', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
        🔎 判定結果：<br />
        {phaseJudgement}
      </p>

      <h3>📊 登録済みスラグ一覧（表示切替）</h3>
      {slagList.map((slag, idx) => (
        <label key={idx} style={{ display: 'block' }}>
          <input type="checkbox" checked={slag.visible} onChange={() => toggleVisibility(idx)} /> {slag.name}
        </label>
      ))}

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <Plot
          data={[{
            type: 'scatterternary',
            mode: 'markers',
            a: [normalized.SiO2],
            b: [normalized.CaO],
            c: [normalized.Al2O3],
            marker: { size: 14, color: 'red' },
            name: '換算組成（入力中）'
          },
          ...slagList.filter(s => s.visible).map(s => ({
            type: 'scatterternary',
            mode: 'markers+text',
            a: [s.SiO2],
            b: [s.CaO],
            c: [s.Al2O3],
            text: s.name,
            textposition: 'top center',
            marker: { size: 10 },
            name: s.name
          }))]
          }
          layout={{
            ternary: {
              sum: 100,
              aaxis: { title: 'SiO₂', tickmode: 'linear', dtick: 20, ticksuffix: '%' },
              baxis: { title: 'CaO', tickmode: 'linear', dtick: 20, ticksuffix: '%' },
              caxis: { title: 'Al₂O₃', tickmode: 'linear', dtick: 20, ticksuffix: '%' },
            },
            margin: { t: 20, l: 10, r: 10, b: 10 },
            showlegend: true,
            height: 520
          }}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}

export default App;
