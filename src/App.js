import React, { useState } from 'react';
import Plot from 'react-plotly.js';

function App() {
  const [slagName, setSlagName] = useState('');
  const [formData, setFormData] = useState({ CaO: '', SiO2: '', Al2O3: '' });
  const [dataList, setDataList] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addData = () => {
    const { CaO, SiO2, Al2O3 } = formData;
    const total = parseFloat(CaO) + parseFloat(SiO2) + parseFloat(Al2O3);
    if (total === 0 || !slagName) return;

    const normCaO = (parseFloat(CaO) / total) * 100;
    const normSiO2 = (parseFloat(SiO2) / total) * 100;
    const normAl2O3 = (parseFloat(Al2O3) / total) * 100;
    const csRatio = normSiO2 !== 0 ? normCaO / normSiO2 : null;

    const judgement = (() => {
      if (normCaO > 60 && normAl2O3 < 10) {
        return 'C₃S（トリカルシウムシリケート）領域の可能性です\n用途：セメントの初期強度発現に寄与。早期硬化性が高い。';
      }
      if (normCaO > 45 && normSiO2 > 30 && normAl2O3 < 15) {
        return 'C₂S（ジカルシウムシリケート）領域の可能性です\n用途：長期強度に寄与。スラグ硬化型用途に多い。';
      }
      if (normAl2O3 > 30 && normCaO > 40) {
        return 'C₃A（トリカルシウムアルミネート）領域の可能性です\n用途：凝結反応に関与。反応性は高いが耐久性には注意。';
      }
      if (normAl2O3 > 30 && normCaO < 30) {
        return 'CA・CA₂領域の可能性です\n用途：耐火材や高アルミナセメント。高温安定性が高い。';
      }
      if (normSiO2 > 60) {
        return 'シリカリッチ領域の可能性です\n用途：スラグ流動性向上。過剰で硬化性は低下。';
      }
      return '中間相または複数相混在領域の可能性です\n用途：特性が明確でなく、調整によって性質が変動しやすい。';
    })();

    setDataList((prev) => [
      ...prev,
      {
        slagName,
        CaO: normCaO,
        SiO2: normSiO2,
        Al2O3: normAl2O3,
        csRatio,
        judgement,
        visible: true
      }
    ]);

    setSlagName('');
    setFormData({ CaO: '', SiO2: '', Al2O3: '' });
  };

  const toggleVisibility = (index) => {
    const newDataList = [...dataList];
    newDataList[index].visible = !newDataList[index].visible;
    setDataList(newDataList);
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif', maxWidth: '700px', margin: 'auto' }}>
      <h2>スラグ成分入力＆三元プロット＋C/S比＋相領域判定</h2>

      <input placeholder="スラグ名" value={slagName} onChange={(e) => setSlagName(e.target.value)} style={{ width: '100%', marginBottom: '0.5rem' }} />
      <input name="CaO" placeholder="CaO (%)" value={formData.CaO} onChange={handleInputChange} style={{ width: '100%', marginBottom: '0.5rem' }} />
      <input name="SiO2" placeholder="SiO₂ (%)" value={formData.SiO2} onChange={handleInputChange} style={{ width: '100%', marginBottom: '0.5rem' }} />
      <input name="Al2O3" placeholder="Al₂O₃ (%)" value={formData.Al2O3} onChange={handleInputChange} style={{ width: '100%', marginBottom: '1rem' }} />
      <button onClick={addData} style={{ width: '100%', marginBottom: '1rem' }}>追加する</button>

      {dataList.map((d, i) => (
        <div key={i} style={{ marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}>
          <label>
            <input type="checkbox" checked={d.visible} onChange={() => toggleVisibility(i)} /> {d.slagName}
          </label>
          <ul>
            <li>CaO: {d.CaO.toFixed(1)}%</li>
            <li>SiO₂: {d.SiO2.toFixed(1)}%</li>
            <li>Al₂O₃: {d.Al2O3.toFixed(1)}%</li>
            <li>📐 C/S比: {d.csRatio ? d.csRatio.toFixed(2) : '―'}</li>
          </ul>
          <div style={{ background: '#eef', padding: '0.5rem', borderRadius: '6px', whiteSpace: 'pre-wrap' }}>
            🔎 判定結果：<br />{d.judgement}
          </div>
        </div>
      ))}

      <Plot
        data={dataList.filter(d => d.visible).map(d => ({
          type: 'scatterternary',
          mode: 'markers+text',
          a: [d.SiO2],
          b: [d.CaO],
          c: [d.Al2O3],
          marker: { size: 12 },
          name: d.slagName
        }))}
        layout={{
          ternary: {
            sum: 100,
            aaxis: { title: 'SiO₂', ticksuffix: '%', min: 0 },
            baxis: { title: 'CaO', ticksuffix: '%', min: 0 },
            caxis: { title: 'Al₂O₃', ticksuffix: '%', min: 0 }
          },
          margin: { t: 20, l: 10, r: 10, b: 10 },
          showlegend: true,
          height: 500
        }}
        style={{ width: '100%' }}
      />
    </div>
  );
}

export default App;
