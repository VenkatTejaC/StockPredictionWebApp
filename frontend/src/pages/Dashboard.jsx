import { useEffect, useState } from "react";
import axios from "axios";
import StockChart from "../components/StockChart";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [stockData, setStockData] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [ticker, setTicker] = useState("AAPL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [daysAhead, setDaysAhead] = useState(5);
  const [aboutText, setAboutText] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedQuarters, setSelectedQuarters] = useState([]);
  const [quarterlyData, setQuarterlyData] = useState({});

  const fetchStockData = () => {
    let url = `http://127.0.0.1:8000/stock/${ticker}`;
    if (fromDate && toDate) {
      url += `?start=${fromDate}&end=${toDate}`;
    }

    axios
      .get(url)
      .then((res) => setStockData(res.data.data))
      .catch((err) => console.error("Error fetching stock data:", err));
  };

  useEffect(() => {
  axios
    .get(`http://127.0.0.1:8000/about/${ticker}`)
    .then((res) => setAboutText(res.data.description))
    .catch(() => setAboutText("No description available."));
}, [ticker]);

  const fetchPredictions = () => {
    axios
      .get(`http://127.0.0.1:8000/predict/${ticker}?days_ahead=${daysAhead}`)
      .then((res) => setPredictions(res.data.predictions))
      .catch((err) => console.error("Error fetching predictions:", err));
  };

  const fetchQuarterlyData = () => {
    if (selectedQuarters.length === 0) {
      setQuarterlyData({});
      return;
    }
    axios
      .get(
        `http://127.0.0.1:8000/quarterly/${ticker}?year=${year}&quarters=${selectedQuarters.join(",")}`
      )
      .then((res) => setQuarterlyData(res.data.quarters))
      .catch((err) => console.error("Error fetching quarterly data:", err));
  };

  useEffect(() => {
    fetchStockData();
  }, [ticker, fromDate, toDate]);

  useEffect(() => {
    fetchPredictions();
  }, [ticker, daysAhead]);

  useEffect(() => {
    fetchQuarterlyData();
  }, [ticker, year, selectedQuarters]);

  const predictionChartData = {
    labels: predictions.map((_, idx) => `Day ${idx + 1}`),
    datasets: [
      {
        label: `Predicted Price (${ticker})`,
        data: predictions,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        tension: 0.3,
      },
    ],
  };

  const predictionChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `Prediction Trend for ${ticker}`,
      },
    },
  };

  const yearsList = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - i);
  const quarterOptions = ["Q1", "Q2", "Q3", "Q4"];

  const handleQuarterChange = (q) => {
    setSelectedQuarters((prev) =>
      prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q]
    );
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <h1>{ticker} Stock Dashboard</h1>
        <select value={ticker} onChange={(e) => setTicker(e.target.value)}>
          <option value="AAPL">AAPL</option>
          <option value="GOOG">GOOG</option>
          <option value="MSFT">MSFT</option>
          <option value="TSLA">TSLA</option>
          <option value="AMZN">AMZN</option>
        </select>
      </div>

    {aboutText && (
  <div className="card">
    <h3>About {ticker}</h3>
    <p>{aboutText}</p>
  </div>
    )}


      {/* Stock chart */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          <h2>Stock Price History</h2>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <label>From:</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            <label>To:</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </div>
        <StockChart data={stockData} />
      </div>

      {/* Predictions */}
      <div className="card" style={{ display: "flex", gap: "2rem" }}>
        <div style={{ flex: 1 }}>
          <h2>Predictions (Next {daysAhead} Days)</h2>
          <div style={{ marginBottom: "10px" }}>
            <select value={daysAhead} onChange={(e) => setDaysAhead(Number(e.target.value))}>
              <option value={5}>Next 5 Days</option>
              <option value={7}>Next 7 Days</option>
              <option value={14}>Next 14 Days</option>
              <option value={21}>Next 21 Days</option>
              <option value={28}>Next 28 Days</option>
            </select>
          </div>
          <ul>
            {predictions.map((p, idx) => (
              <li key={idx}>
                Day {idx + 1}: ${p.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 1 }}>
          <Line data={predictionChartData} options={predictionChartOptions} />
        </div>
      </div>

      {/* Quarterly Analysis */}
      <div className="card">
        <h2>Quarterly Analysis</h2>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {yearsList.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {quarterOptions.map((q) => (
              <label key={q}>
                <input
                  type="checkbox"
                  checked={selectedQuarters.includes(q)}
                  onChange={() => handleQuarterChange(q)}
                />
                {q}
              </label>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${selectedQuarters.length}, 1fr)`, gap: "1rem" }}>
          {Object.keys(quarterlyData).map((q) => (
            <div key={q} style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
              <h3>{q} - {year}</h3>
              {quarterlyData[q]?.length > 0 ? (
                <StockChart data={quarterlyData[q]} />
              ) : (
                <p>No data available</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
