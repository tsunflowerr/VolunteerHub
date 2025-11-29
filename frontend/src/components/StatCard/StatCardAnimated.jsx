import { motion } from 'framer-motion'
import styles from './StatCard.module.css'

/**
 * StatCard with Framer Motion Animation
 * Uses CSS Modules for styling
 */
function StatCardAnimated({ title, value, icon, color }) {
  return (
    <motion.div 
      className={styles.card}
      style={{ borderLeftColor: color }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className={styles.icon} style={{ color, backgroundColor: `${color}15` }}>
        {icon}
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.value}>{value}</p>
      </div>
    </motion.div>
  )
}

export default StatCardAnimated
