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

    setDataList((prev) => [
      ...prev,
      {
        slagName,
        CaO: normCaO,
        SiO2: normSiO2,
        Al2O3: normAl2O3,
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

  const csRatio = (CaO, SiO2) => SiO2 !== 0 ? (CaO / SiO2).toFixed(2) : 'N/A';

  const phaseJudgement = (CaO, SiO2, Al2O3) => {
    if (CaO > 60 && Al2O3 < 10) return 'C₃S（初期強度、早期硬化）';
    if (CaO > 45 && SiO2 > 30 && Al2O3 < 15) return 'C₂S（長期強度、スラグ硬化型）';
    if (Al2O3 > 30 && CaO > 40) return 'C₃A（凝結反応、反応性高）';
    if (Al2O3 > 30 && CaO < 30) return 'CA・CA₂（耐火材、高温安定）';
    if (SiO2 > 60) return 'シリカリッチ（流動性高、硬化性低下）';
    return '中間相または複数相混在';
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto' }}>
      <h2>スラグ成分比較プロット（相判定・C/S比付き）</h2>

      <input placeholder="スラグ名" value={slagName} onChange={(e) => setSlagName(e.target.value)} style={{ width: '100%', marginBottom: '0.5rem' }} />
      <input name="CaO" placeholder="CaO (%)" value={formData.CaO} onChange={handleInputChange} style={{ width: '100%', marginBottom: '0.5rem' }} />
      <input name="SiO2" placeholder="SiO₂ (%)" value={formData.SiO2} onChange={handleInputChange} style={{ width: '100%', marginBottom: '0.5rem' }} />
      <input name="Al2O3" placeholder="Al₂O₃ (%)" value={formData.Al2O3} onChange={handleInputChange} style={{ width: '100%', marginBottom: '0.5rem' }} />
      <button onClick={addData} style={{ width: '100%', marginBottom: '1rem' }}>追加する</button>

      {dataList.map((d, i) => (
        <div key={i}>
          <label>
            <input type="checkbox" checked={d.visible} onChange={() => toggleVisibility(i)} />
            {d.slagName}｜相: {phaseJudgement(d.CaO, d.SiO2, d.Al2O3)}｜C/S: {csRatio(d.CaO, d.SiO2)}
          </label>
        </div>
      ))}

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <Plot
          data={dataList.filter(d => d.visible).map(d => ({
            type: 'scatterternary',
            mode: 'markers+text',
            a: [d.SiO2],
            b: [d.CaO],
            c: [d.Al2O3],
            marker: { size: 12 },
            name: d.slagName,
            text: d.slagName,
            textposition: 'top center'
          }))}
          layout={{
            ternary: {
              sum: 100,
              aaxis: { title: 'SiO₂', ticksuffix: '%', min: 0, dtick: 20 },
              baxis: { title: 'CaO', ticksuffix: '%', min: 0, dtick: 20 },
              caxis: { title: 'Al₂O₃', ticksuffix: '%', min: 0, dtick: 20 }
            },
            height: 500,
            showlegend: true,
            margin: { t: 20, l: 10, r: 10, b: 10 },
            legend: { orientation: 'h' }
          }}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}

export default App;
