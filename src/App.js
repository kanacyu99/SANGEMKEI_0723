import React, { useState } from 'react';
import Plot from 'react-plotly.js';

function App() {
  const [input, setInput] = useState({
    name: '',
    CaO: '',
    SiO2: '',
    Al2O3: ''
  });
  const [dataPoints, setDataPoints] = useState([]);

  const handleInputChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleAddPoint = () => {
    const { name, CaO, SiO2, Al2O3 } = input;
    if (!name || !CaO || !SiO2 || !Al2O3) return;

    const total = parseFloat(CaO) + parseFloat(SiO2) + parseFloat(Al2O3);
    const normalized = {
      CaO: (parseFloat(CaO) / total) * 100,
      SiO2: (parseFloat(SiO2) / total) * 100,
      Al2O3: (parseFloat(Al2O3) / total) * 100
    };

    setDataPoints([...dataPoints, {
      name,
      ...normalized
    }]);

    setInput({ name: '', CaO: '', SiO2: '', Al2O3: '' });
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif', maxWidth: 600, margin: '0 auto' }}>
      <h2>スラグ成分入力 & 三元プロット</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1rem' }}>
        <input
          name="name"
          placeholder="スラグ名"
          value={input.name}
          onChange={handleInputChange}
          style={{ padding: '6px' }}
        />
        <input
          name="CaO"
          placeholder="CaO (%)"
          type="number"
          step="0.1"
          value={input.CaO}
          onChange={handleInputChange}
          style={{ padding: '6px' }}
        />
        <input
          name="SiO2"
          placeholder="SiO₂ (%)"
          type="number"
          step="0.1"
          value={input.SiO2}
          onChange={handleInputChange}
          style={{ padding: '6px' }}
        />
        <input
          name="Al2O3"
          placeholder="Al₂O₃ (%)"
          type="number"
          step="0.1"
          value={input.Al2O3}
          onChange={handleInputChange}
          style={{ padding: '6px' }}
        />
        <button onClick={handleAddPoint} style={{ padding: '8px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px' }}>
          追加する
        </button>
      </div>

      <Plot
        data={dataPoints.map((point, index) => ({
          type: 'scatterternary',
          mode: 'markers',
          a: [point.SiO2],
          b: [point.CaO],
          c: [point.Al2O3],
          marker: { size: 12 },
          name: point.name
        }))}
        layout={{
          ternary: {
            sum: 100,
            aaxis: { title: 'SiO₂', min: 0, tickmode: 'linear', tick0: 0, dtick: 20, ticksuffix: '%' },
            baxis: { title: 'CaO', min: 0, tickmode: 'linear', tick0: 0, dtick: 20, ticksuffix: '%' },
            caxis: { title: 'Al₂O₃', min: 0, tickmode: 'linear', tick0: 0, dtick: 20, ticksuffix: '%' }
          },
          width: 500,
          height: 500,
          margin: { t: 30 },
          showlegend: true
        }}
      />

      <h4>登録済スラグ一覧:</h4>
      <ul>
        {dataPoints.map((p, idx) => (
          <li key={idx}>{p.name}（CaO: {p.CaO.toFixed(1)}%, SiO₂: {p.SiO2.toFixed(1)}%, Al₂O₃: {p.Al2O3.toFixed(1)}%）</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
