import { motion } from 'framer-motion'

export default function EmptyState({ title = 'Nada por aqui', description, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="mb-4 opacity-30">
        {Icon ? (
          <Icon size={64} className="text-muted-foreground" />
        ) : (
          <img src="/logo.png" alt="Dante" width={72} height={72} className="object-contain" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-foreground/70 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      )}
    </motion.div>
  )
}
