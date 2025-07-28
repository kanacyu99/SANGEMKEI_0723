import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

function App() {
  const [slagList, setSlagList] = useState([]);
  const [input, setInput] = useState({
    name: '', CaO: '', SiO2: '', Al2O3: '', MgO: '', Fe2O3: '', TiO2: ''
  });

  // ローカルストレージから読み込み
  useEffect(() => {
    const saved = localStorage.getItem('slagList');
    if (saved) {
      setSlagList(JSON.parse(saved));
    }
  }, []);

  // ローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('slagList', JSON.stringify(slagList));
  }, [slagList]);

  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const parseNum = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const handleAdd = () => {
    const CaO = parseNum(input.CaO);
    const SiO2 = parseNum(input.SiO2);
    const Al2O3 = parseNum(input.Al2O3);
    const total = CaO + SiO2 + Al2O3;

    if (total === 0) return;

    const normalized = {
      name: input.name || `スラグ${slagList.length + 1}`,
      CaO: (CaO / total) * 100,
      SiO2: (SiO2 / total) * 100,
      Al2O3: (Al2O3 / total) * 100,
      csRatio: SiO2 !== 0 ? CaO / SiO2 : null
    };

    setSlagList([...slagList, normalized]);
    setInput({ name: '', CaO: '', SiO2: '', Al2O3: '', MgO: '', Fe2O3: '', TiO2: '' });
  };

  const handleDelete = (index) => {
    const updatedList = slagList.filter((_, i) => i !== index);
    setSlagList(updatedList);
  };

  const phaseJudgement = (CaO, SiO2, Al2O3) => {
    if (CaO > 60 && Al2O3 < 10) return 'C₃S領域の可能性';
    if (CaO > 45 && SiO2 > 30 && Al2O3 < 15) return 'C₂S領域の可能性';
    if (Al2O3 > 30 && CaO > 40) return 'C₃A領域の可能性';
    if (Al2O3 > 30 && CaO < 30) return 'CA・CA₂領域の可能性';
    if (SiO2 > 60) return 'シリカリッチ領域の可能性';
    return '中間相または複数相混在領域';
  };

  const plotData = slagList.map((slag) => ({
    type: 'scatterternary',
    mode: 'markers+text',
    a: [parseFloat(slag.SiO2)],
    b: [parseFloat(slag.CaO)],
    c: [parseFloat(slag.Al2O3)],
    text: slag.name,
    name: slag.name,
    marker: { size: 10 }
  }));

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', fontFamily: 'sans-serif', padding: '1rem' }}>
      <h2>三元組成プロット（CaO–SiO₂–Al₂O₃）＋相領域判定＋C/S比</h2>

      {['name', 'CaO', 'SiO2', 'Al2O3', 'MgO', 'Fe2O3', 'TiO2'].map((key) => (
        <input
          key={key}
          name={key}
          placeholder={key}
          value={input[key]}
          onChange={handleChange}
          style={{ width: '100%', margin: '0.2rem 0', padding: '0.4rem' }}
        />
      ))}
      <button
        onClick={handleAdd}
        style={{
          width: '100%', padding: '0.6rem', marginTop: '0.5rem',
          backgroundColor: '#0b78e3', color: 'white', border: 'none', borderRadius: '4px'
        }}
      >
        ➕ 追加する
      </button>

      <ul style={{ paddingLeft: '1rem' }}>
        {slagList.map((s, idx) => (
          <li key={idx} style={{ marginBottom: '1rem' }}>
            <strong>{s.name}</strong><br />
            CaO: {s.CaO.toFixed(1)}%, SiO₂: {s.SiO2.toFixed(1)}%, Al₂O₃: {s.Al2O3.toFixed(1)}%<br />
            📐 C/S比: {s.csRatio?.toFixed(2)}<br />
            🔎 判定: {phaseJudgement(s.CaO, s.SiO2, s.Al2O3)}<br />
            <button onClick={() => handleDelete(idx)} style={{ marginTop: '0.2rem' }}>❌ 削除</button>
          </li>
        ))}
      </ul>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <Plot
          data={plotData}
          layout={{
            ternary: {
              sum: 100,
              aaxis: { title: 'SiO₂', ticksuffix: '%', min: 0 },
              baxis: { title: 'CaO', ticksuffix: '%', min: 0 },
              caxis: { title: 'Al₂O₃', ticksuffix: '%', min: 0 }
            },
            showlegend: true,
            height: 600,
            margin: { l: 10, r: 10, b: 10, t: 10 }
          }}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}

export default App;
