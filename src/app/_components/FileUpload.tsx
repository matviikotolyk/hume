import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Box, Text, Button } from "@radix-ui/themes";

interface FileUploadProps {
  onFileUploaded: (file: File) => void;
}

export default function FileUpload({ onFileUploaded }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) {
        setFile(acceptedFiles[0]);
        onFileUploaded(acceptedFiles[0]);
      }
    },
    [onFileUploaded],
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
      {file && <Text className="mt-2">File uploaded: {file.name}</Text>}
      <Button
        className="mt-4"
        onClick={() => document.querySelector("input")?.click()}
      >
        Select File
      </Button>
    </Box>
  );
}
