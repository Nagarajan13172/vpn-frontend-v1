import { type ReactNode } from "react";
import { motion } from "motion/react";

const pageTransition = {
  initial: { opacity: 0, width: 0 },
  animate: { opacity: 1, width: "100%" },
  exit: { opacity: 0, width: 0 },
};

export const MenuActiveWrapper = ({
  keyName,
  className = "bg-sidebar-accent",
  isActive,
  children,
}: {
  keyName: string;
  className?: string;
  lineColor?: string;
  isActive: boolean;
  children: ReactNode;
}) => {
  return (
    <div className="relative">
      {isActive && (
        <>
          <motion.div
            key={`bg-${keyName}`}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
            transition={{ duration: 0.5, type: "spring" }}
            className={`absolute top-0 left-0 h-full ${className} rounded-md z-0`}
          />
        </>
      )}
      <div className="relative z-20">{children}</div>{" "}
    </div>
  );
};