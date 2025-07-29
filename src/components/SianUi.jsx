import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { Loader2, AlertTriangle, ChevronDown } from "lucide-react";

// --- คอมโพเนนต์ UI (ปุ่ม, การ์ด, ตาราง, ฯลฯ) ---
export const Card = forwardRef((props, ref) => <div ref={ref} className={cn("rounded-xl border bg-card text-card-foreground shadow", props.className)} {...props} />);
export const CardHeader = forwardRef((props, ref) => <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", props.className)} {...props} />);
export const CardTitle = forwardRef((props, ref) => <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight", props.className)} {...props} />);
export const CardDescription = forwardRef((props, ref) => <p ref={ref} className={cn("text-sm text-muted-foreground", props.className)} {...props} />);
export const CardContent = forwardRef((props, ref) => <div ref={ref} className={cn("p-6 pt-0", props.className)} {...props} />);

export const Button = forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const variants = { default: "bg-primary text-primary-foreground hover:bg-primary/90", destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90", outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground", secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80", ghost: "hover:bg-accent hover:text-accent-foreground", link: "text-primary underline-offset-4 hover:underline" };
  const sizes = { default: "h-10 px-4 py-2", sm: "h-9 rounded-md px-3", lg: "h-11 rounded-md px-8", icon: "h-10 w-10" };
  return <button className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", variants[variant], sizes[size], className)} ref={ref} {...props} />;
});

export const Input = forwardRef((props, ref) => <input className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", props.className)} ref={ref} {...props} />);
export const Textarea = forwardRef((props, ref) => <textarea className={cn("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", props.className)} ref={ref} {...props} />);
export const Select = forwardRef(({ className, children, ...props }, ref) => <div className="relative"><select className={cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none", className)} ref={ref} {...props}>{children}</select><ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" /></div>);
export const Label = forwardRef((props, ref) => <label ref={ref} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", props.className)} {...props} />);
export const Alert = forwardRef((props, ref) => <div ref={ref} role="alert" className={cn("relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground", props.className)} {...props} />);
export const AlertTitle = forwardRef((props, ref) => <h5 ref={ref} className={cn("mb-1 font-medium leading-none tracking-tight", props.className)} {...props} />);
export const AlertDescription = forwardRef((props, ref) => <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", props.className)} {...props} />);
export const Badge = forwardRef(({ className, variant, ...props }, ref) => {
    const variants = { default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80", approved: "border-transparent bg-green-100 text-green-800", pending: "border-transparent bg-yellow-100 text-yellow-800", rejected: "border-transparent bg-red-100 text-red-800" };
    return <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variants[variant], className)} ref={ref} {...props} />;
});
export const Progress = forwardRef(({ className, value, ...props }, ref) => <div ref={ref} className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)} {...props}><div className="h-full w-full flex-1 bg-primary transition-all" style={{ transform: `translateX(-${100 - (value || 0)}%)` }} /></div>);
export const Table = forwardRef((props, ref) => <table ref={ref} className={cn("w-full caption-bottom text-sm", props.className)} {...props} />);
export const TableHeader = forwardRef((props, ref) => <thead ref={ref} className={cn("[&_tr]:border-b", props.className)} {...props} />);
export const TableBody = forwardRef((props, ref) => <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", props.className)} {...props} />);
export const TableRow = forwardRef((props, ref) => <tr ref={ref} className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", props.className)} {...props} />);
export const TableHead = forwardRef((props, ref) => <th ref={ref} className={cn("h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0", props.className)} {...props} />);
export const TableCell = forwardRef((props, ref) => <td ref={ref} className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", props.className)} {...props} />);

export const LoadingSpinner = () => (<div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>);


// =======================================================================
// FILE: src/components/common/ErrorMessage.js
// =======================================================================
export const ErrorMessage = ({ message, onRetry }) => (
    <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
        <AlertDescription>{message || "ไม่สามารถโหลดข้อมูลได้"}</AlertDescription>
        {onRetry && <Button onClick={onRetry} variant="destructive" size="sm" className="mt-4">ลองอีกครั้ง</Button>}
    </Alert>
)


