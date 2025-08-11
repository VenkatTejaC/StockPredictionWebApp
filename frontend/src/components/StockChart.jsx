import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function StockChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="Date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="Close" stroke="#007bff" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
