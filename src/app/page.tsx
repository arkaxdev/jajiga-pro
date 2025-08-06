"use client";

import { useState, useRef, type ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Wand2, CheckCircle2, XCircle, Trash2, Upload, ClipboardCopy, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

type Status = "idle" | "success" | "error";

export default function Home() {
  const [jsonInput, setJsonInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [theme, setTheme] = useState('dark');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/json") {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setJsonInput(text);
          setOutput("");
          setStatus("idle");
        };
        reader.readAsText(file);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a valid .json file.",
        });
      }
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleValidate = () => {
    if (!jsonInput.trim()) {
      setOutput("Input is empty.");
      setStatus("error");
      return;
    }
    try {
      JSON.parse(jsonInput);
      setOutput("JSON is valid!");
      setStatus("success");
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Invalid JSON: ${error.message}`);
      } else {
        setOutput("An unknown validation error occurred.");
      }
      setStatus("error");
    }
  };

  const handleFormat = () => {
     if (!jsonInput.trim()) {
      setOutput("Input is empty.");
      setStatus("error");
      return;
    }
    try {
      const parsedJson = JSON.parse(jsonInput);
      const formattedJson = JSON.stringify(parsedJson, null, 2);
      setJsonInput(formattedJson);
      setOutput(formattedJson);
      setStatus("success");
    } catch (error) {
       if (error instanceof Error) {
        setOutput(`Invalid JSON: ${error.message}`);
      } else {
        setOutput("An unknown formatting error occurred.");
      }
      setStatus("error");
    }
  };
  
  const handleClear = () => {
    setJsonInput("");
    setOutput("");
    setStatus("idle");
  };

  const handleCopy = () => {
    const textToCopy = status === 'success' && (output.startsWith('{') || output.startsWith('[')) ? output : jsonInput;
    if (!textToCopy) {
       toast({ title: "Nothing to copy", description: "There is no content to copy." });
       return;
    }
    navigator.clipboard.writeText(textToCopy).then(() => {
        setIsCopied(true);
        toast({ title: "Copied to clipboard!", description: "The content has been copied." });
        setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const statusIcons = {
    success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    idle: null,
  };

  const getOutputContent = () => {
    if (status === 'success' && (output.startsWith('{') || output.startsWith('['))) {
      return (
        <pre className="text-sm">
          <code>{output}</code>
        </pre>
      );
    }
    return (
      <div className="flex items-center gap-2 font-medium">
        {statusIcons[status]}
        <span>{output || "Awaiting your command..."}</span>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10 relative">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-pink-500">
            JSON Formatter & Validator
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">A simple and elegant tool to beautify and validate your JSON data.</p>
           <div className="absolute top-0 right-0">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Input Card */}
          <Card className="flex flex-col h-full shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>Paste your JSON below or upload a file.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
               <ScrollArea className="h-full w-full rounded-md border font-mono">
                <Textarea
                  placeholder='{ "key": "value" }'
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value);
                    setOutput('');
                    setStatus('idle');
                  }}
                  className="h-full min-h-[400px] w-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                  aria-label="JSON Input"
                />
              </ScrollArea>
            </CardContent>
            <CardFooter className="grid grid-cols-3 gap-2">
                <Button onClick={handleFormat}>
                  <Wand2 className="mr-2 h-4 w-4" /> Format
                </Button>
                <Button onClick={handleValidate} variant="secondary">
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Validate
                </Button>
                 <Button onClick={handleFileUploadClick} variant="outline">
                  <Upload className="mr-2 h-4 w-4" /> Upload
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".json"
                />
                 <Button onClick={handleClear} variant="destructive" className="col-start-3">
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
              </CardFooter>
          </Card>

          {/* Output Card */}
           <Card className="flex flex-col h-full shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Result</CardTitle>
              <CardDescription>Validation or formatting results will appear here.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
               <ScrollArea
                aria-live="polite"
                className={cn(
                  "w-full h-full min-h-[468px] rounded-md border p-4 bg-muted/30 font-mono",
                  {
                    "border-green-500/50 text-green-700 dark:text-green-400": status === "success",
                    "border-red-500/50 text-red-700 dark:text-red-400": status === "error",
                  }
                )}
              >
                {getOutputContent()}
              </ScrollArea>
            </CardContent>
             <CardFooter className="flex flex-col items-center p-6 pt-0">
                <p className="text-xs text-muted-foreground mb-2 w-full text-center">Click the button below to copy the result.</p>
                <Button
                  onClick={handleCopy}
                  className={cn(
                    "relative w-full overflow-hidden",
                    isCopied && "bg-green-500/20 border-green-500/50"
                  )}
                >
                  <span className={cn("transition-transform duration-300 flex items-center justify-center gap-2", isCopied ? "-translate-y-8 opacity-0" : "translate-y-0 opacity-100")}>
                    <ClipboardCopy className="h-4 w-4" />
                    Copy to Clipboard
                  </span>
                  <span className={cn("absolute inset-0 transition-transform duration-300 flex items-center justify-center gap-2 text-primary-foreground", isCopied ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0")}>
                    <CheckCircle2 className="h-4 w-4" />
                    Copied!
                  </span>
                </Button>
              </CardFooter>
          </Card>
        </div>
        
        <footer className="text-center mt-16 py-6 border-t">
          <p className="text-sm text-muted-foreground">
            Built with love and code. Licensed under MIT.
          </p>
        </footer>
      </div>
    </main>
  );
}
