import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

function App() {
  const [inputs, setInputs] = useState({
    slagName: '',
    CaO: '', SiO2: '', Al2O3: '', MgO: '', Fe2O3: '', TiO2: ''
  });

  const [slagList, setSlagList] = useState(() => {
    const saved = localStorage.getItem('slagList');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('slagList', JSON.stringify(slagList));
  }, [slagList]);

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const addSlag = () => {
    const { slagName, CaO, SiO2, Al2O3 } = inputs;
    if (!slagName || !CaO || !SiO2 || !Al2O3) return;

    const total = parseFloat(CaO) + parseFloat(SiO2) + parseFloat(Al2O3);
    const norm = {
      slagName,
      CaO: (parseFloat(CaO) / total) * 100,
      SiO2: (parseFloat(SiO2) / total) * 100,
      Al2O3: (parseFloat(Al2O3) / total) * 100,
    };
    setSlagList([...slagList, norm]);
    setInputs({ slagName: '', CaO: '', SiO2: '', Al2O3: '', MgO: '', Fe2O3: '', TiO2: '' });
  };

  const deleteSlag = (index) => {
    const newList = [...slagList];
    newList.splice(index, 1);
    setSlagList(newList);
  };

  const judgePhase = (CaO, SiO2, Al2O3) => {
    if (CaO > 60 && Al2O3 < 10) return 'C₃S（初期強度・早期硬化）';
    if (CaO > 45 && SiO2 > 30 && Al2O3 < 15) return 'C₂S（長期強度）';
    if (Al2O3 > 30 && CaO > 40) return 'C₃A（反応性高い・耐久性注意）';
    if (Al2O3 > 30 && CaO < 30) return 'CA・CA₂（高温用途・耐火材）';
    if (SiO2 > 60) return 'シリカリッチ（流動性↑、硬化性↓）';
    return '中間相または複数相混在';
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif', maxWidth: 800, margin: 'auto' }}>
      <h2>三元組成プロット（CaO–SiO₂–Al₂O₃）＋相領域判定＋C/S比</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {['slagName', 'CaO', 'SiO2', 'Al2O3', 'MgO', 'Fe2O3', 'TiO2'].map((key) => (
          <input
            key={key}
            name={key}
            placeholder={key}
            value={inputs[key]}
            onChange={handleChange}
            style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: 4 }}
          />
        ))}
        <button onClick={addSlag} style={{ padding: '0.5rem', background: '#0088cc', color: '#fff', border: 'none' }}>追加する</button>
      </div>

      <ul>
        {slagList.map((slag, index) => {
          const cs = slag.SiO2 !== 0 ? (slag.CaO / slag.SiO2).toFixed(2) : '-';
          const phase = judgePhase(slag.CaO, slag.SiO2, slag.Al2O3);
          return (
            <li key={index} style={{ margin: '0.5rem 0' }}>
              <strong>{slag.slagName}</strong>（CaO: {slag.CaO.toFixed(1)}%, SiO₂: {slag.SiO2.toFixed(1)}%, Al₂O₃: {slag.Al2O3.toFixed(1)}%）<br />
              C/S比: {cs}｜判定: {phase}
              <button onClick={() => deleteSlag(index)} style={{ marginLeft: 10, color: 'red' }}>削除</button>
            </li>
          );
        })}
      </ul>

      <Plot
        data={slagList.map((slag) => ({
          type: 'scatterternary',
          mode: 'markers',
          a: [slag.SiO2],
          b: [slag.CaO],
          c: [slag.Al2O3],
          name: slag.slagName,
          marker: { size: 12 }
        }))}
        layout={{
          ternary: {
            sum: 100,
            aaxis: { title: 'SiO₂', ticksuffix: '%', min: 0 },
            baxis: { title: 'CaO', ticksuffix: '%', min: 0 },
            caxis: { title: 'Al₂O₃', ticksuffix: '%', min: 0 }
          },
          height: 600,
          margin: { t: 30, l: 10, r: 10, b: 30 },
          showlegend: true
        }}
        style={{ width: '100%' }}
      />
    </div>
  );
}

export default App;
