import { type ReactNode } from "react";
import { motion, easeIn, easeInOut } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: easeIn },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.3, ease: easeInOut },
  },
};

export const PageWrapper = ({
  children,
  keyName,
}: {
  children: ReactNode;
  keyName: string;
}) => {
  return (
    <motion.div
      variants={pageVariants}
      key={keyName}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};