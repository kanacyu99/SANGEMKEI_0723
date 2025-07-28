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
    const phase = getPhaseJudgement(normCaO, normSiO2, normAl2O3);

    setDataList((prev) => [
      ...prev,
      {
        slagName,
        CaO: normCaO,
        SiO2: normSiO2,
        Al2O3: normAl2O3,
        csRatio,
        phase,
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

  const getPhaseJudgement = (CaO, SiO2, Al2O3) => {
    if (CaO > 60 && Al2O3 < 10) {
      return `C₃S（トリカルシウムシリケート）領域の可能性です\n用途：セメントの初期強度発現に役立ちます。早期硬化性が高い。`;
    }
    if (CaO > 45 && SiO2 > 30 && Al2O3 < 15) {
      return `C₂S（ジカルシウムシリケート）領域の可能性です\n用途：長期強度に役立ちます。スラグ硬化型用途に多い。`;
    }
    if (Al2O3 > 30 && CaO > 40) {
      return `C₃A（トリカルシウムアルミネート）領域の可能性です\n用途：凝結反応に関与。反応性は高いが耐久性には注意。`;
    }
    if (Al2O3 > 30 && CaO < 30) {
      return `CA・CA₂領域の可能性です\n用途：耐火材や高アルミナセメント。高温安定性が高い。`;
    }
    if (SiO2 > 60) {
      return `シリカリッチ領域の可能性です\n用途：スラグ流動性向上。過剰で硬化性は低下。`;
    }
    return `中間相または複数相混在領域の可能性です\n用途：特性が明確でなく、調整によって性質が変動しやすい。`;
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto' }}>
      <h2>スラグ成分比較プロット（相判定・C/S比付き）</h2>

      <input placeholder="スラグ名" value={slagName} onChange={(e) => setSlagName(e.target.value)} style={{ width: '100%', marginBottom: '0.5rem' }} />
      <input name="CaO" placeholder="CaO (%)" value={formData.CaO} onChange={handleInputChange} style={{ width: '100%', marginBottom: '0.5rem' }} />
      <input name="SiO2" placeholder="SiO₂ (%)" value={formData.SiO2} onChange={handleInputChange} style={{ width: '100%', marginBottom: '0.5rem' }} />
      <input name="Al2O3" placeholder="Al₂O₃ (%)" value={formData.Al2O3} onChange={handleInputChange} style={{ width: '100%', marginBottom: '1rem' }} />
      <button onClick={addData} style={{ width: '100%', marginBottom: '1rem' }}>追加する</button>

      {dataList.map((d, i) => (
        <div key={i} style={{ background: '#f8f8f8', padding: '0.5rem', borderRadius: '6px', marginBottom: '0.5rem' }}>
          <label>
            <input type="checkbox" checked={d.visible} onChange={() => toggleVisibility(i)} />
            <strong> {d.slagName}</strong><br />
            ・C/S比: {d.csRatio.toFixed(2)}<br />
            ・判定: <span style={{ whiteSpace: 'pre-line' }}>{d.phase}</span>
          </label>
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
            aaxis: { title: 'SiO₂', ticksuffix: '%' },
            baxis: { title: 'CaO', ticksuffix: '%' },
            caxis: { title: 'Al₂O₃', ticksuffix: '%' }
          },
          height: 500,
          showlegend: true
        }}
        style={{ width: '100%' }}
      />
    </div>
  );
}

export default App;
