import { motion } from 'framer-motion'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export default function PageWrapper({ children, className = '' }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`p-4 lg:p-8 min-h-full ${className}`}
    >
      {children}
    </motion.div>
  )
}
