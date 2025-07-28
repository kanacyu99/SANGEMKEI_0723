import React, { useState } from 'react';
import Plot from 'react-plotly.js';

function App() {
  const [slagName, setSlagName] = useState('');
  const [formData, setFormData] = useState({
    CaO: '', SiO2: '', Al2O3: '', MgO: '', Fe2O3: '', TiO2: ''
  });
  const [slagList, setSlagList] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addSlag = () => {
    const total = ['CaO', 'SiO2', 'Al2O3'].reduce((sum, key) => sum + parseFloat(formData[key] || 0), 0);
    if (!slagName || total === 0) return;

    const norm = {
      CaO: (parseFloat(formData.CaO) / total) * 100,
      SiO2: (parseFloat(formData.SiO2) / total) * 100,
      Al2O3: (parseFloat(formData.Al2O3) / total) * 100
    };

    const cs = norm.SiO2 !== 0 ? norm.CaO / norm.SiO2 : null;

    const judge = (() => {
      const { CaO, SiO2, Al2O3 } = norm;
      if (CaO > 60 && Al2O3 < 10) return `C₃S（トリカルシウムシリケート）領域の可能性`;
      if (CaO > 45 && SiO2 > 30 && Al2O3 < 15) return `C₂S（ジカルシウムシリケート）領域の可能性`;
      if (Al2O3 > 30 && CaO > 40) return `C₃A（トリカルシウムアルミネート）領域の可能性`;
      if (Al2O3 > 30 && CaO < 30) return `CA・CA₂領域の可能性`;
      if (SiO2 > 60) return `シリカリッチ領域の可能性`;
      return `中間相または複数相混在領域の可能性`;
    })();

    setSlagList(prev => [
      ...prev,
      {
        name: slagName,
        norm,
        cs,
        judge,
        visible: true
      }
    ]);

    setSlagName('');
    setFormData({ CaO: '', SiO2: '', Al2O3: '', MgO: '', Fe2O3: '', TiO2: '' });
  };

  const toggleVisible = (index) => {
    const updated = [...slagList];
    updated[index].visible = !updated[index].visible;
    setSlagList(updated);
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto' }}>
      <h2>スラグ成分比較プロット（相判定・C/S比付き）</h2>

      <input
        placeholder="スラグ名"
        value={slagName}
        onChange={(e) => setSlagName(e.target.value)}
        style={{ width: '100%', marginBottom: '0.5rem' }}
      />
      {['CaO', 'SiO2', 'Al2O3', 'MgO', 'Fe2O3', 'TiO2'].map((key) => (
        <input
          key={key}
          name={key}
          placeholder={`${key} (%)`}
          value={formData[key]}
          onChange={handleChange}
          style={{ width: '100%', marginBottom: '0.5rem' }}
        />
      ))}
      <button onClick={addSlag} style={{ width: '100%', marginBottom: '1rem' }}>追加する</button>

      {slagList.map((slag, i) => (
        <div key={i} style={{ marginBottom: '1rem', background: '#f8f8f8', padding: '0.5rem', borderRadius: '6px' }}>
          <label>
            <input
              type="checkbox"
              checked={slag.visible}
              onChange={() => toggleVisible(i)}
              style={{ marginRight: '0.5rem' }}
            />
            <strong>{slag.name}</strong>
          </label>
          <ul style={{ margin: '0.5rem 0' }}>
            <li>CaO: {slag.norm.CaO.toFixed(1)}%</li>
            <li>SiO₂: {slag.norm.SiO2.toFixed(1)}%</li>
            <li>Al₂O₃: {slag.norm.Al2O3.toFixed(1)}%</li>
            <li>C/S比: {slag.cs?.toFixed(2)}</li>
          </ul>
          <div style={{ whiteSpace: 'pre-wrap' }}>🔎 判定：{slag.judge}</div>
        </div>
      ))}

      <Plot
        data={slagList.filter(s => s.visible).map(slag => ({
          type: 'scatterternary',
          mode: 'markers+text',
          a: [slag.norm.SiO2],
          b: [slag.norm.CaO],
          c: [slag.norm.Al2O3],
          name: slag.name,
          marker: { size: 12 }
        }))}
        layout={{
          ternary: {
            sum: 100,
            aaxis: { title: 'SiO₂', ticksuffix: '%' },
            baxis: { title: 'CaO', ticksuffix: '%' },
            caxis: { title: 'Al₂O₃', ticksuffix: '%' }
          },
          showlegend: true,
          height: 500
        }}
        style={{ width: '100%' }}
      />
    </div>
  );
}

export default App;
