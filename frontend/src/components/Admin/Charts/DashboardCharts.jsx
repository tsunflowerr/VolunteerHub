import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import styles from './DashboardCharts.module.css';

const COLORS = [
  '#FF8042',
  '#00C49F',
  '#FFBB28',
  '#0088FE',
  '#8884d8',
  '#82ca9d',
  '#a4de6c',
];

function EventStatusChart({ data }) {
  const chartData = [
    { name: 'Pending', value: data?.pending || 0, color: '#f4991a' },
    { name: 'Approved', value: data?.approved || 0, color: '#43a047' },
    { name: 'Rejected', value: data?.rejected || 0, color: '#e53935' },
    { name: 'Completed', value: data?.completed || 0, color: '#2196f3' },
    { name: 'Cancelled', value: data?.cancelled || 0, color: '#9e9e9e' },
  ].filter((item) => item.value > 0);

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>Events by Status</h3>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function EventCategoryChart({ data }) {
  // Data expects { name: string, count: number, color: string }
  const chartData = (data || []).map((item) => ({
    name: item.name,
    value: item.count,
    color: item.color || '#667eea',
  }));

  if (!chartData || chartData.length === 0) {
    return (
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Events by Category</h3>
        <div
          className={`${styles.chartContainer} flex items-center justify-center text-gray-500`}
        >
          No category data available
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>Events by Category</h3>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function GrowthChart({ userGrowth, eventGrowth }) {
  // Process and merge data
  const processData = () => {
    const dataMap = new Map();

    // Helper to format week label
    const getLabel = (item) => `W${item.week}`;
    const getKey = (item) => `${item.year}-${item.week}`;

    (userGrowth || []).forEach((item) => {
      const key = getKey(item);
      if (!dataMap.has(key))
        dataMap.set(key, {
          name: getLabel(item),
          users: 0,
          events: 0,
          sortKey: key,
        });
      dataMap.get(key).users = item.count;
    });

    (eventGrowth || []).forEach((item) => {
      const key = getKey(item);
      if (!dataMap.has(key))
        dataMap.set(key, {
          name: getLabel(item),
          users: 0,
          events: 0,
          sortKey: key,
        });
      dataMap.get(key).events = item.count;
    });

    return Array.from(dataMap.values()).sort((a, b) =>
      a.sortKey.localeCompare(b.sortKey)
    );
  };

  const chartData = processData();

  return (
    <div className={styles.chartCard} style={{ gridColumn: 'span 2' }}>
      <h3 className={styles.chartTitle}>Weekly Growth (Last 12 Weeks)</h3>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 12 }} />
            <YAxis tick={{ fill: '#666', fontSize: 12 }} />
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#eee"
            />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="users"
              name="New Users"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorUsers)"
            />
            <Area
              type="monotone"
              dataKey="events"
              name="New Events"
              stroke="#82ca9d"
              fillOpacity={1}
              fill="url(#colorEvents)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DashboardCharts({ stats }) {
  return (
    <div className={styles.chartsGrid}>
      <GrowthChart
        userGrowth={stats?.userStatistics?.growth}
        eventGrowth={stats?.eventStatistics?.growth}
      />
      <EventStatusChart data={stats?.eventStatistics?.byStatus} />
      <EventCategoryChart data={stats?.eventStatistics?.byCategory} />
    </div>
  );
}

export { DashboardCharts, EventStatusChart, EventCategoryChart, GrowthChart };
export default DashboardCharts;
