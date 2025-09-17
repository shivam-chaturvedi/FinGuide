import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Palette, Check } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          <span className="text-sm font-medium hidden sm:inline">Theme</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Choose Your Theme
          </SheetTitle>
          <SheetDescription>
            Select a theme that matches your style and enhances your financial learning experience.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {themes.map((themeOption) => (
            <div
              key={themeOption.id}
              className={cn(
                "relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
                theme === themeOption.id 
                  ? "border-primary bg-primary/5 shadow-soft" 
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => {
                setTheme(themeOption.id);
                setOpen(false);
              }}
            >
              {theme === themeOption.id && (
                <Check className="absolute top-3 right-3 h-5 w-5 text-primary" />
              )}
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-foreground">{themeOption.name}</h4>
                  <p className="text-sm text-muted-foreground">{themeOption.description}</p>
                </div>
                
                <div className="flex gap-2">
                  {themeOption.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <div className="flex-1 h-3 rounded-full" style={{ 
                    background: `linear-gradient(135deg, ${themeOption.colors[0]}, ${themeOption.colors[1]})` 
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h5 className="font-medium text-sm mb-2">💡 Theme Benefits</h5>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Reduces eye strain during learning</li>
            <li>• Improves focus and concentration</li>
            <li>• Personalizes your experience</li>
            <li>• Syncs across all devices</li>
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}