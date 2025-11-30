import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
} from 'recharts';
import styles from './DashboardCharts.module.css';

// Sample data - replace with real API data
const monthlyData = [
  { month: 'Jan', events: 12, users: 45, registrations: 180 },
  { month: 'Feb', events: 15, users: 52, registrations: 220 },
  { month: 'Mar', events: 18, users: 68, registrations: 290 },
  { month: 'Apr', events: 22, users: 75, registrations: 340 },
  { month: 'May', events: 20, users: 89, registrations: 380 },
  { month: 'Jun', events: 25, users: 102, registrations: 420 },
];

const categoryData = [
  { name: 'Environment', value: 35, color: '#4caf50' },
  { name: 'Education', value: 25, color: '#2196f3' },
  { name: 'Health', value: 20, color: '#f44336' },
  { name: 'Community', value: 15, color: '#ff9800' },
  { name: 'Others', value: 5, color: '#9c27b0' },
];

const weeklyRegistrations = [
  { day: 'Mon', count: 24 },
  { day: 'Tue', count: 35 },
  { day: 'Wed', count: 28 },
  { day: 'Thu', count: 42 },
  { day: 'Fri', count: 38 },
  { day: 'Sat', count: 52 },
  { day: 'Sun', count: 31 },
];

function EventsChart() {
  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>Events Overview</h3>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 12 }} />
            <YAxis tick={{ fill: '#666', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            />
            <Area
              type="monotone"
              dataKey="events"
              stroke="#667eea"
              strokeWidth={3}
              fill="url(#colorEvents)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function UsersGrowthChart() {
  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>User Growth</h3>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 12 }} />
            <YAxis tick={{ fill: '#666', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="users"
              name="Users"
              stroke="#764ba2"
              strokeWidth={3}
              dot={{ fill: '#764ba2', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="registrations"
              name="Registrations"
              stroke="#43a047"
              strokeWidth={3}
              dot={{ fill: '#43a047', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CategoryPieChart() {
  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>Events by Category</h3>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
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
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function WeeklyBarChart() {
  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>Weekly Registrations</h3>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyRegistrations}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="day" tick={{ fill: '#666', fontSize: 12 }} />
            <YAxis tick={{ fill: '#666', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            />
            <Bar
              dataKey="count"
              name="Registrations"
              fill="#667eea"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DashboardCharts() {
  return (
    <div className={styles.chartsGrid}>
      <EventsChart />
      <UsersGrowthChart />
      <CategoryPieChart />
      <WeeklyBarChart />
    </div>
  );
}

export { DashboardCharts, EventsChart, UsersGrowthChart, CategoryPieChart, WeeklyBarChart };
export default DashboardCharts;
