"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Wand2, CheckCircle2, XCircle, Trash2, Upload, FileJson, ClipboardCopy } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "idle" | "success" | "error";

export default function Home() {
  const [jsonInput, setJsonInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const handleLoadExample = async () => {
    try {
      const response = await fetch('/example.json');
      const data = await response.json();
      const formattedJson = JSON.stringify(data, null, 2);
      setJsonInput(formattedJson);
      setOutput("");
      setStatus("idle");
    } catch (error) {
       toast({
          variant: "destructive",
          title: "Failed to load example",
          description: "Could not fetch the example.json file.",
        });
    }
  };

  const handleCopy = () => {
    const textToCopy = status === 'success' && output.startsWith('{') ? output : jsonInput;
    if (!textToCopy) {
       toast({ title: "Nothing to copy", description: "There is no content to copy." });
       return;
    }
    navigator.clipboard.writeText(textToCopy);
    toast({ title: "Copied to clipboard!", description: "The content has been copied." });
  };

  const statusIcons = {
    success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    idle: null,
  };

  const getOutputContent = () => {
    if (status === 'success' && (output.startsWith('{') || output.startsWith('['))) {
      return (
        <pre className="whitespace-pre-wrap break-all font-mono text-sm">
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
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8 font-headline">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary">JSON Formatter & Validator</h1>
          <p className="text-muted-foreground mt-2 text-lg">A simple and elegant tool to beautify and validate your JSON data.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Card */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>Paste your JSON below or upload a file.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <Textarea
                placeholder='{ "key": "value" }'
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setOutput('');
                  setStatus('idle');
                }}
                className="h-full min-h-[400px] resize-none font-mono text-sm"
                aria-label="JSON Input"
              />
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2 justify-start">
              <Button onClick={handleFormat} className="bg-accent hover:bg-accent/90">
                <Wand2 className="mr-2 h-4 w-4" /> Format
              </Button>
              <Button onClick={handleValidate} variant="secondary">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Validate
              </Button>
               <Button onClick={handleCopy} variant="outline">
                <ClipboardCopy className="mr-2 h-4 w-4" /> Copy
              </Button>
              <Button onClick={handleFileUploadClick} variant="outline">
                <Upload className="mr-2 h-4 w-4" /> Upload File
              </Button>
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".json"
              />
               <Button onClick={handleLoadExample} variant="ghost">
                <FileJson className="mr-2 h-4 w-4" /> Load Example
              </Button>
               <Button onClick={handleClear} variant="destructive" className="ml-auto">
                <Trash2 className="mr-2 h-4 w-4" /> Clear
              </Button>
            </CardFooter>
          </Card>

          {/* Output Card */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Result</CardTitle>
              <CardDescription>Validation or formatting results will appear here.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
               <div
                aria-live="polite"
                className={cn(
                  "w-full h-full min-h-[400px] rounded-md border p-4 bg-muted/50 overflow-auto",
                  {
                    "border-green-500/50 text-green-700 dark:text-green-400": status === "success",
                    "border-red-500/50 text-red-700 dark:text-red-400": status === "error",
                    "text-muted-foreground": status === "idle",
                  }
                )}
              >
                {getOutputContent()}
              </div>
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">Click the "Copy" button above to copy the input or the formatted result.</p>
             </CardFooter>
          </Card>
        </div>
        
        <footer className="text-center mt-12 py-4 border-t">
          <p className="text-sm text-muted-foreground">
            Built with love and code. Licensed under MIT.
          </p>
        </footer>
      </div>
    </main>
  );
}
