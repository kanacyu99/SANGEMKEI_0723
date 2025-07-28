import React, { useState } from 'react';
import Plot from 'react-plotly.js';

function App() {
  const [slagData, setSlagData] = useState([]);
  const [inputs, setInputs] = useState({ name: '', CaO: '', SiO2: '', Al2O3: '' });

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const addSlag = () => {
    const CaO = parseFloat(inputs.CaO) || 0;
    const SiO2 = parseFloat(inputs.SiO2) || 0;
    const Al2O3 = parseFloat(inputs.Al2O3) || 0;
    const total = CaO + SiO2 + Al2O3;
    if (total === 0) return;

    const normalized = {
      CaO: (CaO / total) * 100,
      SiO2: (SiO2 / total) * 100,
      Al2O3: (Al2O3 / total) * 100
    };

    const csRatio = normalized.SiO2 !== 0 ? normalized.CaO / normalized.SiO2 : null;

    const phaseJudgement = (() => {
      if (normalized.CaO > 60 && normalized.Al2O3 < 10) {
        return `C₃S（トリカルシウムシリケート）領域の可能性です\n用途：セメントの初期強度発現に役立ちます。早期硬化性が高い。`;
      }
      if (normalized.CaO > 45 && normalized.SiO2 > 30 && normalized.Al2O3 < 15) {
        return `C₂S（ジカルシウムシリケート）領域の可能性です\n用途：長期強度に役立ちます。スラグ硬化型用途に多い。`;
      }
      if (normalized.Al2O3 > 30 && normalized.CaO > 40) {
        return `C₃A（トリカルシウムアルミネート）領域の可能性です\n用途：凝結反応に関与。反応性は高いが耐久性には注意。`;
      }
      if (normalized.Al2O3 > 30 && normalized.CaO < 30) {
        return `CA・CA₂領域の可能性です\n用途：耐火材や高アルミナセメント。高温安定性が高い。`;
      }
      if (normalized.SiO2 > 60) {
        return `シリカリッチ領域の可能性です\n用途：スラグ流動性向上。過剰で硬化性は低下。`;
      }
      return `中間相または複数相混在領域の可能性です\n用途：特性が明確でなく、調整によって性質が変動しやすい。`;
    })();

    const newData = {
      name: inputs.name || `Slag${slagData.length + 1}`,
      CaO, SiO2, Al2O3,
      normalized,
      csRatio,
      phaseJudgement,
      visible: true
    };

    setSlagData([...slagData, newData]);
    setInputs({ name: '', CaO: '', SiO2: '', Al2O3: '' });
  };

  const toggleVisibility = (index) => {
    const updated = [...slagData];
    updated[index].visible = !updated[index].visible;
    setSlagData(updated);
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto' }}>
      <h2>スラグ成分入力＆三元プロット＋判定</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input name="name" placeholder="スラグ名" value={inputs.name} onChange={handleChange} />
        <input name="CaO" placeholder="CaO (%)" value={inputs.CaO} onChange={handleChange} />
        <input name="SiO2" placeholder="SiO₂ (%)" value={inputs.SiO2} onChange={handleChange} />
        <input name="Al2O3" placeholder="Al₂O₃ (%)" value={inputs.Al2O3} onChange={handleChange} />
        <button onClick={addSlag}>追加する</button>
      </div>

      <div style={{ marginTop: '1rem' }}>
        {slagData.map((slag, idx) => (
          <div key={idx}>
            <label>
              <input type="checkbox" checked={slag.visible} onChange={() => toggleVisibility(idx)} />
              {slag.name}：{slag.phaseJudgement.split('\n')[0]}
            </label>
          </div>
        ))}
      </div>

      <div style={{ width: '100%', overflowX: 'auto', marginTop: '1rem' }}>
        <Plot
          data={slagData.filter(s => s.visible).map(slag => ({
            type: 'scatterternary',
            mode: 'markers',
            a: [slag.normalized.SiO2],
            b: [slag.normalized.CaO],
            c: [slag.normalized.Al2O3],
            name: slag.name,
            marker: { size: 12 }
          }))}
          layout={{
            ternary: {
              sum: 100,
              aaxis: { title: 'SiO₂', min: 0, tickmode: 'linear', tick0: 0, dtick: 20, ticksuffix: '%' },
              baxis: { title: 'CaO', min: 0, tickmode: 'linear', tick0: 0, dtick: 20, ticksuffix: '%' },
              caxis: { title: 'Al₂O₃', min: 0, tickmode: 'linear', tick0: 0, dtick: 20, ticksuffix: '%' }
            },
            margin: { t: 20, l: 10, r: 10, b: 10 },
            showlegend: true,
            height: 500
          }}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}

export default App;
