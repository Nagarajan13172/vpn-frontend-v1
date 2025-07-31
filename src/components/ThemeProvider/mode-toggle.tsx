// ModeToggle.tsx
import { Monitor, Moon, Sun } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

import { Button } from "@/components/ui/button";
import { useTheme } from "./theme-provider";


const CYCLE: Array<"light" | "dark" | "system"> = ["light", "dark", "system"];

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  // figure out next index in the cycle
  const currentIndex = CYCLE.indexOf(theme);
  const nextTheme = CYCLE[(currentIndex + 1) % CYCLE.length];

  const handleClick = () => {
    setTheme(nextTheme);
  };

  // pick icon based on current theme
  let Icon = Monitor;
  if (theme === "light") Icon = Sun;
  else if (theme === "dark") Icon = Moon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="h-fit w-7 p-1 md:w-fit md:p-2"
          onClick={handleClick}
        >
          {/* <RippleEffect className="bg-foreground/50" /> */}
          <Icon className="h-[1.2rem] w-[1.2rem] transition-transform" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Theme</p>
      </TooltipContent>
    </Tooltip>
  );
}