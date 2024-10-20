import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Box, Text, Button } from "@radix-ui/themes";
import pdfToText from "react-pdftotext";

interface FileUploadProps {
  onFileProcessed: (name: string, content: string) => void;
}

export default function FileUpload({ onFileProcessed }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const text = await pdfToText(file);
      onFileProcessed(file.name, text);
    } catch (error) {
      console.error("Failed to extract text from pdf", error);
      // You might want to show an error message to the user here
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) {
        setFile(acceptedFiles[0]);
        processFile(acceptedFiles[0]);
      }
    },
    [onFileProcessed],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  return (
    <Box className="w-full rounded-md border-2 border-dashed border-gray-300 p-4">
      <div {...getRootProps()} className="cursor-pointer">
        <input {...getInputProps()} />
        {isDragActive ? (
          <Text>Drop the PDF file here ...</Text>
        ) : (
          <Text>
            Drag &apos;n&apos; drop a PDF file here, or click to select a file
          </Text>
        )}
      </div>
      {file && (
        <Text
          weight={"medium"}
          style={{ marginTop: "1rem", marginBottom: "1rem" }}
        >
          File uploaded: {file.name}
        </Text>
      )}
      {isProcessing && <Text className="mt-2">Processing file...</Text>}
      <Button
        color="blue"
        style={{ marginTop: "1rem" }}
        className="hover:cursor-pointer"
        onClick={() => document.querySelector("input")?.click()}
        disabled={isProcessing}
      >
        Select File
      </Button>
    </Box>
  );
}
