/**
 * BƯỚC 3: Component con - StatCard
 * 
 * Khái niệm mới:
 * 1. Props - Cách truyền dữ liệu từ component cha xuống con
 * 2. Destructuring - Lấy giá trị từ object
 * 3. Component tái sử dụng - Viết 1 lần, dùng nhiều lần
 */

// Props là tham số của component (giống function parameter)
// { title, value, icon, color } là destructuring
function StatCard({ title, value, icon, color }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-icon" style={{ backgroundColor: color + '20' }}>
        {icon}
      </div>
      <div className="stat-info">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  )
}

export default StatCard
